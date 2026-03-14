import { apiRequest } from "@/services/api";
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
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const unwrapPayload = (payload: unknown): Record<string, unknown> => {
  const record = asRecord(payload);

  if (record.data && typeof record.data === "object") {
    return asRecord(record.data);
  }

  return record;
};

const pickString = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
};

const pickNullableString = (record: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") {
      return value.trim() || null;
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
};
