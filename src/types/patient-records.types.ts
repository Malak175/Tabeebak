export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AppointmentFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export interface PrescriptionFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  prescribedFrom?: string;
  prescribedTo?: string;
}

export interface LabOrderFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  orderedFrom?: string;
  orderedTo?: string;
}

export interface LabResultFilterParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  resultFrom?: string;
  resultTo?: string;
}

export interface Appointment {
  id: string;
  doctorId?: string;
  doctorName?: string;
  specialty?: string;
  status?: string;
  type?: string;
  scheduledAt?: string;
  date?: string;
  time?: string;
  location?: string;
  reason?: string;
  notes?: string;
}

export interface PrescriptionMedication {
  id: string;
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  doctorId?: string;
  doctorName?: string;
  status?: string;
  prescribedAt?: string;
  diagnosis?: string;
  notes?: string;
  medications: PrescriptionMedication[];
}

export interface LabOrder {
  id: string;
  orderedByDoctorId?: string;
  orderedByDoctorName?: string;
  testName: string;
  status?: string;
  orderedAt?: string;
  scheduledAt?: string;
  labName?: string;
  notes?: string;
}

export interface LabResultMeasurement {
  id: string;
  name: string;
  value?: string;
  unit?: string;
  range?: string;
  status?: string;
}

export interface LabResult {
  id: string;
  labOrderId?: string;
  doctorName?: string;
  labName?: string;
  testName: string;
  status?: string;
  resultDate?: string;
  notes?: string;
  summary?: string;
  fileUrl?: string;
  measurements: LabResultMeasurement[];
}
