import { apiRequest } from "@/services/api";
import { DoctorAvailability } from "@/types/doctor-profile.types";
import {
  CreateAppointmentRequestPayload,
  CreateRequestMessagePayload,
  CreateTestRequestPayload,
  DiscoveryLocationParams,
  DoctorDetail,
  DoctorDirectoryItem,
  DoctorRequestDetail,
  DoctorRequestListParams,
  DoctorRequestSummary,
  DoctorSearchParams,
  LabBranchDirectoryItem,
  LabDetail,
  LabDirectoryItem,
  LabRequestDetail,
  LabRequestListParams,
  LabRequestSummary,
  LabSearchParams,
  LabServiceDirectoryItem,
  PaginatedList,
  RequestMessage,
  RequestStatus,
} from "@/types/patient-booking.types";

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const mergeRecords = (...values: unknown[]) =>
  values.reduce<Record<string, unknown>>((result, value) => {
    Object.assign(result, asRecord(value));
    return result;
  }, {});

const unwrapPayload = (payload: unknown): Record<string, unknown> => {
  const record = asRecord(payload);

  if (record.data && typeof record.data === "object" && !Array.isArray(record.data)) {
    return asRecord(record.data);
  }

  return record;
};

const unwrapListPayload = (payload: unknown, keys: string[] = []): unknown[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  const record = asRecord(payload);
  const nested = asRecord(record.data);
  const candidates = [
    ...keys.map((key) => record[key]),
    record.items,
    record.results,
    record.doctors,
    record.labs,
    record.branches,
    record.services,
    ...keys.map((key) => nested[key]),
    nested.items,
    nested.results,
    nested.doctors,
    nested.labs,
    nested.branches,
    nested.services,
  ];

  return (candidates.find(Array.isArray) as unknown[]) ?? [];
};

const pickString = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
};

const pickNullableString = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      const normalized = value.trim();
      return normalized || null;
    }
  }

  return null;
};

const pickNumber = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
};

const pickNullableNumber = (record: Record<string, unknown>, keys: string[]) =>
  pickNumber(record, keys) ?? null;

const pickBoolean = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (typeof value === "number") {
      if (value === 1) return true;
      if (value === 0) return false;
    }
    if (typeof value === "string") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
    }
  }

  return undefined;
};

const pickStringArray = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);
    }

    if (typeof value === "string" && value.trim()) {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const pickRecord = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return asRecord(value);
    }
  }

  return {};
};

const resolveEntityId = (
  primary: Record<string, unknown>,
  secondary: Record<string, unknown>,
  primaryKeys: string[],
  fallbackKeys: string[] = ["id", "_id"],
) => pickString(primary, primaryKeys) ?? pickString(secondary, primaryKeys) ?? pickString(primary, fallbackKeys);

const buildAddress = (record: Record<string, unknown>) => {
  const parts = [
    pickNullableString(record, ["address", "location"]),
    pickNullableString(record, ["addressLine1", "address_line_1", "address1"]),
    pickNullableString(record, ["addressLine2", "address_line_2", "address2"]),
    pickNullableString(record, ["city"]),
    pickNullableString(record, ["state", "province"]),
    pickNullableString(record, ["country"]),
  ].filter(Boolean);

  return parts.length ? parts.join(", ") : null;
};

const buildDateTime = (record: Record<string, unknown>, dateKeys: string[], timeKeys: string[]) => {
  const explicit = pickNullableString(record, [
    "preferredDateTime",
    "preferred_datetime",
    "preferredAt",
    "preferred_at",
    "scheduledAt",
    ...dateKeys,
  ]);

  if (explicit && explicit.includes("T")) {
    return explicit;
  }

  const date = pickNullableString(record, dateKeys);
  const time = pickNullableString(record, timeKeys);

  if (date && time) {
    return `${date}T${time}`;
  }

  return explicit ?? date ?? null;
};

const buildQueryParams = <T extends Record<string, unknown>>(params?: T) =>
  Object.fromEntries(
    Object.entries(params ?? {}).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string") return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    }),
  );

