export interface DoctorDashboardQuickStats {
  totalPatients?: number | null;
  totalPatientsCount?: number | null;
  pendingRequests?: number | null;
  pendingRequestsCount?: number | null;
}

export interface DoctorDashboardQueueItem {
  id?: string;
  patientId?: string | null;
  patientName?: string | null;
  status?: string | null;
  reason?: string | null;
  scheduledAt?: string | null;
}

export interface DoctorDashboardSummary {
  doctorId?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  email?: string;
  specialty?: string;
  subspecialty?: string | null;
  clinicName?: string | null;
  yearsOfExperience?: number | null;
  rating?: number | null;
  totalPatientsCount?: number | null;
  totalAppointmentsToday?: number | null;
  completedAppointmentsToday?: number | null;
  upcomingAppointmentsToday?: number | null;
  pendingAppointmentRequestsCount?: number | null;
  nextAvailableSlot?: string | null;
  profileCompletionPercentage?: number | null;
  quickStats?: DoctorDashboardQuickStats | null;
  todayQueue?: DoctorDashboardQueueItem[];
}

export interface DoctorProfile {
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
  bio?: string;
  avatarUrl?: string | null;
}

export interface UpdateDoctorProfileRequest {
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
  bio?: string;
}

export interface DoctorProfessionalProfile {
  specialty?: string;
  subspecialty?: string | null;
  licenseNumber?: string;
  yearsOfExperience?: number | null;
  consultationFee?: number | null;
  about?: string;
  education?: string[];
  certifications?: string[];
  languages?: string[];
  clinicName?: string;
  clinicAddress?: string;
  hospitalAffiliations?: string[];
  servicesOffered?: string[];
}

export interface UpdateDoctorProfessionalProfileRequest {
  specialty?: string;
  subspecialty?: string | null;
  licenseNumber?: string;
  yearsOfExperience?: number | null;
  consultationFee?: number | null;
  about?: string;
  education?: string[];
  certifications?: string[];
  languages?: string[];
  clinicName?: string;
  clinicAddress?: string;
  hospitalAffiliations?: string[];
  servicesOffered?: string[];
}

export interface DoctorAvailabilityDay {
  dayOfWeek: string;
  isAvailable: boolean;
  startTime?: string | null;
  endTime?: string | null;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  maxAppointments?: number | null;
}

export interface DoctorAvailabilitySlot {
  startTime: string;
  endTime: string;
}

export interface DoctorAvailabilityDaySchedule {
  dayOfWeek: string;
  isAvailable: boolean;
  slots: DoctorAvailabilitySlot[];
  breakStartTime?: string | null;
  breakEndTime?: string | null;
  maxAppointments?: number | null;
}

export interface DoctorAvailability {
  timezone?: string;
  appointmentDurationMinutes?: number | null;
  bufferBetweenAppointmentsMinutes?: number | null;
  notes?: string | null;
  weeklySchedule: DoctorAvailabilityDay[];
  weeklyScheduleJson?: DoctorAvailabilityDaySchedule[] | null;
}

export interface UpdateDoctorAvailabilityRequest {
  timezone?: string;
  appointmentDurationMinutes?: number | null;
  slotDurationMinutes?: number | null;
  slot_duration_minutes?: number | null;
  bufferBetweenAppointmentsMinutes?: number | null;
  notes?: string | null;
  weeklySchedule:
    | Record<string, DoctorAvailabilitySlot[]>
    | DoctorAvailabilityDay[];
  weeklyScheduleJson?: DoctorAvailabilityDaySchedule[] | null;
  weekly_schedule_json?: DoctorAvailabilityDaySchedule[] | null;
}
