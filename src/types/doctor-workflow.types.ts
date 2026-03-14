export type DoctorWorkflowSortOrder = "asc" | "desc";

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface DoctorAppointmentFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  mode?: string;
  date?: string;
  patientId?: string;
  sortBy?: string;
  sortOrder?: DoctorWorkflowSortOrder;
}

export interface DoctorPatientFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  condition?: string;
  sortBy?: string;
  sortOrder?: DoctorWorkflowSortOrder;
}

export interface DoctorPrescriptionFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  patientId?: string;
  appointmentId?: string;
  sortBy?: string;
  sortOrder?: DoctorWorkflowSortOrder;
}

export interface DoctorReviewFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;
  patientId?: string;
  sortBy?: string;
  sortOrder?: DoctorWorkflowSortOrder;
}

export interface DoctorAppointment {
  id: string;
  appointmentNumber?: string | null;
  patientId?: string | null;
  patientName: string;
  patientAvatarUrl?: string | null;
  patientAge?: number | null;
  patientGender?: string | null;
  scheduledAt?: string | null;
  endAt?: string | null;
  status: string;
  type?: string | null;
  mode?: string | null;
  location?: string | null;
  reason?: string | null;
  complaint?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  joinUrl?: string | null;
  canJoinOnline: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface DoctorPatientListItem {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  age?: number | null;
  gender?: string | null;
  phone?: string | null;
  email?: string | null;
  diagnosis?: string | null;
  condition?: string | null;
  lastVisitAt?: string | null;
  upcomingAppointmentAt?: string | null;
}

export interface DoctorPatientSummaryVitals {
  bloodPressure?: string | null;
  heartRate?: number | null;
  temperatureC?: number | null;
  weightKg?: number | null;
}

export interface DoctorPatientSummary {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  age?: number | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  bloodType?: string | null;
  phone?: string | null;
  email?: string | null;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  recentDiagnoses: string[];
  latestVitals?: DoctorPatientSummaryVitals;
  lastVisitAt?: string | null;
  notes?: string | null;
}

export interface DoctorPrescription {
  id: string;
  prescriptionNumber?: string | null;
  patientId?: string | null;
  patientName?: string | null;
  appointmentId?: string | null;
  medicationName: string;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  quantity?: string | null;
  instructions?: string | null;
  status: string;
  prescribedAt?: string | null;
  expiresAt?: string | null;
  refillsRemaining?: number | null;
  diagnosis?: string | null;
  notes?: string | null;
}

export interface DoctorReview {
  id: string;
  patientId?: string | null;
  patientName: string;
  patientAvatarUrl?: string | null;
  appointmentId?: string | null;
  rating: number;
  title?: string | null;
  comment?: string | null;
  wouldRecommend?: boolean | null;
  createdAt?: string | null;
}

export interface DoctorReviewsSummary {
  averageRating: number;
  totalReviews: number;
  recommendationRate?: number | null;
  ratingBreakdown: Record<number, number>;
}