const buildDiscoveryQueryParams = <T extends Record<string, unknown>>(params?: T) => {
  const normalized = buildQueryParams(params);
  const search =
    typeof normalized.search === "string" && normalized.search.trim()
      ? normalized.search.trim()
      : undefined;
  const specialty =
    typeof normalized.specialty === "string" && normalized.specialty.trim()
      ? normalized.specialty.trim()
      : undefined;
  const service =
    typeof normalized.service === "string" && normalized.service.trim()
      ? normalized.service.trim()
      : undefined;

  return {
    ...normalized,
    ...(search
      ? {
          search,
          q: search,
          query: search,
        }
      : {}),
    ...(specialty
      ? {
          specialty,
          specialization: specialty,
        }
      : {}),
    ...(service
      ? {
          service,
          category: service,
        }
      : {}),
  };
};

const normalizeRequestStatus = (value?: string | null): RequestStatus => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return "unknown";

  if (normalized === "canceled") return "cancelled";
  if (
    normalized === "pending" ||
    normalized === "approved" ||
    normalized === "rejected" ||
    normalized === "cancelled" ||
    normalized === "completed"
  ) {
    return normalized;
  }

  return "unknown";
};

const normalizeDoctorItem = (payload: unknown): DoctorDirectoryItem => {
  const raw = unwrapPayload(payload);
  const profile = mergeRecords(
    pickRecord(raw, ["doctorProfile", "doctor_profile"]),
    pickRecord(raw, ["professionalProfile", "professional_profile"]),
    pickRecord(raw, ["profile"]),
    pickRecord(raw, ["user"]),
  );
  const routeId = resolveEntityId(raw, profile, ["id", "_id", "userId", "user_id"], ["doctorId", "doctor_id"]);
  const doctorId = resolveEntityId(raw, profile, ["doctorId", "doctor_id"], ["id", "_id"]);
  const bio =
    pickNullableString(raw, ["bio", "about", "description", "summary"]) ??
    pickNullableString(profile, ["bio", "about", "description", "summary"]);
  const clinicName =
    pickNullableString(raw, ["clinicName", "clinic_name", "clinic"]) ??
    pickNullableString(profile, ["clinicName", "clinic_name", "clinic"]);
  const location =
    buildAddress(raw) ??
    buildAddress(profile) ??
    pickNullableString(raw, ["location", "clinicAddress", "clinic_address"]) ??
    pickNullableString(profile, ["location", "clinicAddress", "clinic_address"]);

  return {
    id: routeId ?? "",
    doctorId: doctorId ?? null,
    name:
      (
        pickString(raw, ["displayName", "display_name", "fullName", "full_name", "name"]) ??
        pickString(profile, ["displayName", "display_name", "fullName", "full_name", "name"]) ??
        [pickString(raw, ["firstName", "first_name"]), pickString(raw, ["lastName", "last_name"])]
          .filter(Boolean)
          .join(" ")
      ) || "Doctor name unavailable",
    specialty:
      pickNullableString(raw, ["specialty", "specialization", "department"]) ??
      pickNullableString(profile, ["specialty", "specialization", "department"]),
    subspecialty:
      pickNullableString(raw, ["subspecialty", "sub_specialty"]) ??
      pickNullableString(profile, ["subspecialty", "sub_specialty"]),
    bio,
    clinicName,
    location,
    avatarUrl:
      pickNullableString(raw, ["avatarUrl", "avatar", "profileImageUrl", "imageUrl"]) ??
      pickNullableString(profile, ["avatarUrl", "avatar", "profileImageUrl", "imageUrl"]),
    experienceYears:
      pickNullableNumber(raw, ["yearsOfExperience", "years_of_experience", "experienceYears", "experience"]) ??
      pickNullableNumber(profile, ["yearsOfExperience", "years_of_experience", "experienceYears", "experience"]),
    consultationFee:
      pickNullableNumber(raw, ["consultationFee", "consultation_fee", "fee", "price", "consultationPrice"]) ??
      pickNullableNumber(profile, ["consultationFee", "consultation_fee", "fee", "price", "consultationPrice"]),
    currency:
      pickNullableString(raw, ["currency", "currencyCode", "currency_code"]) ??
      pickNullableString(profile, ["currency", "currencyCode", "currency_code"]),
    rating: pickNullableNumber(raw, ["rating", "averageRating", "average_rating"]),
    reviewCount: pickNullableNumber(raw, ["reviewCount", "review_count", "reviewsCount", "reviews"]),
    distanceKm: pickNullableNumber(raw, ["distanceKm", "distance_km", "distance"]),
  };
};

