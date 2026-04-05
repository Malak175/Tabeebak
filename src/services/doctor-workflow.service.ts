import { apiRequest } from "@/services/api";
import {
  CreateRequestMessagePayload,
  RequestMessage,
} from "@/types/patient-booking.types";
import {
  CreateDoctorAppointmentRequestMessagePayload,
  DoctorAppointment,
  DoctorAppointmentRequest,
  DoctorAppointmentRequestDetails,
  DoctorAppointmentRequestFilterParams,
  DoctorAppointmentFilterParams,
  DoctorPatientFilterParams,
  DoctorPatientListItem,
  DoctorPatientSummary,
  DoctorPrescription,
  DoctorPrescriptionFilterParams,
  DoctorReview,
  DoctorReviewFilterParams,
  DoctorReviewsSummary,
  PaginatedResponse,
  UpdateDoctorAppointmentRequestStatusPayload,
} from "@/types/doctor-workflow.types";

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

const pickString = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
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

const pickNullableNumber = (record: Record<string, unknown>, keys: string[]) => {
  const value = pickNumber(record, keys);
  return value ?? null;
};

const pickBoolean = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
    }

    if (typeof value === "number") {
      if (value === 1) return true;
      if (value === 0) return false;
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

const unwrapListPayload = (payload: unknown, nestedKeys: string[] = []) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  const record = asRecord(payload);
  const data = record.data;
  if (Array.isArray(data)) {
    return data;
  }

  for (const key of nestedKeys) {
    const nested = record[key];
    if (Array.isArray(nested)) {
      return nested;
    }
  }

  return [];
};

const buildDateTime = (record: Record<string, unknown>, dateKeys: string[], timeKeys: string[]) => {
  const explicit = pickString(record, [
    "scheduledAt",
    "appointmentDateTime",
    "appointment_datetime",
    "slotStart",
    "slot_start",
    "slotStartAt",
    "slot_start_at",
    "startAt",
    "start_at",
    "dateTime",
    "datetime",
    ...dateKeys,
  ]);

  if (explicit && explicit.includes("T")) {
    return explicit;
  }

  const date = pickString(record, dateKeys);
  const time = pickString(record, timeKeys);

  if (date && time) {
    return `${date}T${time}`;
  }

  return explicit ?? date ?? null;
};

const normalizeMessage = (payload: unknown): RequestMessage => {
  const raw = unwrapPayload(payload);
  const sender = mergeRecords(
    pickRecord(raw, ["sender", "author", "createdBy"]),
    pickRecord(raw, ["doctor"]),
    pickRecord(raw, ["patient"]),
  );

  return {
    id:
      pickIdentifier(raw, ["id", "_id", "messageId", "message_id"]) ??
      ([
        pickNullableString(raw, ["createdAt", "created_at", "sentAt", "sent_at"]),
        pickString(raw, ["message", "content", "text", "body"]),
        pickString(sender, ["role"]),
        pickNullableString(sender, ["name", "fullName", "full_name"]),
      ]
        .filter(Boolean)
        .join("::") ||
        "message"),
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
  [...unwrapListPayload(raw.messages, ["items"]), ...unwrapListPayload(raw.thread, ["messages"])].map(
    normalizeMessage,
  );

const getListEnvelope = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      meta: {},
    };
  }

  const raw = asRecord(payload);
  const data = raw.data;

  if (Array.isArray(data)) {
    return {
      items: data,
      meta: mergeRecords(raw, raw.meta, raw.pagination),
    };
  }

  const container = asRecord(data);
  const candidates = [
    container.items,
    container.results,
    container.records,
    container.appointments,
    container.patients,
    container.prescriptions,
    container.reviews,
    raw.items,
    raw.results,
    raw.records,
    raw.appointments,
    raw.patients,
    raw.prescriptions,
    raw.reviews,
  ];

  const items = candidates.find(Array.isArray) as unknown[] | undefined;

  return {
    items: items ?? [],
    meta: mergeRecords(raw, raw.meta, raw.pagination, container, container.meta, container.pagination),
  };
};

