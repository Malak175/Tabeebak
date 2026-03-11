import { apiRequest } from "@/services/api";
import type {
  EmergencyContact,
  InsuranceInfo,
  MedicalHistorySummary,
  PatientDashboardSummary,
  PatientDoctorSummary,
  PatientMedicalProfile,
  PatientProfile,
  PatientRecentLabResult,
  PatientUpcomingAppointment,
  PatientVitalsSnapshot,
  UpdateEmergencyContactRequest,
  UpdateInsuranceInfoRequest,
  UpdatePatientMedicalProfileRequest,
  UpdatePatientProfileRequest,
} from "@/types/patient.types";

const asObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const unwrapPayload = (payload: unknown): Record<string, unknown> => {
  const record = asObject(payload);
  const nested =
    record.data ??
    record.result ??
    record.summary ??
    record.profile ??
    record.medicalProfile ??
    record.emergencyContact ??
    record.insurance ??
    record.history ??
    payload;

  return asObject(nested);
};

const pickString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
};

const pickNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const pickList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const toAvatarText = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "PT";

const normalizeDoctorSummary = (payload: unknown): PatientDoctorSummary => {
  const data = asObject(payload);

  return {
    id: String(data.id ?? data._id ?? data.doctorId ?? ""),
    name: pickString(data.name, data.fullName) ?? "Assigned doctor",
    specialty: pickString(data.specialty),
    experience: pickString(data.experience),
    location: pickString(data.location, data.clinicAddress),
    phone: pickString(data.phone),
    email: pickString(data.email),
    avatarUrl: pickString(data.avatarUrl, data.avatar),
  };
};

const normalizeUpcomingAppointment = (payload: unknown): PatientUpcomingAppointment => {
  const data = asObject(payload);
  const doctorName = pickString(data.doctorName, data.doctor, data.providerName) ?? "Assigned doctor";

  return {
    id: String(data.id ?? data._id ?? data.appointmentId ?? ""),
    doctorName,
    specialty: pickString(data.specialty),
    date: pickString(data.date, data.appointmentDate, data.scheduledFor),
    time: pickString(data.time, data.appointmentTime),
    status: pickString(data.status),
    avatarText: pickString(data.avatarText) ?? toAvatarText(doctorName),
  };
};

const normalizeRecentLabResult = (payload: unknown): PatientRecentLabResult => {
  const data = asObject(payload);

  return {
    id: String(data.id ?? data._id ?? data.resultId ?? ""),
    name: pickString(data.name, data.testName) ?? "Lab result",
    date: pickString(data.date, data.resultDate),
    status: pickString(data.status),
    doctorName: pickString(data.doctorName, data.doctor),
  };
};

const normalizeVitals = (payload: unknown): PatientVitalsSnapshot => {
  const data = asObject(payload);

  return {
    heartRate: pickNumber(data.heartRate),
    bloodPressure: pickString(data.bloodPressure),
    weightKg: pickNumber(data.weightKg ?? data.weight),
    bmi: pickNumber(data.bmi),
    bloodSugarMgDl: pickNumber(data.bloodSugarMgDl ?? data.bloodSugar),
  };
};

const normalizePatientProfile = (payload: unknown): PatientProfile => {
  const data = unwrapPayload(payload);
  const firstName = pickString(data.firstName);
  const lastName = pickString(data.lastName);
  const combinedName = [firstName, lastName].filter(Boolean).join(" ");
  const fullName =
    pickString(data.fullName, data.name) ?? (combinedName || undefined);

  return {
    id: String(data.id ?? data._id ?? data.patientId ?? ""),
    firstName,
    lastName,
    fullName,
    email: pickString(data.email),
    phone: pickString(data.phone),
    dateOfBirth: pickString(data.dateOfBirth, data.birthDate),
    gender: pickString(data.gender),
    address: pickString(data.address),
    city: pickString(data.city),
    country: pickString(data.country),
    occupation: pickString(data.occupation),
    maritalStatus: pickString(data.maritalStatus),
  };
};

const normalizePatientMedicalProfile = (payload: unknown): PatientMedicalProfile => {
  const data = unwrapPayload(payload);

  return {
    bloodType: pickString(data.bloodType),
    heightCm: pickNumber(data.heightCm ?? data.height),
    weightKg: pickNumber(data.weightKg ?? data.weight),
    allergies: pickList(data.allergies),
    chronicConditions: pickList(data.chronicConditions),
    currentMedications: pickList(data.currentMedications),
    pastSurgeries: pickList(data.pastSurgeries),
    familyHistory: pickList(data.familyHistory),
    notes: pickString(data.notes),
  };
};

