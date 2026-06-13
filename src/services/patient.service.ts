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
import { normalizeApiStatusKey } from "@/lib/apiStatus";

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

const pickIdValue = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const normalized = value.trim();
      if (normalized) return normalized;
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

const normalizeAddress = (addressRecord: Record<string, unknown>) => {
  const address = {
    line1: pickString(addressRecord, ["line1"]),
    line2: pickString(addressRecord, ["line2"]),
    city: pickString(addressRecord, ["city"]),
    state: pickString(addressRecord, ["state"]),
    country: pickString(addressRecord, ["country"]),
    postalCode: pickString(addressRecord, ["postalCode"]),
  };

  const hasAddress = Object.values(address).some(
    (value) => value !== undefined && value !== null,
  );

  return hasAddress ? address : undefined;
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
  const container = asRecord(raw.data);
  const candidates = [
    container.items,
    raw.items,
    container.results,
    raw.results,
    container.records,
    raw.records,
    container.appointments,
    raw.appointments,
    container.prescriptions,
    raw.prescriptions,
    container.labOrders,
    container.lab_orders,
    container.labResults,
    container.lab_results,
    container.laboratoryResults,
    container.laboratory_results,
    raw.labOrders,
    raw.lab_orders,
    raw.labResults,
    raw.lab_results,
    raw.laboratoryResults,
    raw.laboratory_results,
  ];

  const items = candidates.find(Array.isArray) as unknown[] | undefined;

  return {
    items: items ?? [],
    meta: mergeRecords(
      {
        page: asRecord(container.pagination).page,
        pageSize: asRecord(container.pagination).page_size,
        totalItems: asRecord(container.pagination).total_items,
        totalPages: asRecord(container.pagination).total_pages,
      },
      raw,
      raw.meta,
      raw.pagination,
      container,
      container.meta,
      container.pagination,
    ),
  };
};

const normalizePaginatedResponse = <T>(
  payload: unknown,
  mapItem: (value: unknown) => T,
): PaginatedResponse<T> => {
  const { items, meta } = getListEnvelope(payload);
  const page = pickNumber(meta, ["page", "currentPage", "pageNumber"]) ?? 1;
  const limit =
    pickNumber(meta, ["pageSize", "page_size", "limit", "perPage", "size"]) ??
    (items.length > 0 ? items.length : 10);
  const total = pickNumber(meta, ["totalItems", "total_items", "total", "totalCount", "count"]) ?? items.length;
  const totalPages =
    pickNumber(meta, ["totalPages", "total_pages", "pageCount", "pages"]) ??
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
  const addressRecord = mergeRecords(pickRecord(raw, ["address"]));
  const address = normalizeAddress(addressRecord);

  return {
    id: pickString(raw, ["id", "_id", "patientId", "userId"]),
    email: pickString(raw, ["email"]),
    firstName: pickString(raw, ["firstName"]),
    lastName: pickString(raw, ["lastName"]),
    displayName: pickString(raw, ["displayName"]),
    phone: pickString(raw, ["phone"]),
    secondaryPhone: pickString(raw, ["secondaryPhone"]),
    preferredContactMethod: pickString(raw, ["preferredContactMethod"]),
    preferredLanguage: pickString(raw, ["preferredLanguage"]),
    dateOfBirth: pickString(raw, ["dateOfBirth"]),
    gender: pickString(raw, ["gender"]),
    address,
    avatarUrl: pickNullableString(raw, ["avatarUrl", "avatar", "profileImageUrl", "imageUrl"]),
  };
};