const normalizePaginatedResponse = <T>(
  payload: unknown,
  mapItem: (value: unknown) => T,
): PaginatedResponse<T> => {
  const { items, meta } = getListEnvelope(payload);
  const page = pickNumber(meta, ["page", "currentPage", "pageNumber"]) ?? 1;
  const limit =
    pickNumber(meta, ["limit", "perPage", "pageSize", "size"]) ??
    (items.length > 0 ? items.length : 10);
  const total = pickNumber(meta, ["total", "totalCount", "totalItems", "count"]) ?? items.length;
  const totalPages =
    pickNumber(meta, ["totalPages", "pageCount", "pages"]) ??
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));
  const hasNextPage =
    pickBoolean(meta, ["hasNextPage", "hasMore", "has_next_page"]) ?? page < totalPages;
  const hasPreviousPage =
    pickBoolean(meta, ["hasPreviousPage", "hasPrevPage", "has_previous_page"]) ?? page > 1;

  return {
    data: items.map(mapItem),
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPreviousPage,
  };
};

const buildQueryParams = <T extends Record<string, unknown>>(params?: T) => {
  if (!params) return undefined;

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => {
      if (value === undefined || value === null) return false;
      if (typeof value === "string") return value.trim().length > 0;
      return true;
    }),
  );
};

const normalizeDoctorAppointment = (payload: unknown): DoctorAppointment => {
  const raw = unwrapPayload(payload);
  const patient = mergeRecords(
    pickRecord(raw, ["patient", "patientProfile"]),
    pickRecord(raw, ["patientDetails"]),
  );

  return {
    id: pickString(raw, ["id", "_id", "appointmentId", "appointment_id"]) ?? "",
    appointmentNumber: pickNullableString(raw, [
      "appointmentNumber",
      "appointment_number",
      "referenceNumber",
    ]),
    patientId:
      pickNullableString(raw, ["patientId", "patient_id"]) ??
      pickNullableString(patient, ["id", "_id", "patientId", "patient_id"]),
    patientName:
      pickString(raw, ["patientName", "patient_name"]) ??
      pickString(patient, ["displayName", "name", "fullName", "full_name"]) ??
      "Patient",
    patientAvatarUrl:
      pickNullableString(patient, ["avatarUrl", "avatar", "profileImageUrl"]) ??
      pickNullableString(raw, ["patientAvatarUrl", "patient_avatar_url"]),
    patientAge:
      pickNullableNumber(raw, ["patientAge", "patient_age", "age"]) ??
      pickNullableNumber(patient, ["age"]),
    patientGender:
      pickNullableString(raw, ["patientGender", "patient_gender", "gender"]) ??
      pickNullableString(patient, ["gender"]),
    scheduledAt: buildDateTime(
      raw,
      ["scheduledAt", "appointmentDate", "appointment_date", "date", "startDate", "start_date"],
      ["appointmentTime", "appointment_time", "time", "startTime", "start_time"],
    ),
    endAt: buildDateTime(raw, ["endAt", "endDate", "end_date"], ["endTime", "end_time"]),
    status: pickString(raw, ["status", "appointmentStatus", "appointment_status"]) ?? "scheduled",
    type: pickNullableString(raw, ["type", "appointmentType", "appointment_type", "visitType"]),
    mode: pickNullableString(raw, ["mode", "consultationMode", "consultation_mode"]),
    location:
      pickNullableString(raw, ["location", "clinicName", "hospitalName", "room"]) ??
      pickNullableString(pickRecord(raw, ["locationDetails", "clinic"]), ["name", "address"]),
    reason: pickNullableString(raw, ["reason", "chiefComplaint", "chief_complaint"]),
    complaint: pickNullableString(raw, ["complaint", "symptoms", "symptomSummary"]),
    diagnosis: pickNullableString(raw, ["diagnosis", "assessment"]),
    notes: pickNullableString(raw, ["notes", "summary", "doctorNotes", "doctor_notes"]),
    joinUrl: pickNullableString(raw, ["joinUrl", "meetingUrl", "videoCallUrl"]),
    canJoinOnline:
      pickBoolean(raw, ["canJoinOnline", "isJoinable", "joinable"]) ??
      Boolean(pickString(raw, ["joinUrl", "meetingUrl", "videoCallUrl"])),
    createdAt: pickNullableString(raw, ["createdAt", "created_at"]),
    updatedAt: pickNullableString(raw, ["updatedAt", "updated_at"]),
  };
};

