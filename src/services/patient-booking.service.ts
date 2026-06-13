import { apiRequest } from "@/services/api";
import { DoctorAvailability } from "@/types/doctor-profile.types";
import {
  CreateAppointmentRequestPayload,
  CreateRequestMessagePayload,
  CreateTestRequestPayload,
  DiscoveryLocationParams,
  DoctorAvailableSlot,
  DoctorAvailableSlots,
  DoctorAvailableSlotsParams,
  LabAvailableSlots,
  LabAvailableSlotsParams,
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

const pickIdentifier = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return undefined;
};

const pickNullableIdentifier = (record: Record<string, unknown>, keys: string[]) =>
  pickIdentifier(record, keys) ?? null;

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

const normalizeIdentityPart = (value: unknown) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : "";
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return "";
};

const buildIdentityKey = (...parts: unknown[]) => {
  const normalized = parts.map(normalizeIdentityPart).filter(Boolean);
  return normalized.length ? normalized.join("::") : null;
};

const dedupeByIdentity = <T>(items: T[], getIdentity: (item: T) => string | null) => {
  const seen = new Set<string>();

  return items.filter((item) => {
    const identity = getIdentity(item);
    if (!identity) {
      return true;
    }

    if (seen.has(identity)) {
      return false;
    }

    seen.add(identity);
    return true;
  });
};

const resolveEntityId = (
  primary: Record<string, unknown>,
  secondary: Record<string, unknown>,
  primaryKeys: string[],
  fallbackKeys: string[] = ["id", "_id"],
) =>
  pickIdentifier(primary, primaryKeys) ??
  pickIdentifier(secondary, primaryKeys) ??
  pickIdentifier(primary, fallbackKeys);

