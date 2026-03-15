export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BaseLabWorkflowFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface LabOrdersFilterParams extends BaseLabWorkflowFilterParams {
  status?: string;
  category?: string;
  priority?: string;
  orderedFrom?: string;
  orderedTo?: string;
}

export interface LabResultsFilterParams extends BaseLabWorkflowFilterParams {
  status?: string;
  category?: string;
  resultFrom?: string;
  resultTo?: string;
  orderId?: string;
}

export interface SampleCollectionRequestFilterParams extends BaseLabWorkflowFilterParams {
  status?: string;
  priority?: string;
  requestedFrom?: string;
  requestedTo?: string;
}

export interface LabOrderPatientSummary {
  id?: string | null;
  fullName: string;
  age?: number | null;
  gender?: string | null;
  phone?: string | null;
}

export interface LabOrderDoctorSummary {
  id?: string | null;
  fullName?: string | null;
  specialty?: string | null;
}

export interface LabOrderServiceSummary {
  id?: string | null;
  name: string;
  code?: string | null;
  category?: string | null;
  sampleType?: string | null;
  turnaroundTime?: string | null;
}

export interface LabOrder {
  id: string;
  orderNumber?: string | null;
  patientName: string;
  testName: string;
  category?: string | null;
  status: string;
  priority?: string | null;
  sampleId?: string | null;
  orderedAt?: string | null;
  scheduledAt?: string | null;
  collectedAt?: string | null;
  completedAt?: string | null;
  orderingDoctorName?: string | null;
  patientPhone?: string | null;
  serviceName?: string | null;
  progress?: number | null;
  instructions?: string | null;
  notes?: string | null;
  hasResult?: boolean;
}

export interface LabOrderDetails extends LabOrder {
  patient: LabOrderPatientSummary;
  orderingDoctor?: LabOrderDoctorSummary | null;
  service?: LabOrderServiceSummary | null;
  resultId?: string | null;
  resultStatus?: string | null;
  diagnosis?: string | null;
  specimenType?: string | null;
  specimenNotes?: string | null;
  internalNotes?: string | null;
  sampleCollectionRequested?: boolean;
  sampleCollectionStatus?: string | null;
  sampleCollectionAddress?: string | null;
  attachments: string[];
}

export interface UpdateLabOrderStatusRequest {
  status: string;
  notes?: string | null;
}

export interface ReviewLabOrderRequest {
  action: "approve" | "reject";
  message?: string | null;
  notes?: string | null;
}

export interface UploadLabResultValue {
  name: string;
  value?: string | null;
  unit?: string | null;
  referenceRange?: string | null;
  status?: string | null;
}

export interface UploadLabResultRequest {
  status?: string;
  referenceNumber?: string | null;
  summary?: string | null;
  conclusion?: string | null;
  notes?: string | null;
  collectedAt?: string | null;
  reportedAt?: string | null;
  resultFile?: File | null;
  attachments?: File[];
  values?: UploadLabResultValue[];
}

export interface LabResultValue {
  name: string;
  value?: string | null;
  unit?: string | null;
  referenceRange?: string | null;
  status?: string | null;
}

export interface LabResult {
  id: string;
  orderId?: string | null;
  orderNumber?: string | null;
  resultNumber?: string | null;
  patientName: string;
  testName: string;
  category?: string | null;
  status: string;
  priority?: string | null;
  reportedAt?: string | null;
  collectedAt?: string | null;
  orderedAt?: string | null;
  orderingDoctorName?: string | null;
  summary?: string | null;
  conclusion?: string | null;
  notes?: string | null;
  reportUrl?: string | null;
  attachments: string[];
  values: LabResultValue[];
}

export interface SampleCollectionRequest {
  id: string;
  orderId?: string | null;
  orderNumber?: string | null;
  patientName: string;
  patientPhone?: string | null;
  testName: string;
  status: string;
  priority?: string | null;
  requestedAt?: string | null;
  scheduledAt?: string | null;
  address?: string | null;
  notes?: string | null;
}