const normalizeDoctorAppointmentRequest = (payload: unknown): DoctorAppointmentRequest => {
  const raw = unwrapPayload(payload);
  const patient = mergeRecords(
    pickRecord(raw, ["patient", "patientProfile"]),
    pickRecord(raw, ["patientDetails"]),
  );
  const messages = resolveMessageList(raw);
  const latestMessage = messages[messages.length - 1];
  const requestId =
    pickIdentifier(raw, [
      "id",
      "_id",
      "requestId",
      "request_id",
      "appointmentRequestId",
      "appointment_request_id",
      "appointmentRequestID",
      "appointment_request",
    ]) ??
    pickIdentifier(pickRecord(raw, ["request", "appointmentRequest"]), [
      "id",
      "_id",
      "requestId",
      "request_id",
      "appointmentRequestId",
      "appointment_request_id",
    ]) ??
    pickIdentifier(raw, ["requestNumber", "request_number", "referenceNumber"]);
  const latestSummary =
    pickNullableString(raw, [
      "latestSummary",
      "latest_summary",
      "summary",
      "requestSummary",
      "request_summary",
    ]) ??
    latestMessage?.message ??
    pickNullableString(raw, ["reason", "chiefComplaint", "chief_complaint", "note", "notes"]);

  return {
    id: requestId ?? "",
    requestNumber: pickNullableString(raw, [
      "requestNumber",
      "request_number",
      "referenceNumber",
      "reference_number",
    ]),
    patientId:
      pickNullableString(raw, ["patientId", "patient_id"]) ??
      pickNullableString(patient, ["id", "_id", "patientId", "patient_id"]),
    patientName:
      pickString(raw, ["patientName", "patient_name"]) ??
      pickString(patient, ["displayName", "name", "fullName", "full_name"]) ??
      "Patient",
    patientAge:
      pickNullableNumber(raw, ["patientAge", "patient_age", "age"]) ??
      pickNullableNumber(patient, ["age"]),
    patientGender:
      pickNullableString(raw, ["patientGender", "patient_gender", "gender"]) ??
      pickNullableString(patient, ["gender"]),
    preferredTime: buildDateTime(
      raw,
      [
        "preferredDate",
        "preferred_date",
        "preferredAt",
        "preferred_at",
        "requestedDate",
        "requested_date",
      ],
      ["preferredTime", "preferred_time", "time"],
    ),
    scheduledAt: buildDateTime(
      raw,
      ["scheduledAt", "scheduled_at", "approvedDate", "approved_date"],
      ["scheduledTime", "scheduled_time"],
    ),
    consultationType:
      pickNullableString(raw, [
        "consultationType",
        "consultation_type",
        "visitType",
        "visit_type",
        "type",
      ]) ?? pickNullableString(raw, ["mode"]),
    status: pickString(raw, ["status", "requestStatus", "request_status"]) ?? "pending",
    latestSummary,
    reason: pickNullableString(raw, ["reason", "chiefComplaint", "chief_complaint"]),
    notes: pickNullableString(raw, ["note", "notes", "patientNote", "patient_note"]),
    providerMessage: pickNullableString(raw, [
      "providerMessage",
      "provider_message",
      "message",
      "reviewMessage",
      "review_message",
    ]),
    createdAt: pickNullableString(raw, ["createdAt", "created_at"]),
    updatedAt: pickNullableString(raw, ["updatedAt", "updated_at"]),
    canReply:
      pickBoolean(raw, ["canReply", "can_reply"]) ??
      !["cancelled", "canceled"].includes((pickString(raw, ["status"]) ?? "").toLowerCase()),
  };
};

const normalizeDoctorAppointmentRequestDetails = (
  payload: unknown,
): DoctorAppointmentRequestDetails => {
  const raw = unwrapPayload(payload);
  const base = normalizeDoctorAppointmentRequest(raw);
  const patient = mergeRecords(
    pickRecord(raw, ["patient", "patientProfile"]),
    pickRecord(raw, ["patientDetails"]),
  );

  return {
    ...base,
    patient: {
      id:
        pickNullableString(patient, ["id", "_id", "patientId", "patient_id"]) ??
        base.patientId,
      fullName:
        pickString(patient, ["displayName", "name", "fullName", "full_name"]) ??
        base.patientName,
      age: pickNullableNumber(patient, ["age"]) ?? base.patientAge,
      gender: pickNullableString(patient, ["gender"]) ?? base.patientGender,
      phone: pickNullableString(patient, ["phone", "phoneNumber", "mobile"]),
      email: pickNullableString(patient, ["email"]),
    },
    messages: resolveMessageList(raw),
  };
};