const normalizeDashboardSummary = (payload: unknown): PatientDashboardSummary => {
  const raw = unwrapPayload(payload);

  return {
    patientId: pickString(raw, ["patientId", "id", "_id"]),
    name: pickString(raw, ["name", "fullName", "full_name"]),
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
    bloodType: pickString(raw, ["bloodType"]),
    heightCm: pickNullableNumber(raw, ["heightCm"]),
    weightKg: pickNullableNumber(raw, ["weightKg"]),
    allergies: pickStringArray(raw, ["allergies"]),
    currentMedications: pickStringArray(raw, ["currentMedications"]),
    chronicConditions: pickStringArray(raw, ["chronicConditions"]),
    pastSurgeries: pickStringArray(raw, ["pastSurgeries"]),
    familyHistory: pickStringArray(raw, ["familyHistory"]),
    medicalNotes: pickNullableString(raw, ["medicalNotes"]),
  };
};

const normalizeEmergencyContact = (payload: unknown): EmergencyContact => {
  const raw = unwrapPayload(payload);

  return {
    fullName: pickString(raw, ["fullName"]),
    relationship: pickString(raw, ["relationship"]),
    phone: pickString(raw, ["phone"]),
    secondaryPhone: pickString(raw, ["secondaryPhone"]),
  };
};

const normalizeInsuranceInfo = (payload: unknown): InsuranceInfo => {
  const raw = unwrapPayload(payload);

  return {
    providerName: pickString(raw, ["providerName"]),
    memberId: pickString(raw, ["memberId"]),
    groupNumber: pickNullableString(raw, ["groupNumber"]),
    policyHolderName: pickNullableString(raw, ["policyHolderName"]),
    policyHolderRelation: pickNullableString(raw, ["policyHolderRelation"]),
    providerPhone: pickNullableString(raw, ["providerPhone"]),
  };
};

const normalizeMedicalHistorySummary = (payload: unknown): MedicalHistorySummary => {
  const raw = unwrapPayload(payload);
  const items = mergeRecords(
    pickRecord(raw, ["items"]),
    pickRecord(raw, ["data"]),
    pickRecord(raw, ["summary"]),
  );
  const counts = mergeRecords(pickRecord(raw, ["counts"]));
  const highlights = mergeRecords(pickRecord(raw, ["highlights"]));

  return {
    patientId: pickString(raw, ["patientId", "patient_id"]) ?? pickNumber(raw, ["patientId"]),
    bloodType: pickNullableString(raw, ["bloodType"]),
    bmi: pickNullableNumber(raw, ["bmi"]),
    counts: {
      allergies: pickNumber(counts, ["allergies"]) ?? 0,
      currentMedications: pickNumber(counts, ["currentMedications", "current_medications"]) ?? 0,
      chronicConditions: pickNumber(counts, ["chronicConditions", "chronic_conditions"]) ?? 0,
      pastSurgeries: pickNumber(counts, ["pastSurgeries", "past_surgeries"]) ?? 0,
      familyHistory: pickNumber(counts, ["familyHistory", "family_history"]) ?? 0,
    },
    highlights: {
      hasEmergencyContact:
        pickBoolean(highlights, ["hasEmergencyContact", "has_emergency_contact"]) ?? false,
      hasInsurance: pickBoolean(highlights, ["hasInsurance", "has_insurance"]) ?? false,
      lastMedicalProfileUpdateAt: pickNullableString(highlights, [
        "lastMedicalProfileUpdateAt",
        "last_medical_profile_update_at",
      ]),
    },
    allergies: pickStringArray(items, ["allergies"]),
    currentMedications: pickStringArray(items, ["currentMedications", "current_medications"]),
    chronicConditions: pickStringArray(items, ["chronicConditions", "chronic_conditions"]),
    pastSurgeries: pickStringArray(items, ["pastSurgeries", "past_surgeries"]),
    familyHistory: pickStringArray(items, ["familyHistory", "family_history"]),
  };
};

