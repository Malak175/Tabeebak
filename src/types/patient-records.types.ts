export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BaseListFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AppointmentFilterParams extends BaseListFilterParams {
  status?: string;
  type?: string;
  from?: string;
  to?: string;
}

export interface PrescriptionFilterParams extends BaseListFilterParams {
  status?: string;
  medicationName?: string;
  prescribedFrom?: string;
  prescribedTo?: string;
}

export interface LabOrderFilterParams extends BaseListFilterParams {
  status?: string;
  category?: string;
  orderedFrom?: string;
  orderedTo?: string;
}

export interface LabResultFilterParams extends BaseListFilterParams {
  status?: string;
  category?: string;
  resultFrom?: string;
  resultTo?: string;
  abnormalOnly?: boolean;
}

export interface AppointmentReviewSummary {
  submitted: boolean;
  id?: string | number | null;
  canEdit?: boolean;
  editableUntil?: string | null;
  rating?: number | null;
  comment?: string | null;
  createdAt?: string | null;
}

export interface AppointmentReview extends AppointmentReviewSummary {
  id?: string | null;
  appointmentId?: string | null;
  rating: number;
}

export interface SubmitAppointmentReviewPayload {
  rating: number;
  comment?: string | null;
}

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | string;

export interface AppointmentDoctor {
  id: string;
  fullName: string;
  specialty?: string | null;
  avatarUrl?: string | null;
}

export interface AvailableSlot {
  startAt: string;
  endAt?: string | null;
  date?: string | null;
  time?: string | null;
}

export interface AvailableSlotsResponse {
  doctorId: string;
  timezone?: string | null;
  slotDurationMinutes?: number | null;
  range: {
    startDate: string;
    endDate: string;
  };
  slots: AvailableSlot[];
}

export interface RescheduleAppointmentPayload {
  scheduledAt: string;
}

export interface Appointment {
  id: string;
  appointmentNumber?: string | null;
  reference?: string | null;
  doctorId?: string | null;
  doctor?: AppointmentDoctor | null;
  doctorName: string;
  doctorSpecialty?: string | null;
  doctorAvatarUrl?: string | null;
  scheduledAt?: string | null;
  endAt?: string | null;
  status: string;
  type?: string | null;
  mode?: string | null;
  location?: string | null;
  reason?: string | null;
  notes?: string | null;
  joinUrl?: string | null;
  canJoinOnline?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  requestId?: string | null;
  requestReference?: string | null;
  requestStatus?: string | null;
  requestReason?: string | null;
  review?: AppointmentReviewSummary | null;
  prescription?: {
    exists: boolean;
    latestId?: string | null;
  } | null;
  prescriptions?: Prescription[];
  labOrders?: LabOrder[];
  labResults?: LabResult[];
}

export interface Prescription {
  id: string;
  prescriptionNumber?: string | null;
  medicationName: string;
  dosage?: string | null;
  frequency?: string | null;
  duration?: string | null;
  quantity?: string | null;
  instructions?: string | null;
  prescribedAt?: string | null;
  expiresAt?: string | null;
  refillsRemaining?: number | null;
  prescriberName?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  appointmentId?: string | null;
  appointmentNumber?: string | null;
  appointmentStatus?: string | null;
  appointmentScheduledAt?: string | null;
}

export interface LabOrder {
  id: string;
  orderNumber?: string | null;
  testName: string;
  category?: string | null;
  status: string;
  orderedAt?: string | null;
  scheduledAt?: string | null;
  laboratoryName?: string | null;
  orderingDoctorName?: string | null;
  instructions?: string | null;
}

export interface LabResultMeasurement {
  name: string;
  value?: string | null;
  unit?: string | null;
  referenceRange?: string | null;
  status?: string | null;
}

export interface LabResultDoctorFollowUp {
  exists?: boolean | null;
  requestId?: string | null;
  requestStatus?: string | null;
  doctorId?: string | null;
  doctorName?: string | null;
  appointmentId?: string | null;
  appointmentStatus?: string | null;
  appointmentScheduledAt?: string | null;
}

export interface LabResult {
  id: string;
  requestId?: string | null;
  resultNumber?: string | null;
  testName: string;
  category?: string | null;
  // Workflow status of the related lab order (used for patient visibility rules).
  orderStatus?: string | null;
  // Processing/publication status of the lab result record itself.
  status: string;
  orderedAt?: string | null;
  collectedAt?: string | null;
  reportedAt?: string | null;
  laboratoryName?: string | null;
  orderingDoctorName?: string | null;
  interpretation?: string | null;
  conclusion?: string | null;
  notes?: string | null;
  reportUrl?: string | null;
  isAbnormal?: boolean;
  doctorFollowUp?: LabResultDoctorFollowUp | null;
  measurements: LabResultMeasurement[];
  attachments: string[];
}