const normalizeDoctorPatientListItem = (payload: unknown): DoctorPatientListItem => {
  const raw = unwrapPayload(payload);
  const fallbackName = [
    pickString(raw, ["firstName", "first_name"]),
    pickString(raw, ["lastName", "last_name"]),
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: pickString(raw, ["id", "_id", "patientId", "patient_id"]) ?? "",
    fullName:
      (pickString(raw, ["fullName", "full_name", "displayName", "display_name", "name"]) ??
        fallbackName) ||
      "Patient",
    avatarUrl: pickNullableString(raw, ["avatarUrl", "avatar", "profileImageUrl", "imageUrl"]),
    age: pickNullableNumber(raw, ["age"]),
    gender: pickNullableString(raw, ["gender"]),
    phone: pickNullableString(raw, ["phone", "phoneNumber", "mobile"]),
    email: pickNullableString(raw, ["email"]),
    diagnosis: pickNullableString(raw, ["diagnosis", "latestDiagnosis", "latest_diagnosis"]),
    condition: pickNullableString(raw, ["condition", "status", "healthStatus", "health_status"]),
    lastVisitAt: pickNullableString(raw, ["lastVisitAt", "lastVisit", "last_visit", "updatedAt"]),
    upcomingAppointmentAt: pickNullableString(raw, [
      "upcomingAppointmentAt",
      "nextAppointmentAt",
      "nextAppointment",
    ]),
  };
};

const normalizeDoctorPatientSummary = (payload: unknown): DoctorPatientSummary => {
  const raw = unwrapPayload(payload);
  const vitals = mergeRecords(
    pickRecord(raw, ["latestVitals", "vitals", "recentVitals"]),
    pickRecord(raw, ["vitalSigns"]),
  );
  const fallbackName = [
    pickString(raw, ["firstName", "first_name"]),
    pickString(raw, ["lastName", "last_name"]),
  ]
    .filter(Boolean)
    .join(" ");

  return {
    id: pickString(raw, ["id", "_id", "patientId", "patient_id"]) ?? "",
    fullName:
      (pickString(raw, ["fullName", "full_name", "displayName", "display_name", "name"]) ??
        fallbackName) ||
      "Patient",
    avatarUrl: pickNullableString(raw, ["avatarUrl", "avatar", "profileImageUrl", "imageUrl"]),
    age: pickNullableNumber(raw, ["age"]),
    gender: pickNullableString(raw, ["gender"]),
    dateOfBirth: pickNullableString(raw, ["dateOfBirth", "date_of_birth", "dob"]),
    bloodType: pickNullableString(raw, ["bloodType", "blood_type"]),
    phone: pickNullableString(raw, ["phone", "phoneNumber", "mobile"]),
    email: pickNullableString(raw, ["email"]),
    allergies: pickStringArray(raw, ["allergies"]),
    chronicConditions: pickStringArray(raw, ["chronicConditions", "chronic_conditions"]),
    currentMedications: pickStringArray(raw, [
      "currentMedications",
      "current_medications",
      "medications",
    ]),
    recentDiagnoses: pickStringArray(raw, [
      "recentDiagnoses",
      "recent_diagnoses",
      "diagnoses",
    ]),
    latestVitals: {
      bloodPressure: pickNullableString(vitals, ["bloodPressure", "blood_pressure"]),
      heartRate: pickNullableNumber(vitals, ["heartRate", "heart_rate"]),
      temperatureC: pickNullableNumber(vitals, ["temperatureC", "temperature_c", "temperature"]),
      weightKg: pickNullableNumber(vitals, ["weightKg", "weight_kg", "weight"]),
    },
    lastVisitAt: pickNullableString(raw, ["lastVisitAt", "lastVisit", "last_visit", "updatedAt"]),
    notes: pickNullableString(raw, ["notes", "summary", "patientNotes", "patient_notes"]),
  };
};