const normalizeDoctorDetail = (payload: unknown): DoctorDetail => {
  const raw = unwrapPayload(payload);
  const professional = mergeRecords(
    pickRecord(raw, ["professionalProfile", "professional_profile"]),
    pickRecord(raw, ["doctorProfile", "doctor_profile"]),
  );
  const base = normalizeDoctorItem(raw);

  return {
    ...base,
    phone:
      pickNullableString(raw, ["phone", "phoneNumber", "mobile"]) ??
      pickNullableString(professional, ["phone", "phoneNumber", "mobile"]),
    email:
      pickNullableString(raw, ["email"]) ??
      pickNullableString(professional, ["email"]),
    languages: pickStringArray(raw, ["languages"]).length
      ? pickStringArray(raw, ["languages"])
      : pickStringArray(professional, ["languages"]),
    education: pickStringArray(raw, ["education", "degrees"]).length
      ? pickStringArray(raw, ["education", "degrees"])
      : pickStringArray(professional, ["education", "degrees"]),
    certifications: pickStringArray(raw, ["certifications", "licenses"]).length
      ? pickStringArray(raw, ["certifications", "licenses"])
      : pickStringArray(professional, ["certifications", "licenses"]),
    servicesOffered: pickStringArray(raw, ["servicesOffered", "services_offered", "services"]).length
      ? pickStringArray(raw, ["servicesOffered", "services_offered", "services"])
      : pickStringArray(professional, ["servicesOffered", "services_offered", "services"]),
  };
};

const normalizeDoctorAvailability = (payload: unknown): DoctorAvailability => {
  const raw = unwrapPayload(payload);
  const scheduleContainer = mergeRecords(
    pickRecord(raw, ["weeklySchedule", "weekly_schedule"]),
    pickRecord(raw, ["schedule"]),
  );
  const daysSource = [
    ...unwrapListPayload(raw.weeklySchedule, []),
    ...unwrapListPayload(raw.schedule, ["days"]),
    ...unwrapListPayload(raw.days, []),
    ...unwrapListPayload(scheduleContainer.days, []),
  ];

  const weeklySchedule =
    daysSource.length > 0
      ? daysSource.map((item) => {
          const record = asRecord(item);
          return {
            dayOfWeek:
              pickString(record, ["dayOfWeek", "day_of_week", "day", "weekday"]) ?? "Unknown",
            isAvailable: pickBoolean(record, ["isAvailable", "is_available", "available"]) ?? false,
            startTime: pickNullableString(record, ["startTime", "start_time", "from"]),
            endTime: pickNullableString(record, ["endTime", "end_time", "to"]),
            breakStartTime: pickNullableString(record, ["breakStartTime", "break_start_time"]),
            breakEndTime: pickNullableString(record, ["breakEndTime", "break_end_time"]),
            maxAppointments: pickNullableNumber(record, ["maxAppointments", "max_appointments", "capacity"]),
          };
        })
      : ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
          .map((dayKey) => {
            const record = asRecord(scheduleContainer[dayKey] ?? raw[dayKey]);
            if (!Object.keys(record).length) return null;

            return {
              dayOfWeek: dayKey.charAt(0).toUpperCase() + dayKey.slice(1),
              isAvailable: pickBoolean(record, ["isAvailable", "is_available", "available"]) ?? false,
              startTime: pickNullableString(record, ["startTime", "start_time", "from"]),
              endTime: pickNullableString(record, ["endTime", "end_time", "to"]),
              breakStartTime: pickNullableString(record, ["breakStartTime", "break_start_time"]),
              breakEndTime: pickNullableString(record, ["breakEndTime", "break_end_time"]),
              maxAppointments: pickNullableNumber(record, ["maxAppointments", "max_appointments", "capacity"]),
            };
          })
          .filter((day): day is NonNullable<typeof day> => Boolean(day));

  return {
    timezone: pickString(raw, ["timezone", "timeZone"]) ?? pickString(scheduleContainer, ["timezone", "timeZone"]),
    appointmentDurationMinutes: pickNullableNumber(raw, [
      "appointmentDurationMinutes",
      "appointment_duration_minutes",
      "slotDurationMinutes",
    ]) ?? pickNullableNumber(scheduleContainer, [
      "appointmentDurationMinutes",
      "appointment_duration_minutes",
      "slotDurationMinutes",
    ]),
    bufferBetweenAppointmentsMinutes: pickNullableNumber(raw, [
      "bufferBetweenAppointmentsMinutes",
      "buffer_between_appointments_minutes",
      "bufferMinutes",
    ]) ?? pickNullableNumber(scheduleContainer, [
      "bufferBetweenAppointmentsMinutes",
      "buffer_between_appointments_minutes",
      "bufferMinutes",
    ]),
    notes:
      pickNullableString(raw, ["notes", "availabilityNotes", "availability_notes"]) ??
      pickNullableString(scheduleContainer, ["notes", "availabilityNotes", "availability_notes"]),
    weeklySchedule,
  };
};