const normalizeEmergencyContact = (payload: unknown): EmergencyContact => {
  const data = unwrapPayload(payload);

  return {
    name: pickString(data.name),
    relationship: pickString(data.relationship),
    phone: pickString(data.phone),
    alternatePhone: pickString(data.alternatePhone),
    address: pickString(data.address),
  };
};

const normalizeInsuranceInfo = (payload: unknown): InsuranceInfo => {
  const data = unwrapPayload(payload);

  return {
    providerName: pickString(data.providerName, data.provider),
    policyNumber: pickString(data.policyNumber),
    memberId: pickString(data.memberId),
    groupNumber: pickString(data.groupNumber),
    coverageDetails: pickString(data.coverageDetails, data.coverage),
    expiryDate: pickString(data.expiryDate),
  };
};

const normalizeMedicalHistorySummary = (payload: unknown): MedicalHistorySummary => {
  const data = unwrapPayload(payload);

  return {
    allergies: pickList(data.allergies),
    chronicConditions: pickList(data.chronicConditions),
    currentMedications: pickList(data.currentMedications),
    pastSurgeries: pickList(data.pastSurgeries),
    familyHistory: pickList(data.familyHistory),
    notes: pickString(data.notes),
    lastUpdated: pickString(data.lastUpdated, data.updatedAt),
  };
};

const normalizeDashboardSummary = (payload: unknown): PatientDashboardSummary => {
  const data = unwrapPayload(payload);

  return {
    patientName: pickString(data.patientName, data.name),
    primaryDoctor: data.primaryDoctor ? normalizeDoctorSummary(data.primaryDoctor) : null,
    upcomingAppointmentsCount: pickNumber(data.upcomingAppointmentsCount) ?? 0,
    pendingLabResultsCount: pickNumber(data.pendingLabResultsCount) ?? 0,
    vitals: data.vitals ? normalizeVitals(data.vitals) : undefined,
    upcomingAppointments: Array.isArray(data.upcomingAppointments)
      ? data.upcomingAppointments.map(normalizeUpcomingAppointment)
      : [],
    recentLabResults: Array.isArray(data.recentLabResults)
      ? data.recentLabResults.map(normalizeRecentLabResult)
      : [],
    dailyTip: pickString(data.dailyTip, data.healthTip),
  };
};

export const patientService = {
  async getDashboardSummary(): Promise<PatientDashboardSummary> {
    const response = await apiRequest<unknown>("/api/v1/patients/me/dashboard-summary", {
      auth: true,
    });

    return normalizeDashboardSummary(response);
  },

  async getProfile(): Promise<PatientProfile> {
    const response = await apiRequest<unknown>("/api/v1/patients/me/profile", {
      auth: true,
    });

    return normalizePatientProfile(response);
  },

  async updateProfile(payload: UpdatePatientProfileRequest): Promise<PatientProfile> {
    const response = await apiRequest<unknown>("/api/v1/patients/me/profile", {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizePatientProfile(response);
  },

  async getMedicalProfile(): Promise<PatientMedicalProfile> {
    const response = await apiRequest<unknown>("/api/v1/patients/me/medical-profile", {
      auth: true,
    });

    return normalizePatientMedicalProfile(response);
  },

  async updateMedicalProfile(
    payload: UpdatePatientMedicalProfileRequest,
  ): Promise<PatientMedicalProfile> {
    const response = await apiRequest<unknown>("/api/v1/patients/me/medical-profile", {
      method: "PATCH",
      body: payload,
      auth: true,
    });

    return normalizePatientMedicalProfile(response);
  },

  async getEmergencyContact(): Promise<EmergencyContact> {
    const response = await apiRequest<unknown>("/api/v1/patients/me/emergency-contact", {
      auth: true,
    });

    return normalizeEmergencyContact(response);
  },

  async updateEmergencyContact(
    payload: UpdateEmergencyContactRequest,
  ): Promise<EmergencyContact> {
    const response = await apiRequest<unknown>("/api/v1/patients/me/emergency-contact", {
      method: "PUT",
      body: payload,
      auth: true,
    });

    return normalizeEmergencyContact(response);
  },

  async getInsurance(): Promise<InsuranceInfo> {
    const response = await apiRequest<unknown>("/api/v1/patients/me/insurance", {
      auth: true,
    });

    return normalizeInsuranceInfo(response);
  },

  async updateInsurance(payload: UpdateInsuranceInfoRequest): Promise<InsuranceInfo> {
    const response = await apiRequest<unknown>("/api/v1/patients/me/insurance", {
      method: "PUT",
      body: payload,
      auth: true,
    });

    return normalizeInsuranceInfo(response);
  },

  async getMedicalHistorySummary(): Promise<MedicalHistorySummary> {
    const response = await apiRequest<unknown>("/api/v1/patients/me/medical-history-summary", {
      auth: true,
    });

    return normalizeMedicalHistorySummary(response);
  },
};
