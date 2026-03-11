export interface PatientDoctorSummary {
  id: string;
  name: string;
  specialty?: string;
  experience?: string;
  location?: string;
  phone?: string;
  email?: string;
  avatarUrl?: string;
}

export interface PatientUpcomingAppointment {
  id: string;
  doctorName: string;
  specialty?: string;
  date?: string;
  time?: string;
  status?: string;
  avatarText?: string;
}

export interface PatientRecentLabResult {
  id: string;
  name: string;
  date?: string;
  status?: string;
  doctorName?: string;
}

export interface PatientVitalsSnapshot {
  heartRate?: number;
  bloodPressure?: string;
  weightKg?: number;
  bmi?: number;
  bloodSugarMgDl?: number;
}

export interface PatientDashboardSummary {
  patientName?: string;
  primaryDoctor?: PatientDoctorSummary | null;
  upcomingAppointmentsCount: number;
  pendingLabResultsCount: number;
  vitals?: PatientVitalsSnapshot;
  upcomingAppointments: PatientUpcomingAppointment[];
  recentLabResults: PatientRecentLabResult[];
  dailyTip?: string;
}

export interface PatientProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  country?: string;
  occupation?: string;
  maritalStatus?: string;
}

export interface UpdatePatientProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  country?: string;
  occupation?: string;
  maritalStatus?: string;
}

export interface PatientMedicalProfile {
  bloodType?: string;
  heightCm?: number;
  weightKg?: number;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  pastSurgeries: string[];
  familyHistory: string[];
  notes?: string;
}

export interface UpdatePatientMedicalProfileRequest {
  bloodType?: string;
  heightCm?: number;
  weightKg?: number;
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: string[];
  pastSurgeries?: string[];
  familyHistory?: string[];
  notes?: string;
}

export interface EmergencyContact {
  name?: string;
  relationship?: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
}

export interface UpdateEmergencyContactRequest {
  name?: string;
  relationship?: string;
  phone?: string;
  alternatePhone?: string;
  address?: string;
}

export interface InsuranceInfo {
  providerName?: string;
  policyNumber?: string;
  memberId?: string;
  groupNumber?: string;
  coverageDetails?: string;
  expiryDate?: string;
}

export interface UpdateInsuranceInfoRequest {
  providerName?: string;
  policyNumber?: string;
  memberId?: string;
  groupNumber?: string;
  coverageDetails?: string;
  expiryDate?: string;
}

export interface MedicalHistorySummary {
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  pastSurgeries: string[];
  familyHistory: string[];
  notes?: string;
  lastUpdated?: string;
}