const normalizeLabItem = (payload: unknown): LabDirectoryItem => {
  const raw = unwrapPayload(payload);
  const address = buildAddress(raw) ?? pickNullableString(raw, ["location"]);
  const routeId = resolveEntityId(raw, raw, ["id", "_id", "userId", "user_id"], ["labId", "lab_id"]);
  const labId = resolveEntityId(raw, raw, ["labId", "lab_id"], ["id", "_id"]);

  return {
    id: routeId ?? "",
    labId: labId ?? null,
    name:
      pickString(raw, ["displayName", "display_name", "legalName", "legal_name", "name"]) ??
      "Lab name unavailable",
    description: pickNullableString(raw, ["description", "about", "bio", "summary"]),
    address,
    phone: pickNullableString(raw, ["phone", "phoneNumber", "mobile"]),
    email: pickNullableString(raw, ["email"]),
    logoUrl: pickNullableString(raw, ["logoUrl", "logo", "imageUrl"]),
    accreditation: pickNullableString(raw, ["accreditation", "certification"]),
    homeCollectionAvailable: pickBoolean(raw, [
      "homeCollectionAvailable",
      "home_collection_available",
      "supportsHomeCollection",
    ]) ?? null,
    rating: pickNullableNumber(raw, ["rating", "averageRating", "average_rating"]),
    reviewCount: pickNullableNumber(raw, ["reviewCount", "review_count", "reviewsCount"]),
    distanceKm: pickNullableNumber(raw, ["distanceKm", "distance_km", "distance"]),
  };
};

const normalizeLabDetail = (payload: unknown): LabDetail => {
  const raw = unwrapPayload(payload);
  const base = normalizeLabItem(raw);

  return {
    ...base,
    website: pickNullableString(raw, ["website", "websiteUrl", "website_url"]),
    establishedYear: pickNullableNumber(raw, ["establishedYear", "established_year", "foundedYear"]),
    licenseNumber: pickNullableString(raw, ["licenseNumber", "license_number"]),
  };
};

const normalizeLabBranch = (payload: unknown): LabBranchDirectoryItem => {
  const raw = unwrapPayload(payload);

  return {
    id: String(raw.id ?? raw._id ?? raw.branchId ?? raw.branch_id ?? ""),
    name: pickString(raw, ["name", "branchName", "branch_name"]) ?? "Branch name unavailable",
    address: buildAddress(raw) ?? pickNullableString(raw, ["location"]),
    phone: pickNullableString(raw, ["phone", "phoneNumber"]),
    email: pickNullableString(raw, ["email"]),
    operatingHours: pickNullableString(raw, ["operatingHours", "operating_hours", "hours"]),
    isMainBranch: pickBoolean(raw, ["isMainBranch", "is_main_branch", "mainBranch"]) ?? null,
  };
};