const normalizeAppointment = (payload: unknown): Appointment => {
  const raw = unwrapPayload(payload);
  const doctor = mergeRecords(
    pickRecord(raw, ["doctor", "physician", "provider"]),
    pickRecord(raw, ["doctorProfile"]),
    pickRecord(raw, ["doctorDetails"]),
  );
  const request = mergeRecords(
    pickRecord(raw, ["request", "appointmentRequest", "appointment_request"]),
    pickRecord(raw, ["appointmentRequestDetails", "requestDetails"]),
  );
  const prescriptionSummary = mergeRecords(
    pickRecord(raw, ["prescription", "appointmentPrescription", "rx", "latestPrescription"]),
  );
  const prescriptionExists =
    pickBoolean(prescriptionSummary, ["exists", "hasPrescription", "has_prescription"]) ??
    pickBoolean(raw, ["hasPrescription", "prescriptionExists", "has_prescription"]) ??
    null;
  const prescriptionLatestId =
    pickIdValue(prescriptionSummary, ["latestId", "latest_id", "prescriptionId", "prescription_id", "id", "_id"]) ??
    pickIdValue(raw, ["prescriptionId", "prescription_id"]);
  const prescriptionRecord = mergeRecords(pickRecord(raw, ["prescription", "appointmentPrescription", "rx"]));
  const prescriptionCandidates = [
    ...getListEnvelope(raw.prescriptions).items,
    ...getListEnvelope(raw.appointmentPrescriptions).items,
    ...getListEnvelope(raw.medications).items,
    ...getListEnvelope(raw.prescriptionItems).items,
    ...getListEnvelope(raw.rx).items,
  ];
  if (Object.keys(prescriptionRecord).length > 0) {
    prescriptionCandidates.push(prescriptionRecord);
  }
  const prescriptions = prescriptionCandidates.map(normalizePrescription).filter((item) => item.id);

  const labOrderCandidates = [
    ...getListEnvelope(raw.labOrders).items,
    ...getListEnvelope(raw.lab_orders).items,
    ...getListEnvelope(raw.orders).items,
    ...getListEnvelope(raw.labOrder).items,
  ];
  const labOrders = labOrderCandidates.map(normalizeLabOrder).filter((item) => item.id);

  const labResultCandidates = [
    ...getListEnvelope(raw.labResults).items,
    ...getListEnvelope(raw.lab_results).items,
    ...getListEnvelope(raw.results).items,
    ...getListEnvelope(raw.laboratoryResults).items,
    ...getListEnvelope(raw.laboratory_results).items,
  ];
  const labResults = labResultCandidates.map(normalizeLabResult).filter((item) => item.id);

  const idValue = pickIdValue(raw, ["id", "_id", "appointmentId", "appointment_id"]);

  return {
    id: idValue !== undefined && idValue !== null ? String(idValue) : "",
    appointmentNumber: pickNullableString(raw, [
      "appointmentNumber",
      "appointment_number",
      "referenceNumber",
    ]),
    reference: pickNullableString(raw, ["reference", "appointmentReference", "appointment_reference"]),
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
    status:
      normalizeApiStatusKey(pickString(raw, ["status", "appointmentStatus", "appointment_status"])) ||
      "SCHEDULED",
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
    requestId:
      pickNullableString(raw, ["requestId", "appointmentRequestId", "appointment_request_id"]) ??
      pickNullableString(request, ["id", "_id", "requestId", "appointmentRequestId", "appointment_request_id"]),
    requestReference:
      pickNullableString(raw, ["requestReference", "requestNumber", "request_number", "reference"]) ??
      pickNullableString(request, ["reference", "requestNumber", "request_number", "referenceNumber"]),
    requestStatus:
      normalizeApiStatusKey(
        pickNullableString(raw, ["requestStatus", "request_status"]) ??
          pickNullableString(request, ["status", "requestStatus", "request_status"]),
      ) || null,
    requestReason:
      pickNullableString(raw, ["requestReason"]) ??
      pickNullableString(request, ["reason", "chiefComplaint", "chief_complaint"]),
    prescription:
      prescriptionExists !== null || prescriptionLatestId
        ? {
            exists: prescriptionExists ?? Boolean(prescriptionLatestId),
            latestId: prescriptionLatestId != null ? String(prescriptionLatestId) : null,
          }
        : null,
    prescriptions: prescriptions.length ? prescriptions : undefined,
    labOrders: labOrders.length ? labOrders : undefined,
    labResults: labResults.length ? labResults : undefined,
  };
};

