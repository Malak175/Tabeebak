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

export interface Appointment {
  id: string;
  appointmentNumber?: string | null;
  doctorId?: string | null;
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
  status: string;
  prescribedAt?: string | null;
  expiresAt?: string | null;
  refillsRemaining?: number | null;
  prescriberName?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
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

export interface LabResult {
  id: string;
  resultNumber?: string | null;
  testName: string;
  category?: string | null;
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
  measurements: LabResultMeasurement[];
  attachments: string[];
}