const normalizeLabService = (payload: unknown): LabServiceDirectoryItem => {
  const raw = unwrapPayload(payload);

  return {
    id: String(raw.id ?? raw._id ?? raw.serviceId ?? raw.service_id ?? ""),
    name: pickString(raw, ["name", "serviceName", "service_name"]) ?? "Service name unavailable",
    category: pickNullableString(raw, ["category", "serviceCategory", "service_category"]),
    description: pickNullableString(raw, ["description", "details"]),
    sampleType: pickNullableString(raw, ["sampleType", "sample_type"]),
    turnaroundTime: pickNullableString(raw, ["turnaroundTime", "turnaround_time", "duration"]),
    price: pickNullableNumber(raw, ["price", "amount", "cost"]),
    currency: pickNullableString(raw, ["currency"]),
    preparationInstructions: pickNullableString(raw, [
      "preparationInstructions",
      "preparation_instructions",
      "instructions",
    ]),
  };
};

const normalizeMessage = (payload: unknown): RequestMessage => {
  const raw = unwrapPayload(payload);
  const sender = mergeRecords(
    pickRecord(raw, ["sender", "author", "createdBy"]),
    pickRecord(raw, ["doctor"]),
    pickRecord(raw, ["lab"]),
    pickRecord(raw, ["patient"]),
  );

  return {
    id: String(raw.id ?? raw._id ?? raw.messageId ?? raw.message_id ?? crypto.randomUUID()),
    senderRole:
      pickString(raw, ["senderRole", "sender_role", "role"]) ??
      pickString(sender, ["role"]) ??
      "Unknown",
    senderName:
      pickNullableString(raw, ["senderName", "sender_name"]) ??
      pickNullableString(sender, ["displayName", "name", "fullName", "full_name"]),
    message: pickString(raw, ["message", "content", "text", "body"]) ?? "",
    createdAt: pickNullableString(raw, ["createdAt", "created_at", "sentAt", "sent_at"]),
  };
};

const resolveMessageList = (raw: Record<string, unknown>) =>
  [
    ...unwrapListPayload(raw.messages, ["items"]),
    ...unwrapListPayload(raw.thread, ["messages"]),
  ]
    .map(normalizeMessage)
    .filter((message, index, all) => all.findIndex((item) => item.id === message.id) === index);

const normalizeDoctorRequestSummary = (payload: unknown): DoctorRequestSummary => {
  const raw = unwrapPayload(payload);
  const doctor = mergeRecords(
    pickRecord(raw, ["doctor", "provider"]),
    pickRecord(raw, ["doctorProfile", "doctor_profile"]),
  );
  const messages = resolveMessageList(raw);
  const latestMessage = messages[messages.length - 1];
  const status = normalizeRequestStatus(
    pickNullableString(raw, ["status", "requestStatus", "request_status"]),
  );

  return {
    id: String(raw.id ?? raw._id ?? raw.requestId ?? raw.request_id ?? ""),
    requestNumber: pickNullableString(raw, ["requestNumber", "request_number", "referenceNumber"]),
    status,
    providerId:
      pickNullableString(raw, ["doctorId", "doctor_id"]) ??
      pickNullableString(doctor, ["id", "_id", "doctorId", "doctor_id"]),
    doctorId:
      pickNullableString(raw, ["doctorId", "doctor_id"]) ??
      pickNullableString(doctor, ["id", "_id", "doctorId", "doctor_id"]),
    providerName:
      pickString(raw, ["doctorName", "doctor_name", "providerName"]) ??
      pickString(doctor, ["displayName", "name", "fullName", "full_name"]) ??
      "Doctor",
    providerSubtitle:
      pickNullableString(raw, ["doctorSpecialty", "doctor_specialty", "specialty"]) ??
      pickNullableString(doctor, ["specialty", "specialization"]),
    providerLocation: buildAddress(raw) ?? buildAddress(doctor),
    preferredDate: pickNullableString(raw, ["preferredDate", "preferred_date", "date"]),
    preferredTime: pickNullableString(raw, ["preferredTime", "preferred_time", "time"]),
    preferredDateTime: buildDateTime(
      raw,
      ["preferredDate", "preferred_date", "date"],
      ["preferredTime", "preferred_time", "time"],
    ),
    latestMessage:
      pickNullableString(raw, ["latestMessage", "latest_message", "lastMessage"]) ??
      latestMessage?.message ??
      null,
    latestMessageAt:
      pickNullableString(raw, ["latestMessageAt", "latest_message_at", "lastMessageAt"]) ??
      latestMessage?.createdAt ??
      null,
    patientNote: pickNullableString(raw, ["note", "notes", "patientNote", "patient_note"]),
    createdAt: pickNullableString(raw, ["createdAt", "created_at"]),
    updatedAt: pickNullableString(raw, ["updatedAt", "updated_at"]),
    canCancel:
      pickBoolean(raw, ["canCancel", "can_cancel"]) ??
      (status === "pending" || status === "approved"),
    canReply:
      pickBoolean(raw, ["canReply", "can_reply"]) ??
      (status === "pending" || status === "approved"),
    visitType: pickNullableString(raw, ["visitType", "visit_type", "type"]),
    reason: pickNullableString(raw, ["reason", "chiefComplaint", "chief_complaint"]),
  };
};