const normalizeDoctorPrescription = (payload: unknown): DoctorPrescription => {
  const raw = unwrapPayload(payload);
  const patient = mergeRecords(pickRecord(raw, ["patient", "patientProfile"]));
  const medication = mergeRecords(pickRecord(raw, ["medication", "drug"]));

  return {
    id: pickString(raw, ["id", "_id", "prescriptionId", "prescription_id"]) ?? "",
    prescriptionNumber: pickNullableString(raw, [
      "prescriptionNumber",
      "prescription_number",
      "referenceNumber",
    ]),
    patientId:
      pickNullableString(raw, ["patientId", "patient_id"]) ??
      pickNullableString(patient, ["id", "_id", "patientId"]),
    patientName:
      pickNullableString(raw, ["patientName", "patient_name"]) ??
      pickNullableString(patient, ["displayName", "name", "fullName", "full_name"]),
    appointmentId: pickNullableString(raw, ["appointmentId", "appointment_id"]),
    medicationName:
      pickString(raw, ["medicationName", "medication_name", "drugName", "drug_name"]) ??
      pickString(medication, ["name", "displayName"]) ??
      "Medication",
    dosage: pickNullableString(raw, ["dosage", "dose"]),
    frequency: pickNullableString(raw, ["frequency"]),
    duration: pickNullableString(raw, ["duration"]),
    quantity: pickNullableString(raw, ["quantity"]),
    instructions: pickNullableString(raw, ["instructions", "direction", "directions"]),
    status: pickString(raw, ["status", "prescriptionStatus", "prescription_status"]) ?? "active",
    prescribedAt: pickNullableString(raw, ["prescribedAt", "issuedAt", "createdAt", "date"]),
    expiresAt: pickNullableString(raw, ["expiresAt", "expiryDate", "endDate"]),
    refillsRemaining: pickNullableNumber(raw, [
      "refillsRemaining",
      "refillCount",
      "remainingRefills",
    ]),
    diagnosis: pickNullableString(raw, ["diagnosis"]),
    notes: pickNullableString(raw, ["notes", "note"]),
  };
};

const normalizeDoctorReview = (payload: unknown): DoctorReview => {
  const raw = unwrapPayload(payload);
  const patient = mergeRecords(pickRecord(raw, ["patient", "reviewer", "author"]));

  return {
    id: pickString(raw, ["id", "_id", "reviewId", "review_id"]) ?? "",
    patientId:
      pickNullableString(raw, ["patientId", "patient_id"]) ??
      pickNullableString(patient, ["id", "_id", "patientId"]),
    patientName:
      pickString(raw, ["patientName", "patient_name", "reviewerName", "reviewer_name"]) ??
      pickString(patient, ["displayName", "name", "fullName", "full_name"]) ??
      "Anonymous patient",
    patientAvatarUrl:
      pickNullableString(patient, ["avatarUrl", "avatar", "profileImageUrl"]) ??
      pickNullableString(raw, ["patientAvatarUrl", "patient_avatar_url"]),
    appointmentId: pickNullableString(raw, ["appointmentId", "appointment_id"]),
    rating: pickNumber(raw, ["rating", "stars", "score"]) ?? 0,
    title: pickNullableString(raw, ["title", "headline"]),
    comment: pickNullableString(raw, ["comment", "review", "message", "feedback"]),
    wouldRecommend: pickBoolean(raw, ["wouldRecommend", "recommended", "isRecommended"]) ?? null,
    createdAt: pickNullableString(raw, ["createdAt", "created_at", "reviewedAt", "date"]),
  };
};

const normalizeDoctorReviewsSummary = (payload: unknown): DoctorReviewsSummary => {
  const raw = unwrapPayload(payload);
  const breakdown = mergeRecords(
    pickRecord(raw, ["ratingBreakdown", "rating_breakdown"]),
    pickRecord(raw, ["breakdown"]),
  );

  return {
    averageRating: pickNumber(raw, ["averageRating", "average_rating", "rating"]) ?? 0,
    totalReviews: pickNumber(raw, ["totalReviews", "total_reviews", "count"]) ?? 0,
    recommendationRate:
      pickNullableNumber(raw, ["recommendationRate", "recommendation_rate", "recommendedPercent"]),
    ratingBreakdown: {
      5: pickNumber(breakdown, ["5", "five"]) ?? 0,
      4: pickNumber(breakdown, ["4", "four"]) ?? 0,
      3: pickNumber(breakdown, ["3", "three"]) ?? 0,
      2: pickNumber(breakdown, ["2", "two"]) ?? 0,
      1: pickNumber(breakdown, ["1", "one"]) ?? 0,
    },
  };
};

