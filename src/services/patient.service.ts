import { apiRequest } from "@/services/api";
import {
  Appointment,
  AppointmentFilterParams,
  LabOrder,
  LabOrderFilterParams,
  LabResult,
  LabResultFilterParams,
  LabResultMeasurement,
  PaginatedResponse,
  Prescription,
  PrescriptionFilterParams,
} from "@/types/patient-records.types";
import {
  EmergencyContact,
  InsuranceInfo,
  MedicalHistorySummary,
  PatientDashboardSummary,
  PatientMedicalProfile,
  PatientProfile,
  UpdateEmergencyContactRequest,
  UpdateInsuranceInfoRequest,
  UpdatePatientMedicalProfileRequest,
  UpdatePatientProfileRequest,
} from "@/types/patient-profile.types";

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

const pickText = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (Array.isArray(value)) {
      const values = value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);

      if (values.length > 0) {
        return values.join(", ");
      }
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

const buildDateTime = (record: Record<string, unknown>, dateKeys: string[], timeKeys: string[]) => {
  const explicit = pickString(record, [
    "scheduledAt",
    "appointmentDateTime",
    "appointment_datetime",
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
    container.prescriptions,
    container.labOrders,
    container.lab_orders,
    container.labResults,
    container.lab_results,
    raw.items,
    raw.results,
    raw.records,
    raw.appointments,
    raw.prescriptions,
    raw.labOrders,
    raw.lab_orders,
    raw.labResults,
    raw.lab_results,
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

const normalizePatientProfile = (payload: unknown): PatientProfile => {
  const raw = unwrapPayload(payload);

  return {
    id: pickString(raw, ["id", "_id", "patientId", "userId"]),
    email: pickString(raw, ["email"]),
    firstName: pickString(raw, ["firstName", "first_name"]),
    lastName: pickString(raw, ["lastName", "last_name"]),
    displayName: pickString(raw, ["displayName", "display_name", "fullName", "full_name", "name"]),
    phone: pickString(raw, ["phone", "phoneNumber", "mobile"]),
    alternatePhone: pickString(raw, ["alternatePhone", "alternate_phone", "secondaryPhone"]),
    dateOfBirth: pickString(raw, ["dateOfBirth", "date_of_birth", "dob"]),
    gender: pickString(raw, ["gender"]),
    addressLine1: pickString(raw, ["addressLine1", "address_line_1", "address1"]),
    addressLine2: pickString(raw, ["addressLine2", "address_line_2", "address2"]),
    city: pickString(raw, ["city"]),
    state: pickString(raw, ["state", "province"]),
    country: pickString(raw, ["country"]),
    postalCode: pickString(raw, ["postalCode", "postal_code", "zipCode", "zip_code"]),
    avatarUrl: pickNullableString(raw, ["avatarUrl", "avatar", "profileImageUrl", "imageUrl"]),
  };
};

const normalizeDashboardSummary = (payload: unknown): PatientDashboardSummary => {
  const raw = unwrapPayload(payload);

  return {
    patientId: pickString(raw, ["patientId", "id", "_id"]),
    firstName: pickString(raw, ["firstName", "first_name"]),
    lastName: pickString(raw, ["lastName", "last_name"]),
    displayName: pickString(raw, ["displayName", "display_name", "fullName", "full_name", "name"]),
    email: pickString(raw, ["email"]),
    assignedDoctorName: pickString(raw, [
      "assignedDoctorName",
      "doctorName",
      "primaryDoctorName",
      "doctor_name",
    ]),
    assignedDoctorSpecialty: pickString(raw, [
      "assignedDoctorSpecialty",
      "doctorSpecialty",
      "primaryDoctorSpecialty",
      "doctor_specialty",
    ]),
    assignedDoctorAvatarUrl: pickNullableString(raw, [
      "assignedDoctorAvatarUrl",
      "doctorAvatarUrl",
      "doctor_avatar_url",
    ]),
    upcomingAppointmentsCount: pickNumber(raw, [
      "upcomingAppointmentsCount",
      "upcomingAppointments",
      "appointmentsCount",
    ]),
    pendingLabResultsCount: pickNumber(raw, [
      "pendingLabResultsCount",
      "pendingLabResults",
      "labResultsPendingCount",
    ]),
    activeMedicationsCount: pickNumber(raw, [
      "activeMedicationsCount",
      "medicationsCount",
      "activePrescriptionsCount",
    ]),
    latestHeartRate: pickNullableNumber(raw, ["latestHeartRate", "heartRate", "heart_rate"]),
    latestBloodPressure: pickNullableString(raw, [
      "latestBloodPressure",
      "bloodPressure",
      "blood_pressure",
    ]),
    latestWeightKg: pickNullableNumber(raw, ["latestWeightKg", "weightKg", "weight_kg"]),
    bmi: pickNullableNumber(raw, ["bmi", "bodyMassIndex"]),
    bloodSugarMgDl: pickNullableNumber(raw, [
      "bloodSugarMgDl",
      "bloodSugar",
      "blood_sugar",
      "glucose",
    ]),
    healthTip: pickNullableString(raw, ["healthTip", "dailyHealthTip", "tip"]),
  };
};

const normalizePatientMedicalProfile = (payload: unknown): PatientMedicalProfile => {
  const raw = unwrapPayload(payload);

  return {
    bloodType: pickString(raw, ["bloodType", "blood_type"]),
    heightCm: pickNullableNumber(raw, ["heightCm", "height_cm", "height"]),
    weightKg: pickNullableNumber(raw, ["weightKg", "weight_kg", "weight"]),
    allergies: pickStringArray(raw, ["allergies"]),
    currentMedications: pickStringArray(raw, [
      "currentMedications",
      "current_medications",
      "medications",
    ]),
    chronicConditions: pickStringArray(raw, [
      "chronicConditions",
      "chronic_conditions",
      "conditions",
    ]),
    pastSurgeries: pickStringArray(raw, ["pastSurgeries", "past_surgeries", "surgeries"]),
    familyHistory: pickStringArray(raw, ["familyHistory", "family_history"]),
    notes: pickString(raw, ["notes", "medicalNotes", "medical_notes"]),
  };
};

const normalizeEmergencyContact = (payload: unknown): EmergencyContact => {
  const raw = unwrapPayload(payload);

  return {
    name: pickString(raw, ["name", "fullName", "full_name"]),
    relationship: pickString(raw, ["relationship"]),
    phone: pickString(raw, ["phone", "phoneNumber"]),
    alternatePhone: pickString(raw, ["alternatePhone", "alternate_phone", "secondaryPhone"]),
    email: pickString(raw, ["email"]),
    address: pickString(raw, ["address"]),
  };
};

const normalizeInsuranceInfo = (payload: unknown): InsuranceInfo => {
  const raw = unwrapPayload(payload);

  return {
    providerName: pickString(raw, ["providerName", "provider_name", "provider"]),
    planName: pickString(raw, ["planName", "plan_name"]),
    memberId: pickString(raw, ["memberId", "member_id"]),
    policyNumber: pickString(raw, ["policyNumber", "policy_number"]),
    groupNumber: pickString(raw, ["groupNumber", "group_number"]),
    expiryDate: pickString(raw, ["expiryDate", "expiry_date", "expirationDate"]),
    coverageDetails: pickString(raw, ["coverageDetails", "coverage_details", "coverage"]),
  };
};

const normalizeMedicalHistorySummary = (payload: unknown): MedicalHistorySummary => {
  const raw = unwrapPayload(payload);

  return {
    allergies: pickStringArray(raw, ["allergies"]),
    chronicConditions: pickStringArray(raw, ["chronicConditions", "chronic_conditions"]),
    medications: pickStringArray(raw, ["medications", "currentMedications", "current_medications"]),
    surgeries: pickStringArray(raw, ["surgeries", "pastSurgeries", "past_surgeries"]),
    familyHistory: pickStringArray(raw, ["familyHistory", "family_history"]),
  };
};

const normalizeAppointment = (payload: unknown): Appointment => {
  const raw = unwrapPayload(payload);
  const doctor = mergeRecords(
    pickRecord(raw, ["doctor", "physician", "provider"]),
    pickRecord(raw, ["doctorProfile"]),
    pickRecord(raw, ["doctorDetails"]),
  );

  return {
    id: pickString(raw, ["id", "_id", "appointmentId", "appointment_id"]) ?? "",
    appointmentNumber: pickNullableString(raw, [
      "appointmentNumber",
      "appointment_number",
      "referenceNumber",
    ]),
    doctorId: pickNullableString(doctor, ["id", "_id", "doctorId", "doctor_id"]),
    doctorName:
      pickString(raw, ["doctorName", "doctor_name", "providerName"]) ??
      pickString(doctor, ["displayName", "name", "fullName", "full_name"]) ??
      "Doctor not assigned",
    doctorSpecialty:
      pickNullableString(raw, ["doctorSpecialty", "specialty", "doctor_specialty"]) ??
      pickNullableString(doctor, ["specialty", "specialization"]),
    doctorAvatarUrl:
      pickNullableString(doctor, ["avatarUrl", "avatar", "profileImageUrl"]) ??
      pickNullableString(raw, ["doctorAvatarUrl", "doctor_avatar_url"]),
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
    notes: pickNullableString(raw, ["notes", "summary", "patientNotes", "patient_notes"]),
    joinUrl: pickNullableString(raw, ["joinUrl", "meetingUrl", "videoCallUrl"]),
    canJoinOnline:
      pickBoolean(raw, ["canJoinOnline", "isJoinable", "joinable"]) ??
      Boolean(pickString(raw, ["joinUrl", "meetingUrl", "videoCallUrl"])),
    createdAt: pickNullableString(raw, ["createdAt", "created_at"]),
    updatedAt: pickNullableString(raw, ["updatedAt", "updated_at"]),
  };
};

const normalizePrescription = (payload: unknown): Prescription => {
  const raw = unwrapPayload(payload);
  const medication = mergeRecords(pickRecord(raw, ["medication", "drug"]));
  const prescriber = mergeRecords(pickRecord(raw, ["doctor", "prescriber"]));

  return {
    id: pickString(raw, ["id", "_id", "prescriptionId", "prescription_id"]) ?? "",
    prescriptionNumber: pickNullableString(raw, [
      "prescriptionNumber",
      "prescription_number",
      "referenceNumber",
    ]),
    medicationName:
      pickString(raw, ["medicationName", "medication_name", "drugName", "drug_name"]) ??
      pickString(medication, ["name", "displayName"]) ??
      "Medication",
    dosage: pickNullableString(raw, ["dosage", "dose"]),
    frequency: pickNullableString(raw, ["frequency"]),
    duration: pickNullableString(raw, ["duration"]),
    quantity: pickNullableString(raw, ["quantity"]),
    instructions: pickText(raw, ["instructions", "direction", "directions"]) ?? null,
    status: pickString(raw, ["status", "prescriptionStatus", "prescription_status"]) ?? "active",
    prescribedAt: pickNullableString(raw, ["prescribedAt", "issuedAt", "createdAt", "date"]),
    expiresAt: pickNullableString(raw, ["expiresAt", "expiryDate", "endDate"]),
    refillsRemaining: pickNullableNumber(raw, [
      "refillsRemaining",
      "refillCount",
      "remainingRefills",
    ]),
    prescriberName:
      pickNullableString(raw, ["prescriberName", "doctorName", "doctor_name"]) ??
      pickNullableString(prescriber, ["displayName", "name", "fullName"]),
    diagnosis: pickNullableString(raw, ["diagnosis"]),
    notes: pickNullableString(raw, ["notes", "note"]),
  };
};

const normalizeLabOrder = (payload: unknown): LabOrder => {
  const raw = unwrapPayload(payload);
  const laboratory = mergeRecords(pickRecord(raw, ["laboratory", "lab"]));
  const doctor = mergeRecords(pickRecord(raw, ["doctor", "orderingDoctor", "provider"]));
  const test = mergeRecords(pickRecord(raw, ["test", "panel"]));

  return {
    id: pickString(raw, ["id", "_id", "labOrderId", "lab_order_id", "orderId", "order_id"]) ?? "",
    orderNumber: pickNullableString(raw, ["orderNumber", "order_number", "referenceNumber"]),
    testName:
      pickString(raw, ["testName", "test_name", "name"]) ??
      pickString(test, ["name", "displayName"]) ??
      "Lab test",
    category:
      pickNullableString(raw, ["category", "testCategory", "test_category"]) ??
      pickNullableString(test, ["category"]),
    status: pickString(raw, ["status", "orderStatus", "order_status"]) ?? "pending",
    orderedAt: pickNullableString(raw, ["orderedAt", "createdAt", "dateOrdered", "date"]),
    scheduledAt: pickNullableString(raw, ["scheduledAt", "scheduledFor", "appointmentDate"]),
    laboratoryName:
      pickNullableString(raw, ["laboratoryName", "labName", "lab_name"]) ??
      pickNullableString(laboratory, ["name", "displayName"]),
    orderingDoctorName:
      pickNullableString(raw, ["orderingDoctorName", "doctorName", "doctor_name"]) ??
      pickNullableString(doctor, ["displayName", "name", "fullName"]),
    instructions: pickText(raw, ["instructions", "notes"]) ?? null,
  };
};

const normalizeLabResultMeasurement = (payload: unknown): LabResultMeasurement => {
  const raw = asRecord(payload);

  return {
    name: pickString(raw, ["name", "parameter", "label", "testName"]) ?? "Measurement",
    value: pickNullableString(raw, ["value", "result"]),
    unit: pickNullableString(raw, ["unit"]),
    referenceRange: pickNullableString(raw, ["referenceRange", "range", "normalRange"]),
    status: pickNullableString(raw, ["status", "flag"]),
  };
};

const normalizeLabResult = (payload: unknown): LabResult => {
  const raw = unwrapPayload(payload);
  const laboratory = mergeRecords(pickRecord(raw, ["laboratory", "lab"]));
  const doctor = mergeRecords(pickRecord(raw, ["doctor", "orderingDoctor", "provider"]));
  const test = mergeRecords(pickRecord(raw, ["test", "panel"]));

  const measurementsSource =
    (getListEnvelope(raw.measurements).items.length > 0 && getListEnvelope(raw.measurements).items) ||
    (getListEnvelope(raw.values).items.length > 0 && getListEnvelope(raw.values).items) ||
    (getListEnvelope(raw.components).items.length > 0 && getListEnvelope(raw.components).items) ||
    [];

  const attachments = [
    ...pickStringArray(raw, ["attachments"]),
    ...pickStringArray(raw, ["files"]),
  ];

  return {
    id: pickString(raw, ["id", "_id", "resultId", "result_id", "labResultId", "lab_result_id"]) ?? "",
    resultNumber: pickNullableString(raw, ["resultNumber", "result_number", "referenceNumber"]),
    testName:
      pickString(raw, ["testName", "test_name", "name"]) ??
      pickString(test, ["name", "displayName"]) ??
      "Lab result",
    category:
      pickNullableString(raw, ["category", "testCategory", "test_category"]) ??
      pickNullableString(test, ["category"]),
    status: pickString(raw, ["status", "resultStatus", "result_status"]) ?? "completed",
    orderedAt: pickNullableString(raw, ["orderedAt", "createdAt", "dateOrdered"]),
    collectedAt: pickNullableString(raw, ["collectedAt", "sampleCollectedAt"]),
    reportedAt: pickNullableString(raw, ["reportedAt", "completedAt", "issuedAt", "date"]),
    laboratoryName:
      pickNullableString(raw, ["laboratoryName", "labName", "lab_name"]) ??
      pickNullableString(laboratory, ["name", "displayName"]),
    orderingDoctorName:
      pickNullableString(raw, ["orderingDoctorName", "doctorName", "doctor_name"]) ??
      pickNullableString(doctor, ["displayName", "name", "fullName"]),
    interpretation: pickNullableString(raw, ["interpretation", "summary"]),
    conclusion: pickNullableString(raw, ["conclusion", "impression"]),
    notes: pickNullableString(raw, ["notes", "comment"]),
    reportUrl: pickNullableString(raw, ["reportUrl", "pdfUrl", "downloadUrl"]),
    isAbnormal: pickBoolean(raw, ["isAbnormal", "abnormal"]) ?? false,
    measurements: measurementsSource.map(normalizeLabResultMeasurement),
    attachments,
  };
};

export const patientService = {
  getDashboardSummary: async (): Promise<PatientDashboardSummary> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/dashboard-summary", {
      method: "GET",
      auth: true,
    });

    return normalizeDashboardSummary(response);
  },

  getProfile: async (): Promise<PatientProfile> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/profile", {
      method: "GET",
      auth: true,
    });

    return normalizePatientProfile(response);
  },

  updateProfile: async (payload: UpdatePatientProfileRequest): Promise<PatientProfile> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/profile", {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizePatientProfile(response);
  },

  getMedicalProfile: async (): Promise<PatientMedicalProfile> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/medical-profile", {
      method: "GET",
      auth: true,
    });

    return normalizePatientMedicalProfile(response);
  },

  updateMedicalProfile: async (
    payload: UpdatePatientMedicalProfileRequest,
  ): Promise<PatientMedicalProfile> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/medical-profile", {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizePatientMedicalProfile(response);
  },

  getEmergencyContact: async (): Promise<EmergencyContact> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/emergency-contact", {
      method: "GET",
      auth: true,
    });

    return normalizeEmergencyContact(response);
  },

  updateEmergencyContact: async (
    payload: UpdateEmergencyContactRequest,
  ): Promise<EmergencyContact> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/emergency-contact", {
      method: "PUT",
      body: payload,
      auth: true,
    });

    return normalizeEmergencyContact(response);
  },

  getInsurance: async (): Promise<InsuranceInfo> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/insurance", {
      method: "GET",
      auth: true,
    });

    return normalizeInsuranceInfo(response);
  },

  updateInsurance: async (payload: UpdateInsuranceInfoRequest): Promise<InsuranceInfo> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/insurance", {
      method: "PUT",
      body: payload,
      auth: true,
    });

    return normalizeInsuranceInfo(response);
  },

  getMedicalHistorySummary: async (): Promise<MedicalHistorySummary> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/medical-history-summary", {
      method: "GET",
      auth: true,
    });

    return normalizeMedicalHistorySummary(response);
  },

  getAppointments: async (
    params?: AppointmentFilterParams,
  ): Promise<PaginatedResponse<Appointment>> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/appointments", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizeAppointment);
  },

  getUpcomingAppointments: async (): Promise<Appointment[]> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/appointments/upcoming", {
      method: "GET",
      auth: true,
    });

    return getListEnvelope(response).items.map(normalizeAppointment);
  },

  getAppointmentById: async (appointmentId: string): Promise<Appointment> => {
    const response = await apiRequest<unknown>(`/api/v1/patients/me/appointments/${appointmentId}`, {
      method: "GET",
      auth: true,
    });

    return normalizeAppointment(response);
  },

  getPrescriptions: async (
    params?: PrescriptionFilterParams,
  ): Promise<PaginatedResponse<Prescription>> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/prescriptions", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizePrescription);
  },

  getPrescriptionById: async (prescriptionId: string): Promise<Prescription> => {
    const response = await apiRequest<unknown>(`/api/v1/patients/me/prescriptions/${prescriptionId}`, {
      method: "GET",
      auth: true,
    });

    return normalizePrescription(response);
  },

  getLabOrders: async (params?: LabOrderFilterParams): Promise<PaginatedResponse<LabOrder>> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/lab-orders", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizeLabOrder);
  },

  getLabResults: async (
    params?: LabResultFilterParams,
  ): Promise<PaginatedResponse<LabResult>> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/lab-results", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizeLabResult);
  },

  getLabResultById: async (resultId: string): Promise<LabResult> => {
    const response = await apiRequest<unknown>(`/api/v1/patients/me/lab-results/${resultId}`, {
      method: "GET",
      auth: true,
    });

    return normalizeLabResult(response);
  },
};