const normalizeDoctorRequestDetail = (payload: unknown): DoctorRequestDetail => {
  const raw = unwrapPayload(payload);
  const summary = normalizeDoctorRequestSummary(raw);

  return {
    ...summary,
    messages: resolveMessageList(raw),
    availability: raw.availability ? normalizeDoctorAvailability(raw.availability) : null,
  };
};

const normalizeLabRequestSummary = (payload: unknown): LabRequestSummary => {
  const raw = unwrapPayload(payload);
  const lab = mergeRecords(pickRecord(raw, ["lab", "provider"]), pickRecord(raw, ["labProfile"]));
  const branch = mergeRecords(pickRecord(raw, ["branch", "labBranch"]));
  const messages = resolveMessageList(raw);
  const latestMessage = messages[messages.length - 1];
  const serviceNames = [
    ...pickStringArray(raw, ["serviceNames", "service_names", "selectedServices"]),
    ...unwrapListPayload(raw.services, ["items"]).map((item) =>
      pickString(asRecord(item), ["name", "serviceName", "service_name"]) ?? "",
    ),
  ].filter(Boolean);
  const status = normalizeRequestStatus(
    pickNullableString(raw, ["status", "requestStatus", "request_status"]),
  );

  return {
    id: String(raw.id ?? raw._id ?? raw.requestId ?? raw.request_id ?? ""),
    requestNumber: pickNullableString(raw, ["requestNumber", "request_number", "referenceNumber"]),
    status,
    providerId:
      pickNullableString(raw, ["labId", "lab_id"]) ??
      pickNullableString(lab, ["id", "_id", "labId", "lab_id"]),
    labId:
      pickNullableString(raw, ["labId", "lab_id"]) ??
      pickNullableString(lab, ["id", "_id", "labId", "lab_id"]),
    providerName:
      pickString(raw, ["labName", "lab_name", "providerName"]) ??
      pickString(lab, ["displayName", "name", "legalName", "legal_name"]) ??
      "Laboratory",
    providerSubtitle:
      pickNullableString(raw, ["branchName", "branch_name"]) ??
      pickNullableString(branch, ["name"]),
    providerLocation: buildAddress(raw) ?? buildAddress(branch) ?? buildAddress(lab),
    preferredDate: pickNullableString(raw, ["preferredDate", "preferred_date", "date"]),
    preferredTime: pickNullableString(raw, ["preferredTime", "preferred_time", "time"]),
    preferredDateTime: buildDateTime(
      raw,
      ["preferredDate", "preferred_date", "date"],
      ["preferredTime", "preferred_time", "time"],
    ),
    latestMessage:
      pickNullableString(raw, ["latestMessage", "latest_message", "lastMessage"]) ??
      latestMessage?.message ??
      null,
    latestMessageAt:
      pickNullableString(raw, ["latestMessageAt", "latest_message_at", "lastMessageAt"]) ??
      latestMessage?.createdAt ??
      null,
    patientNote: pickNullableString(raw, ["note", "notes", "patientNote", "patient_note"]),
    createdAt: pickNullableString(raw, ["createdAt", "created_at"]),
    updatedAt: pickNullableString(raw, ["updatedAt", "updated_at"]),
    canCancel:
      pickBoolean(raw, ["canCancel", "can_cancel"]) ??
      (status === "pending" || status === "approved"),
    canReply:
      pickBoolean(raw, ["canReply", "can_reply"]) ??
      (status === "pending" || status === "approved"),
    branchId:
      pickNullableString(raw, ["branchId", "branch_id"]) ??
      pickNullableString(branch, ["id", "_id", "branchId", "branch_id"]),
    branchName:
      pickNullableString(raw, ["branchName", "branch_name"]) ??
      pickNullableString(branch, ["name"]),
    selectedServices: serviceNames,
    homeCollection:
      pickBoolean(raw, ["homeCollection", "home_collection", "homeCollectionRequested"]) ?? null,
  };
};