export const doctorWorkflowService = {
  getDoctorAppointmentRequests: async (
    params?: DoctorAppointmentRequestFilterParams,
  ): Promise<PaginatedResponse<DoctorAppointmentRequest>> => {
    const response = await apiRequest<unknown>("/api/v1/doctors/me/appointment-requests", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizeDoctorAppointmentRequest);
  },

  getDoctorAppointmentRequestById: async (
    requestId: string,
  ): Promise<DoctorAppointmentRequestDetails> => {
    const response = await apiRequest<unknown>(
      `/api/v1/doctors/me/appointment-requests/${requestId}`,
      {
        method: "GET",
        auth: true,
      },
    );

    return normalizeDoctorAppointmentRequestDetails(response);
  },

  updateDoctorAppointmentRequestStatus: async (
    requestId: string,
    payload: UpdateDoctorAppointmentRequestStatusPayload,
  ): Promise<DoctorAppointmentRequestDetails> => {
    const response = await apiRequest<unknown>(
      `/api/v1/doctors/me/appointment-requests/${requestId}/status`,
      {
        method: "PATCH",
        body: {
          status: payload.status,
          ...(payload.message?.trim()
            ? {
                message: payload.message.trim(),
              }
            : {}),
          ...(payload.scheduledAt
            ? {
                scheduled_at: payload.scheduledAt,
              }
            : {}),
        },
        auth: true,
      },
    );

    return normalizeDoctorAppointmentRequestDetails(response);
  },

  sendDoctorAppointmentRequestMessage: async (
    requestId: string,
    payload: CreateDoctorAppointmentRequestMessagePayload | CreateRequestMessagePayload,
  ): Promise<RequestMessage> => {
    const response = await apiRequest<unknown>(`/api/v1/appointment-requests/${requestId}/messages`, {
      method: "POST",
      body: payload,
      auth: true,
    });

    return normalizeMessage(response);
  },

  getDoctorAppointments: async (
    params?: DoctorAppointmentFilterParams,
  ): Promise<PaginatedResponse<DoctorAppointment>> => {
    const response = await apiRequest<unknown>("/api/v1/doctors/me/appointments", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizeDoctorAppointment);
  },

  getDoctorTodayAppointments: async (
    params?: DoctorAppointmentFilterParams,
  ): Promise<PaginatedResponse<DoctorAppointment>> => {
    const response = await apiRequest<unknown>("/api/v1/doctors/me/appointments/today", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizeDoctorAppointment);
  },

  getDoctorAppointmentById: async (appointmentId: string): Promise<DoctorAppointment> => {
    const response = await apiRequest<unknown>(
      `/api/v1/doctors/me/appointments/${appointmentId}`,
      {
        method: "GET",
        auth: true,
      },
    );

    return normalizeDoctorAppointment(response);
  },

  getDoctorPatients: async (
    params?: DoctorPatientFilterParams,
  ): Promise<PaginatedResponse<DoctorPatientListItem>> => {
    const response = await apiRequest<unknown>("/api/v1/doctors/me/patients", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizeDoctorPatientListItem);
  },

  getDoctorPatientSummary: async (patientId: string): Promise<DoctorPatientSummary> => {
    const response = await apiRequest<unknown>(
      `/api/v1/doctors/me/patients/${patientId}/summary`,
      {
        method: "GET",
        auth: true,
      },
    );

    return normalizeDoctorPatientSummary(response);
  },

  getDoctorPrescriptions: async (
    params?: DoctorPrescriptionFilterParams,
  ): Promise<PaginatedResponse<DoctorPrescription>> => {
    const response = await apiRequest<unknown>("/api/v1/doctors/me/prescriptions", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizeDoctorPrescription);
  },

  getDoctorReviewsSummary: async (): Promise<DoctorReviewsSummary> => {
    const response = await apiRequest<unknown>("/api/v1/doctors/me/reviews/summary", {
      method: "GET",
      auth: true,
    });

    return normalizeDoctorReviewsSummary(response);
  },

  getDoctorReviews: async (
    params?: DoctorReviewFilterParams,
  ): Promise<PaginatedResponse<DoctorReview>> => {
    const response = await apiRequest<unknown>("/api/v1/doctors/me/reviews", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizeDoctorReview);
  },
};
