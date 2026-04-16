export type CanonicalLabOrderStatus =
  | "Pending"
  | "Sample_Collection_Requested"
  | "Sample_Collected"
  | "In_Progress"
  | "Result_Uploaded"
  | "Completed"
  | "Cancelled"
  | "Rejected";

const STATUS_LABELS: Record<CanonicalLabOrderStatus, string> = {
  Pending: "Awaiting Review",
  Sample_Collection_Requested: "Collection Requested",
  Sample_Collected: "Sample Collected",
  In_Progress: "In Progress",
  Result_Uploaded: "Results Ready",
  Completed: "Completed",
  Cancelled: "Cancelled",
  Rejected: "Rejected",
};

const CANONICAL_STATUS_BY_KEY: Record<string, CanonicalLabOrderStatus> = {
  PENDING: "Pending",
  SAMPLE_COLLECTION_REQUESTED: "Sample_Collection_Requested",
  SAMPLE_COLLECTED: "Sample_Collected",
  IN_PROGRESS: "In_Progress",
  RESULT_UPLOADED: "Result_Uploaded",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
};

const LEGACY_STATUS_ALIASES: Record<string, CanonicalLabOrderStatus> = {
  APPROVED: "In_Progress",
  ACCEPTED: "In_Progress",
  PROCESSING: "In_Progress",
  REQUESTED: "Sample_Collection_Requested",
  // Legacy intermediary value removed from the official workflow.
  ASSIGNED_TO_DOCTOR: "Result_Uploaded",
};

export const normalizeLabStatusKey = (value?: string | null) =>
  (value ?? "")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toUpperCase();

export const normalizeLabOrderStatus = (status?: string | null): CanonicalLabOrderStatus | "" => {
  const key = normalizeLabStatusKey(status);
  if (!key) return "";
  if (key === "CANCELED") return "Cancelled";
  return CANONICAL_STATUS_BY_KEY[key] ?? LEGACY_STATUS_ALIASES[key] ?? "";
};

export const formatLabStatusLabel = (status?: string | null) => {
  const canonical = normalizeLabOrderStatus(status);
  if (!canonical) return "Unknown";
  return STATUS_LABELS[canonical];
};

export const isResultReadyStatus = (status?: string | null) => {
  const canonical = normalizeLabOrderStatus(status);
  return canonical === "Result_Uploaded";
};

export const isPatientResultVisibleStatus = (status?: string | null) =>
  normalizeLabOrderStatus(status) === "Completed";