const buildAddress = (record: Record<string, unknown>) => {
  const parts = [
    pickNullableString(record, ["address", "location", "addressText", "address_text", "locationText", "location_text"]),
    pickNullableString(record, ["addressLine1", "address_line_1", "address1"]),
    pickNullableString(record, ["addressLine2", "address_line_2", "address2"]),
    pickNullableString(record, ["street", "streetName", "street_name"]),
    pickNullableString(record, ["district", "area", "neighborhood"]),
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
    "slotStart",
    "slot_start",
    "slotStartAt",
    "slot_start_at",
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

const normalizeConsultationType = (value?: string | null) => {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return undefined;

  if (normalized === "in-person" || normalized === "in person" || normalized === "clinic") {
    return "IN_PERSON";
  }

  if (normalized === "video" || normalized === "virtual" || normalized === "online") {
    return "VIDEO";
  }

  if (normalized === "phone" || normalized === "call") {
    return "PHONE";
  }

  if (normalized === "home visit" || normalized === "home-visit" || normalized === "home_visit") {
    return "HOME_VISIT";
  }

  return value?.trim() || undefined;
};

const normalizeVisitTypeLabel = (value?: string | null) => {
  const normalized = value?.trim();
  if (!normalized) return null;
  const key = normalized.toLowerCase().replace(/\s+/g, "_");

  if (["in_person", "in-person", "in person", "clinic"].includes(key)) {
    return "Clinic";
  }
  if (["video", "video_call", "virtual", "online"].includes(key)) {
    return "Video";
  }
  if (["phone", "phone_call", "call"].includes(key)) {
    return "Phone";
  }
  if (["home_visit", "home-visit", "home visit"].includes(key)) {
    return "Home Visit";
  }

  return normalized;
};

const buildPreferredDateTimeValue = (date?: string, time?: string) => {
  const normalizedDate = date?.trim();
  const normalizedTime = time?.trim();

  if (!normalizedDate || !normalizedTime) {
    return undefined;
  }

  const timeWithSeconds = normalizedTime.length === 5 ? `${normalizedTime}:00` : normalizedTime;
  return `${normalizedDate}T${timeWithSeconds}`;
};

const buildAppointmentRequestBody = (payload: CreateAppointmentRequestPayload) =>
  buildQueryParams({
    doctorId: payload.doctorId,
    doctor_id: payload.doctorId,
    slotStart: payload.slotStart,
    slot_start: payload.slotStart,
    sourceTestRequestId: payload.sourceTestRequestId,
    preferredDate: payload.preferredDate,
    preferred_date: payload.preferredDate,
    preferredTime: payload.preferredTime,
    preferred_time: buildPreferredDateTimeValue(payload.preferredDate, payload.preferredTime),
    preferredDateTime: buildPreferredDateTimeValue(payload.preferredDate, payload.preferredTime),
    preferred_datetime: buildPreferredDateTimeValue(payload.preferredDate, payload.preferredTime),
    visitType: normalizeConsultationType(payload.visitType),
    visit_type: normalizeConsultationType(payload.visitType),
    consultationType: normalizeConsultationType(payload.visitType),
    consultation_type: normalizeConsultationType(payload.visitType),
    reason: payload.reason,
    note: payload.note,
    phone: payload.phone,
  });

const buildTestRequestBody = (payload: CreateTestRequestPayload) =>
  buildQueryParams({
    labId: payload.labId,
    lab_id: payload.labId,
    slotStart: payload.slotStart,
    slot_start: payload.slotStart,
    preferredTime: payload.slotStart,
    preferred_time: payload.slotStart,
    preferredDateTime: payload.slotStart,
    preferred_datetime: payload.slotStart,
    branchId: payload.branchId,
    branch_id: payload.branchId,
    serviceIds: payload.serviceIds,
    service_ids: payload.serviceIds,
    note: payload.note,
    homeCollection: payload.homeCollection,
    home_collection: payload.homeCollection,
    sample_collection_required: payload.homeCollection,
  });

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

const normalizeDoctorAvailableSlot = (payload: unknown): DoctorAvailableSlot | null => {
  const raw = asRecord(payload);
  const startAt =
    pickString(raw, ["startAt", "start_at", "slotStart", "slot_start", "from"]) ?? "";

  if (!startAt) {
    return null;
  }

  return {
    startAt,
    endAt: pickNullableString(raw, ["endAt", "end_at", "to"]) ?? null,
    date: pickNullableString(raw, ["date", "day"]) ?? null,
    time: pickNullableString(raw, ["time", "startTime", "start_time"]) ?? null,
  };
};

const normalizeDoctorAvailableSlots = (payload: unknown): DoctorAvailableSlots => {
  const raw = unwrapPayload(payload);
  const range = mergeRecords(pickRecord(raw, ["range"]), raw);

  const slots = unwrapListPayload(raw.slots, ["slots"])
    .map(normalizeDoctorAvailableSlot)
    .filter((slot): slot is DoctorAvailableSlot => Boolean(slot));

  return {
    doctorId:
      pickIdentifier(raw, ["doctorId", "doctor_id"]) ??
      pickIdentifier(range, ["doctorId", "doctor_id"]) ??
      "",
    timezone:
      pickNullableString(raw, ["timezone", "timeZone"]) ??
      pickNullableString(range, ["timezone", "timeZone"]) ??
      null,
    slotDurationMinutes:
      pickNullableNumber(raw, ["slotDurationMinutes", "slot_duration_minutes", "appointmentDurationMinutes"]) ??
      pickNullableNumber(range, ["slotDurationMinutes", "slot_duration_minutes", "appointmentDurationMinutes"]) ??
      null,
    range: {
      startDate:
        pickString(range, ["startDate", "start_date"]) ??
        pickString(raw, ["startDate", "start_date"]) ??
        "",
      endDate:
        pickString(range, ["endDate", "end_date"]) ??
        pickString(raw, ["endDate", "end_date"]) ??
        "",
    },
    slots,
  };
};

type NormalizedRequestStatus = {
  status: RequestStatus;
  rawStatus: string | null;
  label: string;
};

const sentenceCase = (value: string) => {
  const cleaned = value.replace(/[_-]+/g, " ").trim().toLowerCase();
  if (!cleaned) return "";
  return `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}`;
};

const normalizeGenericRequestStatus = (normalized: string): RequestStatus => {
  if (!normalized) return "unknown";
  if (normalized === "canceled" || normalized === "cancelled") return "rejected";
  if (["accepted", "approve", "approved", "confirmed", "ready", "reported"].includes(normalized)) {
    return "approved";
  }
  if (["declined", "deny", "denied", "reject", "rejected"].includes(normalized)) {
    return "rejected";
  }
  if (["requested", "request_submitted", "under_review", "in_review", "review"].includes(normalized)) {
    return "pending";
  }
  if (normalized === "pending" || normalized === "rejected" || normalized === "completed") {
    return normalized;
  }
  return "unknown";
};

const normalizeRequestStatus = (
  value?: string | null,
  context: "doctor" | "lab" = "doctor",
): NormalizedRequestStatus => {
  const rawStatus = typeof value === "string" ? value.trim() : "";
  if (!rawStatus) {
    return { status: "unknown", rawStatus: null, label: "Unknown" };
  }

  const normalized = rawStatus.toLowerCase();
  const normalizedKey = rawStatus.replace(/[\s-]+/g, "_").toUpperCase();

  if (context === "lab") {
    const labStatusMap: Record<string, { status: RequestStatus; label: string }> = {
      PENDING: { status: "pending", label: "Pending" },
      SAMPLE_COLLECTION_REQUESTED: { status: "pending", label: "Sample collection requested" },
      SAMPLE_COLLECTED: { status: "pending", label: "Sample collected" },
      IN_PROGRESS: { status: "pending", label: "In progress" },
      RESULT_UPLOADED: { status: "pending", label: "Result uploaded" },
      ASSIGNED_TO_DOCTOR: { status: "pending", label: "Result uploaded" },
      COMPLETED: { status: "completed", label: "Completed" },
      CANCELLED: { status: "rejected", label: "Rejected" },
      CANCELED: { status: "rejected", label: "Rejected" },
    };

    const mapped = labStatusMap[normalizedKey];
    if (mapped) {
      return { status: mapped.status, rawStatus, label: mapped.label };
    }
  }

  const status = normalizeGenericRequestStatus(normalized);
  const label =
    status === "unknown"
      ? sentenceCase(rawStatus)
      : sentenceCase(status === "cancelled" ? "cancelled" : status);

  return { status, rawStatus, label };
};

const normalizeDoctorItem = (payload: unknown): DoctorDirectoryItem => {
  const raw = unwrapPayload(payload);
  const profile = mergeRecords(
    pickRecord(raw, ["doctorProfile", "doctor_profile"]),
    pickRecord(raw, ["professionalProfile", "professional_profile"]),
    pickRecord(raw, ["profile"]),
    pickRecord(raw, ["user"]),
  );
  const routeId = resolveEntityId(raw, profile, ["id", "_id", "doctorId", "doctor_id"], ["userId", "user_id"]);
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
    id: routeId ? String(routeId) : "",
    doctorId: doctorId ? String(doctorId) : null,
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
      ? dedupeByIdentity(
        daysSource.map((item) => {
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
        }),
        (day) =>
          buildIdentityKey(
            day.dayOfWeek,
            day.startTime,
            day.endTime,
            day.breakStartTime,
            day.breakEndTime,
          ),
      )
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
  const routeId = resolveEntityId(raw, raw, ["id", "_id", "labId", "lab_id"], ["userId", "user_id"]);
  const labId = resolveEntityId(raw, raw, ["labId", "lab_id"], ["id", "_id"]);

  return {
    id: routeId ? String(routeId) : "",
    labId: labId ? String(labId) : null,
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
      "homeSampleCollection",
      "home_sample_collection",
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
    id:
      pickString(raw, ["id", "_id", "messageId", "message_id"]) ??
      buildIdentityKey(
        pickNullableString(raw, ["createdAt", "created_at", "sentAt", "sent_at"]),
        pickString(raw, ["message", "content", "text", "body"]),
        pickString(raw, ["senderRole", "sender_role", "role"]),
        pickNullableString(raw, ["senderName", "sender_name"]),
      ) ??
      "message",
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
  dedupeByIdentity(
    [
      ...unwrapListPayload(raw.messages, ["items"]),
      ...unwrapListPayload(raw.thread, ["messages"]),
    ].map(normalizeMessage),
    (message) =>
      buildIdentityKey(
        message.id,
        message.createdAt,
        message.senderRole,
        message.senderName,
        message.message,
      ),
  );

const normalizeDoctorRequestSummary = (payload: unknown): DoctorRequestSummary => {
  const raw = unwrapPayload(payload);
  const doctor = mergeRecords(
    pickRecord(raw, ["doctor", "provider"]),
    pickRecord(raw, ["doctorProfile", "doctor_profile"]),
  );
  const appointment = mergeRecords(
    pickRecord(raw, ["appointment", "appointmentDetails", "appointmentInfo"]),
    pickRecord(raw, ["appointmentRecord"]),
  );
  const messages = resolveMessageList(raw);
  const latestMessage = messages[messages.length - 1];
  const statusInfo = normalizeRequestStatus(
    pickNullableString(raw, ["status", "requestStatus", "request_status"]),
    "doctor",
  );
  const consultationType = pickNullableString(raw, [
    "consultationType",
    "consultation_type",
    "visitType",
    "visit_type",
    "type",
  ]);

  return {
    id: String(raw.id ?? raw._id ?? raw.requestId ?? raw.request_id ?? ""),
    requestNumber: pickNullableString(raw, ["requestNumber", "request_number", "referenceNumber"]),
    reference: pickNullableString(raw, ["reference", "requestReference", "referenceNumber", "requestNumber"]),
    status: statusInfo.status,
    statusRaw: statusInfo.rawStatus,
    statusLabel: statusInfo.label,
    providerId:
      pickNullableIdentifier(raw, ["doctorId", "doctor_id"]) ??
      pickNullableIdentifier(doctor, ["id", "_id", "doctorId", "doctor_id"]),
    doctorId:
      pickNullableIdentifier(raw, ["doctorId", "doctor_id"]) ??
      pickNullableIdentifier(doctor, ["id", "_id", "doctorId", "doctor_id"]),
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
      (statusInfo.status === "pending" || statusInfo.status === "approved"),
    canReply:
      pickBoolean(raw, ["canReply", "can_reply"]) ??
      (statusInfo.status === "pending" || statusInfo.status === "approved"),
    appointmentId:
      pickNullableIdentifier(raw, ["appointmentId", "appointment_id"]) ??
      pickNullableIdentifier(appointment, ["id", "_id", "appointmentId", "appointment_id"]),
    appointmentNumber: pickNullableString(raw, ["appointmentNumber", "appointment_number"]) ??
      pickNullableString(appointment, ["appointmentNumber", "appointment_number"]),
    appointmentStatus:
      pickNullableString(raw, ["appointmentStatus", "appointment_status"]) ??
      pickNullableString(appointment, ["status", "appointmentStatus", "appointment_status"]),
    appointmentScheduledAt:
      pickNullableString(raw, ["scheduledAt", "scheduledFor", "appointmentDate"]) ??
      pickNullableString(appointment, [
        "scheduledAt",
        "scheduledFor",
        "appointmentDate",
        "appointmentDateTime",
        "appointment_datetime",
      ]),
    consultationType,
    consultation_type: consultationType,
    visitType: normalizeVisitTypeLabel(consultationType),
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
    ...pickStringArray(raw, [
      "serviceNames",
      "service_names",
      "selectedServices",
      "selected_services",
      "requestedServices",
      "requested_services",
      "testNames",
      "test_names",
    ]),
    ...pickStringArray(branch, ["serviceNames", "service_names"]),
    ...pickStringArray(lab, ["serviceNames", "service_names"]),
    ...unwrapListPayload(raw.services, ["items"]).map((item) =>
      pickString(asRecord(item), ["name", "serviceName", "service_name"]) ?? "",
    ),
    ...unwrapListPayload(raw.selectedServices, ["items"]).map((item) =>
      pickString(asRecord(item), ["name", "serviceName", "service_name", "testName", "test_name"]) ?? "",
    ),
    ...unwrapListPayload(raw.testItems, ["items"]).map((item) =>
      pickString(asRecord(item), ["name", "serviceName", "service_name", "testName", "test_name"]) ?? "",
    ),
  ].filter(Boolean);
  const statusInfo = normalizeRequestStatus(
    pickNullableString(raw, [
      "status",
      "requestStatus",
      "request_status",
      "reviewStatus",
      "review_status",
      "decision",
    ]),
    "lab",
  );

  return {
    id: String(raw.id ?? raw._id ?? raw.requestId ?? raw.request_id ?? ""),
    requestNumber: pickNullableString(raw, ["requestNumber", "request_number", "referenceNumber"]),
    reference: pickNullableString(raw, ["reference", "requestReference", "referenceNumber", "requestNumber"]),
    status: statusInfo.status,
    statusRaw: statusInfo.rawStatus,
    statusLabel: statusInfo.label,
    providerId:
      pickNullableIdentifier(raw, ["labId", "lab_id"]) ??
      pickNullableIdentifier(raw, ["providerId", "provider_id"]) ??
      pickNullableIdentifier(lab, ["id", "_id", "labId", "lab_id"]),
    labId:
      pickNullableIdentifier(raw, ["labId", "lab_id"]) ??
      pickNullableIdentifier(raw, ["providerId", "provider_id"]) ??
      pickNullableIdentifier(lab, ["id", "_id", "labId", "lab_id"]),
    providerName:
      pickString(raw, ["labName", "lab_name", "providerName", "provider_name"]) ??
      pickString(lab, ["displayName", "name", "legalName", "legal_name", "labName", "lab_name"]) ??
      pickString(branch, ["labName", "lab_name"]) ??
      "Laboratory",
    providerSubtitle:
      pickNullableString(raw, ["branchName", "branch_name", "branchLabel", "branch_label"]) ??
      pickNullableString(branch, ["name", "branchName", "branch_name"]),
    providerLocation:
      buildAddress(raw) ??
      buildAddress(branch) ??
      buildAddress(lab) ??
      pickNullableString(raw, ["location", "locationText", "location_text"]) ??
      pickNullableString(branch, ["location", "locationText", "location_text"]) ??
      pickNullableString(lab, ["location", "locationText", "location_text"]),
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
      (statusInfo.status === "pending" || statusInfo.status === "approved"),
    canReply:
      pickBoolean(raw, ["canReply", "can_reply"]) ??
      (statusInfo.status === "pending" || statusInfo.status === "approved"),
    branchId:
      pickNullableIdentifier(raw, ["branchId", "branch_id"]) ??
      pickNullableIdentifier(branch, ["id", "_id", "branchId", "branch_id"]),
    branchName:
      pickNullableString(raw, ["branchName", "branch_name", "branchLabel", "branch_label"]) ??
      pickNullableString(branch, ["name", "branchName", "branch_name"]),
    selectedServices: serviceNames,
    homeCollection:
      pickBoolean(raw, ["homeCollection", "home_collection", "homeCollectionRequested", "home_collection_requested"]) ??
      pickBoolean(lab, ["homeCollectionAvailable", "home_collection_available"]) ??
      null,
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

    return dedupeByIdentity(
      unwrapListPayload(response, ["doctors", "items"]).map(normalizeDoctorItem),
      (doctor) =>
        buildIdentityKey(doctor.id, doctor.doctorId, doctor.name, doctor.specialty, doctor.location),
    );
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

    return dedupeByIdentity(
      unwrapListPayload(response, ["doctors", "items"]).map(normalizeDoctorItem),
      (doctor) =>
        buildIdentityKey(doctor.id, doctor.doctorId, doctor.name, doctor.specialty, doctor.location),
    );
  },

  async getDoctorById(doctorId: string): Promise<DoctorDetail> {
    const response = await apiRequest<unknown>(`/api/v1/doctors/${doctorId}`, {
      method: "GET",
    });

    return normalizeDoctorDetail(response);
  },

  async getDoctorAvailableSlots(
    doctorId: string,
    params: DoctorAvailableSlotsParams,
  ): Promise<DoctorAvailableSlots> {
    const response = await apiRequest<unknown>(`/api/v1/doctors/${doctorId}/available-slots`, {
      method: "GET",
      params: buildQueryParams(params),
    });

    return normalizeDoctorAvailableSlots(response);
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

    return dedupeByIdentity(
      unwrapListPayload(response, ["labs", "items"]).map(normalizeLabItem),
      (lab) => buildIdentityKey(lab.id, lab.labId, lab.name, lab.address, lab.phone),
    );
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

    return dedupeByIdentity(
      unwrapListPayload(response, ["labs", "items"]).map(normalizeLabItem),
      (lab) => buildIdentityKey(lab.id, lab.labId, lab.name, lab.address, lab.phone),
    );
  },

  async getLabById(labId: string): Promise<LabDetail> {
    const response = await apiRequest<unknown>(`/api/v1/labs/${labId}`, {
      method: "GET",
    });

    return normalizeLabDetail(response);
  },

  async getLabAvailableSlots(
    labId: string,
    params: LabAvailableSlotsParams,
  ): Promise<LabAvailableSlots> {
    const response = await apiRequest<unknown>(`/api/v1/labs/${labId}/available-slots`, {
      method: "GET",
      params: buildQueryParams(params),
    });

    const normalized = normalizeDoctorAvailableSlots(response);
    return {
      ...normalized,
      labId: normalized.doctorId || labId,
    };
  },

  async getLabBranches(labId: string): Promise<LabBranchDirectoryItem[]> {
    const response = await apiRequest<unknown>(`/api/v1/labs/${labId}/branches`, {
      method: "GET",
    });

    return dedupeByIdentity(
      unwrapListPayload(response, ["branches", "items"]).map(normalizeLabBranch),
      (branch) => buildIdentityKey(branch.id, branch.name, branch.address, branch.phone),
    );
  },

  async getLabServices(labId: string): Promise<LabServiceDirectoryItem[]> {
    const response = await apiRequest<unknown>(`/api/v1/labs/${labId}/services`, {
      method: "GET",
    });

    return dedupeByIdentity(
      unwrapListPayload(response, ["services", "items"]).map(normalizeLabService),
      (service) =>
        buildIdentityKey(service.id, service.name, service.category, service.sampleType, service.price),
    );
  },

  async createAppointmentRequest(payload: CreateAppointmentRequestPayload): Promise<DoctorRequestDetail> {
    const response = await apiRequest<unknown>("/api/v1/appointment-requests", {
      method: "POST",
      auth: true,
      body: buildAppointmentRequestBody(payload),
    });

    return normalizeDoctorRequestDetail(response);
  },

  async getAppointmentRequests(params?: DoctorRequestListParams): Promise<PaginatedList<DoctorRequestSummary>> {
    const response = await apiRequest<unknown>("/api/v1/appointment-requests", {
      method: "GET",
      auth: true,
      params: buildQueryParams(params),
    });

    const normalized = normalizePaginatedResponse(response, normalizeDoctorRequestSummary);

    return {
      ...normalized,
      data: dedupeByIdentity(
        normalized.data,
        (request) =>
          buildIdentityKey(
            request.id,
            request.requestNumber,
            request.doctorId,
            request.providerName,
            request.createdAt,
          ),
      ),
    };
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
    const response = await apiRequest<unknown>(
      `/api/v1/chat/patient_doctor/${requestId}/messages`,
      {
        method: "POST",
        auth: true,
        body: payload,
      },
    );

    return normalizeMessage(response);
  },

  async createTestRequest(payload: CreateTestRequestPayload): Promise<LabRequestDetail> {
    const response = await apiRequest<unknown>("/api/v1/test-requests", {
      method: "POST",
      auth: true,
      body: buildTestRequestBody(payload),
    });

    return normalizeLabRequestDetail(response);
  },

  async getTestRequests(params?: LabRequestListParams): Promise<PaginatedList<LabRequestSummary>> {
    const response = await apiRequest<unknown>("/api/v1/test-requests", {
      method: "GET",
      auth: true,
      params: buildQueryParams(params),
    });

    const normalized = normalizePaginatedResponse(response, normalizeLabRequestSummary);

    return {
      ...normalized,
      data: dedupeByIdentity(
        normalized.data,
        (request) =>
          buildIdentityKey(
            request.id,
            request.requestNumber,
            request.labId,
            request.providerName,
            request.createdAt,
          ),
      ),
    };
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
    const response = await apiRequest<unknown>(
      `/api/v1/chat/patient_lab/${requestId}/messages`,
      {
        method: "POST",
        auth: true,
        body: payload,
      },
    );

    return normalizeMessage(response);
  },
};
