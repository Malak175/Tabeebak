export interface PatientDashboardSummary {
  patientId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  assignedDoctorName?: string;
  assignedDoctorSpecialty?: string;
  assignedDoctorAvatarUrl?: string | null;
  upcomingAppointmentsCount?: number;
  pendingLabResultsCount?: number;
  activeMedicationsCount?: number;
  latestHeartRate?: number | null;
  latestBloodPressure?: string | null;
  latestWeightKg?: number | null;
  bmi?: number | null;
  bloodSugarMgDl?: number | null;
  healthTip?: string | null;
}

export interface PatientProfile {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  avatarUrl?: string | null;
}

export interface UpdatePatientProfileRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  alternatePhone?: string;
  dateOfBirth?: string;
  gender?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface PatientMedicalProfile {
  bloodType?: string;
  heightCm?: number | null;
  weightKg?: number | null;
  allergies?: string[];
  currentMedications?: string[];
  chronicConditions?: string[];
  pastSurgeries?: string[];
  familyHistory?: string[];
  notes?: string;
}

export interface UpdatePatientMedicalProfileRequest {
  bloodType?: string;
  heightCm?: number | null;
  weightKg?: number | null;
  allergies?: string[];
  currentMedications?: string[];
  chronicConditions?: string[];
  pastSurgeries?: string[];
  familyHistory?: string[];
  notes?: string;
}

export interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
}

export interface UpdateEmergencyContactRequest {
  name?: string;
  relationship?: string;
  phone?: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
}

export interface InsuranceInfo {
  providerName?: string;
  planName?: string;
  memberId?: string;
  policyNumber?: string;
  groupNumber?: string;
  expiryDate?: string;
  coverageDetails?: string;
}

export interface UpdateInsuranceInfoRequest {
  providerName?: string;
  planName?: string;
  memberId?: string;
  policyNumber?: string;
  groupNumber?: string;
  expiryDate?: string;
  coverageDetails?: string;
}

export interface MedicalHistorySummary {
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  surgeries: string[];
  familyHistory: string[];
}