const normalizePrescription = (payload: unknown): Prescription => {
  const raw = unwrapPayload(payload);
  const medication = mergeRecords(pickRecord(raw, ["medication", "drug"]));
  const prescriber = mergeRecords(pickRecord(raw, ["doctor", "prescriber"]));
  const appointment = mergeRecords(
    pickRecord(raw, ["appointment", "appointmentDetails", "appointmentInfo"]),
    pickRecord(raw, ["visit", "visitDetails"]),
  );
  const idValue = pickIdValue(raw, ["id", "_id", "prescriptionId", "prescription_id"]);
  const quantityValue =
    pickNullableString(raw, ["quantity", "qty", "amount", "dispenseQuantity", "dispense_quantity"]) ??
    (pickNumber(raw, ["quantity", "qty", "amount", "dispenseQuantity", "dispense_quantity"])?.toString() ??
      null);
  const durationValue =
    pickNullableString(raw, ["duration", "durationDays", "duration_days", "daysSupply", "days_supply"]) ??
    (pickNumber(raw, ["duration", "durationDays", "duration_days", "daysSupply", "days_supply"])?.toString() ??
      null);

  return {
    id: idValue !== undefined ? String(idValue) : "",
    prescriptionNumber: pickNullableString(raw, [
      "prescriptionNumber",
      "prescription_number",
      "referenceNumber",
      "reference",
      "reference_id",
      "referenceId",
    ]),
    medicationName:
      pickString(raw, ["medicationName", "medication_name", "drugName", "drug_name", "name"]) ??
      pickString(medication, ["name", "displayName", "genericName"]) ??
      "Medication",
    dosage: pickNullableString(raw, ["dosage", "dose", "strength", "doseAmount", "dose_amount"]),
    frequency: pickNullableString(raw, ["frequency", "freq", "frequencyPerDay", "frequency_per_day"]),
    duration: durationValue,
    quantity: quantityValue,
    instructions: pickText(raw, ["instructions", "direction", "directions", "sig"]) ?? null,
    prescribedAt: pickNullableString(raw, [
      "prescribedAt",
      "issuedAt",
      "createdAt",
      "date",
      "prescribed_on",
    ]),
    expiresAt: pickNullableString(raw, [
      "expiresAt",
      "expiryDate",
      "endDate",
      "expirationDate",
      "expiration_date",
      "expires_on",
    ]),
    refillsRemaining: pickNullableNumber(raw, [
      "refillsRemaining",
      "refillCount",
      "remainingRefills",
      "refills",
      "refills_remaining",
    ]),
    prescriberName:
      pickNullableString(raw, ["prescriberName", "doctorName", "doctor_name", "prescribedBy", "providerName"]) ??
      pickNullableString(prescriber, ["displayName", "name", "fullName", "full_name"]),
    diagnosis:
      pickText(raw, [
        "diagnosis",
        "diagnoses",
        "diagnosisText",
        "icdDescription",
        "icd_description",
        "indication",
      ]) ?? null,
    notes: pickText(raw, ["notes", "note", "remarks", "comment"]) ?? null,
    appointmentId:
      pickNullableString(raw, ["appointmentId", "appointment_id", "visitId", "visit_id"]) ??
      pickNullableString(appointment, ["id", "_id", "appointmentId", "appointment_id"]),
    appointmentNumber:
      pickNullableString(raw, ["appointmentNumber", "appointment_number"]) ??
      pickNullableString(appointment, ["appointmentNumber", "appointment_number", "referenceNumber"]),
    appointmentStatus:
      normalizeApiStatusKey(
        pickNullableString(raw, ["appointmentStatus", "appointment_status"]) ??
          pickNullableString(appointment, ["status", "appointmentStatus", "appointment_status"]),
      ) || null,
    appointmentScheduledAt:
      pickNullableString(raw, ["appointmentDate", "scheduledAt", "scheduledFor"]) ??
      pickNullableString(appointment, [
        "scheduledAt",
        "scheduledFor",
        "appointmentDate",
        "appointmentDateTime",
        "appointment_datetime",
      ]),
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
    // Prefer explicit order/workflow status so a generic `status` field cannot mask `orderStatus`.
    status:
      normalizeApiStatusKey(
        pickString(raw, [
          "orderStatus",
          "order_status",
          "labOrderStatus",
          "lab_order_status",
          "workflowStatus",
          "workflow_status",
          "status",
        ]),
      ) || "PENDING",
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

const normalizeMeasurementMap = (payload: unknown) => {
  const record = asRecord(payload);
  const entries = Object.entries(record);
  if (entries.length === 0) return [];

  return entries.map(([name, value]) => {
    const detail = asRecord(value);
    if (Object.keys(detail).length > 0) {
      return { name, ...detail };
    }
    if (value === null || value === undefined) {
      return { name, value: null };
    }
    return { name, value: String(value) };
  });
};

const normalizeLabResult = (payload: unknown): LabResult => {
  const payloadRecord = unwrapPayload(payload);
  const raw = payloadRecord;
  const resultRecord = mergeRecords(
    pickRecord(raw, ["laboratoryResult", "laboratory_result", "result", "labResult", "lab_result"]),
  );
  const laboratory = mergeRecords(pickRecord(raw, ["laboratory", "lab"]));
  const doctor = mergeRecords(pickRecord(raw, ["doctor", "orderingDoctor", "provider"]));
  const test = mergeRecords(pickRecord(raw, ["test", "panel"]));
  const observations = mergeRecords(pickRecord(raw, ["observations", "observation"]));
  const doctorFollowUpRecord = mergeRecords(
    pickRecord(raw, ["doctorFollowUp", "doctor_follow_up"]),
    pickRecord(raw, ["followUp", "followup", "follow_up", "followUpSummary", "follow_up_summary"]),
    pickRecord(raw, ["appointmentRequest", "appointment_request", "doctorRequest", "doctor_request"]),
  );
  const doctorFollowUpDoctor = mergeRecords(
    pickRecord(doctorFollowUpRecord, ["doctor", "provider", "doctorProfile"]),
  );
  const doctorFollowUpAppointment = mergeRecords(
    pickRecord(doctorFollowUpRecord, ["appointment", "appointmentDetails", "appointmentInfo"]),
  );

  const measurementCandidates = [
    getListEnvelope(raw.measurements).items,
    getListEnvelope(raw.values).items,
    getListEnvelope(raw.components).items,
    getListEnvelope(observations.measurements).items,
    normalizeMeasurementMap(observations.measurements),
  ];
  const measurementsSource = measurementCandidates.find((items) => items.length > 0) ?? [];

  const attachments = [
    ...pickStringArray(raw, ["attachments"]),
    ...pickStringArray(raw, ["files"]),
    ...pickStringArray(raw, ["reportFiles", "report_files"]),
  ];

  const idValue =
    pickIdValue(raw, [
      "id",
      "_id",
      "resultId",
      "result_id",
      "labResultId",
      "lab_result_id",
      "laboratoryResultId",
      "laboratory_result_id",
    ]) ??
    pickIdValue(resultRecord, [
      "id",
      "_id",
      "resultId",
      "result_id",
      "labResultId",
      "lab_result_id",
      "laboratoryResultId",
      "laboratory_result_id",
    ]);

  const doctorFollowUpSummary = {
    exists: pickBoolean(doctorFollowUpRecord, ["exists", "hasFollowUp", "has_follow_up"]) ?? null,
    requestId:
      pickNullableString(doctorFollowUpRecord, [
        "requestId",
        "request_id",
        "appointmentRequestId",
        "appointment_request_id",
        "id",
        "_id",
      ]) ?? null,
    requestStatus:
      pickNullableString(doctorFollowUpRecord, ["status", "requestStatus", "request_status"]) ?? null,
    doctorId:
      pickNullableString(doctorFollowUpDoctor, ["id", "_id", "doctorId", "doctor_id"]) ??
      pickNullableString(doctorFollowUpRecord, ["doctorId", "doctor_id"]) ??
      null,
    doctorName:
      pickNullableString(doctorFollowUpDoctor, ["fullName", "full_name", "displayName", "name"]) ??
      pickNullableString(doctorFollowUpRecord, ["doctorName", "doctor_name", "providerName"]) ??
      null,
    appointmentId:
      pickNullableString(doctorFollowUpAppointment, ["id", "_id", "appointmentId", "appointment_id"]) ??
      pickNullableString(doctorFollowUpRecord, ["appointmentId", "appointment_id"]) ??
      null,
    appointmentStatus:
      pickNullableString(doctorFollowUpAppointment, ["status", "appointmentStatus", "appointment_status"]) ??
      pickNullableString(doctorFollowUpRecord, ["appointmentStatus", "appointment_status"]) ??
      null,
    appointmentScheduledAt:
      pickNullableString(doctorFollowUpAppointment, [
        "scheduledAt",
        "scheduledFor",
        "appointmentDate",
        "appointmentDateTime",
        "appointment_datetime",
      ]) ??
      pickNullableString(doctorFollowUpRecord, ["scheduledAt", "scheduledFor", "appointmentDate"]) ??
      null,
  };
  const hasDoctorFollowUp =
    Object.values(doctorFollowUpSummary).filter((value) => {
      if (value == null) return false;
      if (typeof value === "string") return value.trim().length > 0;
      return true;
    }).length > 0;

  return {
    id: idValue != null ? String(idValue) : "",
    requestId:
      (pickIdValue(raw, ["requestId", "request_id", "testRequestId", "test_request_id"]) ??
        pickIdValue(raw, ["orderId", "order_id", "labOrderId", "lab_order_id"])) ??
      null,
    resultNumber: pickNullableString(raw, ["resultNumber", "result_number", "referenceNumber"]),
    testName:
      pickString(raw, ["testName", "test_name", "name"]) ??
      pickString(test, ["name", "displayName"]) ??
      "Lab result",
    category:
      pickNullableString(raw, ["category", "testCategory", "test_category"]) ??
      pickNullableString(test, ["category"]),
    orderStatus:
      normalizeApiStatusKey(
        pickNullableString(raw, ["orderStatus", "order_status"]) ??
          pickNullableString(resultRecord, ["orderStatus", "order_status"]),
      ) || null,
    status:
      normalizeApiStatusKey(pickString(raw, ["status", "resultStatus", "result_status"])) ||
      "COMPLETED",
    orderedAt: pickNullableString(raw, ["orderedAt", "createdAt", "dateOrdered"]),
    collectedAt: pickNullableString(raw, ["collectedAt", "sampleCollectedAt"]),
    reportedAt: pickNullableString(raw, ["reportedAt", "completedAt", "issuedAt", "date"]),
    laboratoryName:
      pickNullableString(raw, ["laboratoryName", "labName", "lab_name", "laboratory_name"]) ??
      pickNullableString(laboratory, ["name", "displayName"]),
    orderingDoctorName:
      pickNullableString(raw, ["orderingDoctorName", "doctorName", "doctor_name"]) ??
      pickNullableString(doctor, ["displayName", "name", "fullName"]),
    interpretation:
      pickNullableString(raw, ["interpretation", "summary"]) ??
      pickNullableString(observations, ["summary", "interpretation"]),
    conclusion:
      pickNullableString(raw, ["conclusion", "impression"]) ??
      pickNullableString(observations, ["notes", "conclusion"]),
    notes:
      pickNullableString(raw, ["notes", "comment"]) ??
      pickNullableString(observations, ["notes", "comment", "remarks"]),
    reportUrl: pickNullableString(raw, ["reportUrl", "report_url", "pdfUrl", "downloadUrl"]),
    isAbnormal: pickBoolean(raw, ["isAbnormal", "abnormal", "abnormal_flag"]) ?? false,
    doctorFollowUp: hasDoctorFollowUp ? doctorFollowUpSummary : null,
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
    const normalizedPayload: UpdateEmergencyContactRequest = {
      fullName: payload.fullName,
      relationship: payload.relationship,
      phone: payload.phone,
      secondaryPhone: payload.secondaryPhone ?? null,
    };

    const response = await apiRequest<unknown>("/api/v1/patients/me/emergency-contact", {
      method: "PUT",
      body: normalizedPayload,
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
    const normalizedPayload: UpdateInsuranceInfoRequest = {
      providerName: payload.providerName,
      memberId: payload.memberId,
      groupNumber: payload.groupNumber ?? null,
      policyHolderName: payload.policyHolderName ?? null,
      policyHolderRelation: payload.policyHolderRelation ?? null,
      providerPhone: payload.providerPhone ?? null,
    };

    const response = await apiRequest<unknown>("/api/v1/patients/me/insurance", {
      method: "PUT",
      body: normalizedPayload,
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

  getPatientAppointments: async (
    params?: AppointmentFilterParams,
  ): Promise<PaginatedResponse<Appointment>> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/appointments", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizeAppointment);
  },

  getUpcomingPatientAppointments: async (): Promise<Appointment[]> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/appointments/upcoming", {
      method: "GET",
      auth: true,
    });

    return getListEnvelope(response).items.map(normalizeAppointment);
  },

  getPatientAppointmentById: async (appointmentId: string): Promise<Appointment> => {
    const response = await apiRequest<unknown>(`/api/v1/patients/me/appointments/${appointmentId}`, {
      method: "GET",
      auth: true,
    });

    return normalizeAppointment(response);
  },

  getPatientPrescriptions: async (
    params?: PrescriptionFilterParams,
  ): Promise<PaginatedResponse<Prescription>> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/prescriptions", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizePrescription);
  },

  getPatientPrescriptionById: async (prescriptionId: string): Promise<Prescription> => {
    const response = await apiRequest<unknown>(`/api/v1/patients/me/prescriptions/${prescriptionId}`, {
      method: "GET",
      auth: true,
    });

    return normalizePrescription(response);
  },

  getPatientLabOrders: async (
    params?: LabOrderFilterParams,
  ): Promise<PaginatedResponse<LabOrder>> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/lab-orders", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizeLabOrder);
  },

  getPatientLabResults: async (
    params?: LabResultFilterParams,
  ): Promise<PaginatedResponse<LabResult>> => {
    const response = await apiRequest<unknown>("/api/v1/patients/me/lab-results", {
      method: "GET",
      params: buildQueryParams(params),
      auth: true,
    });

    return normalizePaginatedResponse(response, normalizeLabResult);
  },

  getPatientLabResultById: async (resultId: string): Promise<LabResult> => {
    const response = await apiRequest<unknown>(`/api/v1/patients/me/lab-results/${resultId}`, {
      method: "GET",
      auth: true,
    });

    return normalizeLabResult(response);
  },

  getPatientLabResultPrediction: async (resultId: string): Promise<unknown> =>
    apiRequest<unknown>(`/api/v1/patients/me/lab-results/${resultId}/predictions`, {
      method: "GET",
      auth: true,
    }),

  runPatientLabResultPrediction: async (
    resultId: string,
    payload: { age: number; gender: string; measurements?: Record<string, number> },
  ): Promise<unknown> =>
    apiRequest<unknown>(`/api/v1/patients/me/lab-results/${resultId}/predict`, {
      method: "POST",
      auth: true,
      body: payload,
    }),
};
