export interface PatientProfileAddress {
  line1?: string | null;
  line2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
}

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
  secondaryPhone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: PatientProfileAddress;
  avatarUrl?: string | null;
}

export interface UpdatePatientProfileRequest {
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  phone?: string | null;
  secondaryPhone?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: PatientProfileAddress;
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
  medicalNotes?: string | null;
}

export interface UpdatePatientMedicalProfileRequest {
  bloodType?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  allergies?: string[] | null;
  currentMedications?: string[] | null;
  chronicConditions?: string[] | null;
  pastSurgeries?: string[] | null;
  familyHistory?: string[] | null;
  medicalNotes?: string | null;
}

export interface EmergencyContact {
  fullName?: string;
  relationship?: string;
  phone?: string;
  secondaryPhone?: string;
}

export interface UpdateEmergencyContactRequest {
  fullName?: string;
  relationship?: string;
  phone?: string;
  secondaryPhone?: string | null;
}

export interface InsuranceInfo {
  providerName?: string;
  memberId?: string;
  groupNumber?: string | null;
  policyHolderName?: string | null;
  policyHolderRelation?: string | null;
  providerPhone?: string | null;
}

export interface UpdateInsuranceInfoRequest {
  providerName?: string;
  memberId?: string;
  groupNumber?: string | null;
  policyHolderName?: string | null;
  policyHolderRelation?: string | null;
  providerPhone?: string | null;
}

export interface MedicalHistorySummary {
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  surgeries: string[];
  familyHistory: string[];
}
