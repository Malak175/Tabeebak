import { DoctorAvailability } from "@/types/doctor-profile.types";

export type RequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "canceled"
  | "completed"
  | "unknown";

export const VISIT_TYPE_OPTIONS = ["Clinic", "Video", "Phone"] as const;
export type VisitType = (typeof VISIT_TYPE_OPTIONS)[number] | "Home Visit";

export interface DiscoveryLocationParams {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  search?: string;
  specialty?: string;
  service?: string;
}

export interface ProviderSearchParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface DoctorSearchParams extends ProviderSearchParams {
  specialty?: string;
}

export interface LabSearchParams extends ProviderSearchParams {
  service?: string;
}

export interface DoctorDirectoryItem {
  id: string;
  doctorId?: string | null;
  name: string;
  specialty?: string | null;
  subspecialty?: string | null;
  bio?: string | null;
  clinicName?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  experienceYears?: number | null;
  consultationFee?: number | null;
  currency?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  distanceKm?: number | null;
}

export interface DoctorDetail extends DoctorDirectoryItem {
  phone?: string | null;
  email?: string | null;
  languages: string[];
  education: string[];
  certifications: string[];
  servicesOffered: string[];
}

export interface LabDirectoryItem {
  id: string;
  labId?: string | null;
  name: string;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  accreditation?: string | null;
  homeCollectionAvailable?: boolean | null;
  rating?: number | null;
  reviewCount?: number | null;
  distanceKm?: number | null;
}

export interface LabDetail extends LabDirectoryItem {
  website?: string | null;
  establishedYear?: number | null;
  licenseNumber?: string | null;
}

export interface LabBranchDirectoryItem {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  operatingHours?: string | null;
  isMainBranch?: boolean | null;
}

export interface LabServiceDirectoryItem {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  sampleType?: string | null;
  turnaroundTime?: string | null;
  price?: number | null;
  currency?: string | null;
  preparationInstructions?: string | null;
}

export interface RequestMessage {
  id: string;
  senderRole: string;
  senderName?: string | null;
  message: string;
  createdAt?: string | null;
}

export interface ProviderRequestSummary {
  id: string;
  requestNumber?: string | null;
  reference?: string | null;
  status: RequestStatus;
  statusRaw?: string | null;
  statusLabel?: string;
  providerId?: string | null;
  providerName: string;
  providerSubtitle?: string | null;
  providerLocation?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  preferredDateTime?: string | null;
  latestMessage?: string | null;
  latestMessageAt?: string | null;
  patientNote?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  canCancel: boolean;
  canReply: boolean;
}

export interface DoctorRequestSummary extends ProviderRequestSummary {
  doctorId?: string | null;
  appointmentId?: string | null;
  appointmentNumber?: string | null;
  appointmentStatus?: string | null;
  appointmentScheduledAt?: string | null;
  visitType?: VisitType | string | null;
  consultationType?: string | null;
  consultation_type?: string | null;
  reason?: string | null;
}

export interface LabRequestSummary extends ProviderRequestSummary {
  labId?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  selectedServices: string[];
  homeCollection?: boolean | null;
}

export interface DoctorRequestDetail extends DoctorRequestSummary {
  messages: RequestMessage[];
  availability?: DoctorAvailability | null;
}

export interface LabRequestDetail extends LabRequestSummary {
  messages: RequestMessage[];
}

export interface DoctorRequestListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface LabRequestListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface PaginatedList<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface DoctorAvailableSlot {
  startAt: string;
  endAt?: string | null;
  date?: string | null;
  time?: string | null;
}

export interface DoctorAvailableSlotsRange {
  startDate: string;
  endDate: string;
}

export interface DoctorAvailableSlots {
  doctorId: string;
  timezone?: string | null;
  slotDurationMinutes?: number | null;
  range: DoctorAvailableSlotsRange;
  slots: DoctorAvailableSlot[];
}

export interface DoctorAvailableSlotsParams {
  startDate: string;
  endDate: string;
}

export interface CreateAppointmentRequestPayload {
  doctorId: string;
  slotStart?: string;
  preferredDate?: string;
  preferredTime?: string;
  visitType?: VisitType;
  reason: string;
  note?: string;
  phone?: string;
  sourceTestRequestId?: string;
}

export interface CreateTestRequestPayload {
  labId: string;
  preferredDate: string;
  preferredTime: string;
  branchId?: string;
  serviceIds: string[];
  note?: string;
  homeCollection?: boolean;
}

export interface CreateRequestMessagePayload {
  message: string;
}