const normalizeLabRequestDetail = (payload: unknown): LabRequestDetail => {
  const raw = unwrapPayload(payload);
  const summary = normalizeLabRequestSummary(raw);

  return {
    ...summary,
    messages: resolveMessageList(raw),
  };
};

const normalizePaginatedResponse = <T>(
  payload: unknown,
  mapItem: (value: unknown) => T,
): PaginatedList<T> => {
  const items = unwrapListPayload(payload, ["items", "requests"]);
  const meta = mergeRecords(asRecord(payload), asRecord(asRecord(payload).data), asRecord(asRecord(payload).meta));
  const limit = pickNumber(meta, ["limit", "perPage", "pageSize"]) ?? Math.max(items.length, 1);
  const total = pickNumber(meta, ["total", "totalCount", "count"]) ?? items.length;
  const totalPages =
    pickNumber(meta, ["totalPages", "pages", "pageCount"]) ?? Math.max(1, Math.ceil(total / limit));
  const page = pickNumber(meta, ["page", "currentPage"]) ?? 1;

  return {
    data: items.map(mapItem),
    page,
    limit,
    total,
    totalPages,
    hasNextPage:
      pickBoolean(meta, ["hasNextPage", "hasMore", "has_next_page"]) ?? page < totalPages,
    hasPreviousPage:
      pickBoolean(meta, ["hasPreviousPage", "hasPrevPage", "has_previous_page"]) ?? page > 1,
  };
};

export const patientBookingService = {
  async getDoctors(params?: DoctorSearchParams): Promise<DoctorDirectoryItem[]> {
    const response = await apiRequest<unknown>("/api/v1/doctors", {
      method: "GET",
      params: buildDiscoveryQueryParams(params),
    });

    return unwrapListPayload(response, ["doctors", "items"]).map(normalizeDoctorItem);
  },

  async getNearbyDoctors(params: DiscoveryLocationParams): Promise<DoctorDirectoryItem[]> {
    const query = new URLSearchParams({
      lat: String(params.latitude),
      lng: String(params.longitude),
      radiusKm: String(params.radiusKm ?? 20),
    });
    const discoveryParams = buildDiscoveryQueryParams({
      search: params.search,
      specialty: params.specialty,
    });
    Object.entries(discoveryParams).forEach(([key, value]) => {
      query.set(key, String(value));
    });

    const response = await apiRequest<unknown>(`/api/v1/doctors/near?${query.toString()}`, {
      method: "GET",
    });

    return unwrapListPayload(response, ["doctors", "items"]).map(normalizeDoctorItem);
  },

  async getDoctorById(doctorId: string): Promise<DoctorDetail> {
    const response = await apiRequest<unknown>(`/api/v1/doctors/${doctorId}`, {
      method: "GET",
    });

    return normalizeDoctorDetail(response);
  },

  async getDoctorAvailability(doctorId: string): Promise<DoctorAvailability> {
    const response = await apiRequest<unknown>(`/api/v1/doctors/${doctorId}/availability`, {
      method: "GET",
    });

    return normalizeDoctorAvailability(response);
  },

  async getLabs(params?: LabSearchParams): Promise<LabDirectoryItem[]> {
    const response = await apiRequest<unknown>("/api/v1/labs", {
      method: "GET",
      params: buildDiscoveryQueryParams(params),
    });

    return unwrapListPayload(response, ["labs", "items"]).map(normalizeLabItem);
  },

  async getNearbyLabs(params: DiscoveryLocationParams): Promise<LabDirectoryItem[]> {
    const query = new URLSearchParams({
      lat: String(params.latitude),
      lng: String(params.longitude),
      radiusKm: String(params.radiusKm ?? 20),
    });
    const discoveryParams = buildDiscoveryQueryParams({
      search: params.search,
      service: params.service,
    });
    Object.entries(discoveryParams).forEach(([key, value]) => {
      query.set(key, String(value));
    });

    const response = await apiRequest<unknown>(`/api/v1/labs/near?${query.toString()}`, {
      method: "GET",
    });

    return unwrapListPayload(response, ["labs", "items"]).map(normalizeLabItem);
  },

  async getLabById(labId: string): Promise<LabDetail> {
    const response = await apiRequest<unknown>(`/api/v1/labs/${labId}`, {
      method: "GET",
    });

    return normalizeLabDetail(response);
  },

  async getLabBranches(labId: string): Promise<LabBranchDirectoryItem[]> {
    const response = await apiRequest<unknown>(`/api/v1/labs/${labId}/branches`, {
      method: "GET",
    });

    return unwrapListPayload(response, ["branches", "items"]).map(normalizeLabBranch);
  },

  async getLabServices(labId: string): Promise<LabServiceDirectoryItem[]> {
    const response = await apiRequest<unknown>(`/api/v1/labs/${labId}/services`, {
      method: "GET",
    });

    return unwrapListPayload(response, ["services", "items"]).map(normalizeLabService);
  },

  async createAppointmentRequest(payload: CreateAppointmentRequestPayload): Promise<DoctorRequestDetail> {
    const response = await apiRequest<unknown>("/api/v1/appointment-requests", {
      method: "POST",
      auth: true,
      body: payload,
    });

    return normalizeDoctorRequestDetail(response);
  },

  async getAppointmentRequests(params?: DoctorRequestListParams): Promise<PaginatedList<DoctorRequestSummary>> {
    const response = await apiRequest<unknown>("/api/v1/appointment-requests", {
      method: "GET",
      auth: true,
      params: buildQueryParams(params),
    });

    return normalizePaginatedResponse(response, normalizeDoctorRequestSummary);
  },

  async getAppointmentRequestById(requestId: string): Promise<DoctorRequestDetail> {
    const response = await apiRequest<unknown>(`/api/v1/appointment-requests/${requestId}`, {
      method: "GET",
      auth: true,
    });

    return normalizeDoctorRequestDetail(response);
  },

  async cancelAppointmentRequest(requestId: string): Promise<DoctorRequestDetail> {
    const response = await apiRequest<unknown>(`/api/v1/appointment-requests/${requestId}/cancel`, {
      method: "PATCH",
      auth: true,
    });

    return normalizeDoctorRequestDetail(response);
  },

  async sendAppointmentRequestMessage(
    requestId: string,
    payload: CreateRequestMessagePayload,
  ): Promise<RequestMessage> {
    const response = await apiRequest<unknown>(`/api/v1/appointment-requests/${requestId}/messages`, {
      method: "POST",
      auth: true,
      body: payload,
    });

    return normalizeMessage(response);
  },

  async createTestRequest(payload: CreateTestRequestPayload): Promise<LabRequestDetail> {
    const response = await apiRequest<unknown>("/api/v1/test-requests", {
      method: "POST",
      auth: true,
      body: payload,
    });

    return normalizeLabRequestDetail(response);
  },

  async getTestRequests(params?: LabRequestListParams): Promise<PaginatedList<LabRequestSummary>> {
    const response = await apiRequest<unknown>("/api/v1/test-requests", {
      method: "GET",
      auth: true,
      params: buildQueryParams(params),
    });

    return normalizePaginatedResponse(response, normalizeLabRequestSummary);
  },

  async getTestRequestById(requestId: string): Promise<LabRequestDetail> {
    const response = await apiRequest<unknown>(`/api/v1/test-requests/${requestId}`, {
      method: "GET",
      auth: true,
    });

    return normalizeLabRequestDetail(response);
  },

  async cancelTestRequest(requestId: string): Promise<LabRequestDetail> {
    const response = await apiRequest<unknown>(`/api/v1/test-requests/${requestId}/cancel`, {
      method: "PATCH",
      auth: true,
    });

    return normalizeLabRequestDetail(response);
  },

  async sendTestRequestMessage(
    requestId: string,
    payload: CreateRequestMessagePayload,
  ): Promise<RequestMessage> {
    const response = await apiRequest<unknown>(`/api/v1/test-requests/${requestId}/messages`, {
      method: "POST",
      auth: true,
      body: payload,
    });

    return normalizeMessage(response);
  },
};
