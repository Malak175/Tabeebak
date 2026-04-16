export type CanonicalLabOrderStatus =
  | "Pending"
  | "Sample_Collection_Requested"
  | "Sample_Collected"
  | "In_Progress"
  | "Result_Uploaded"
  | "Completed"
  | "Cancelled"
  | "Rejected";

export type LabWorkflowBucket = "inbox" | "activeWork" | "resultsReady" | "archive";

const STATUS_LABELS: Record<CanonicalLabOrderStatus, string> = {
  Pending: "Pending",
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

const LAB_STATUS_CLASS_NAMES: Record<CanonicalLabOrderStatus, string> = {
  Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Sample_Collection_Requested: "bg-blue-100 text-blue-700 border-blue-200",
  Sample_Collected: "bg-blue-100 text-blue-700 border-blue-200",
  In_Progress: "bg-blue-100 text-blue-700 border-blue-200",
  Result_Uploaded: "bg-green-100 text-green-700 border-green-200",
  Completed: "bg-green-100 text-green-700 border-green-200",
  Cancelled: "bg-red-100 text-red-700 border-red-200",
  Rejected: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_BUCKETS: Record<LabWorkflowBucket, CanonicalLabOrderStatus[]> = {
  inbox: ["Pending"],
  activeWork: ["Sample_Collection_Requested", "Sample_Collected", "In_Progress"],
  resultsReady: ["Result_Uploaded"],
  archive: ["Completed", "Rejected", "Cancelled"],
};

const WORKFLOW_TRANSITIONS: Record<CanonicalLabOrderStatus, CanonicalLabOrderStatus[]> = {
  Pending: ["Sample_Collection_Requested", "In_Progress", "Rejected", "Cancelled"],
  Sample_Collection_Requested: ["Sample_Collected", "Cancelled"],
  Sample_Collected: ["In_Progress", "Cancelled"],
  In_Progress: ["Result_Uploaded", "Cancelled"],
  Result_Uploaded: ["Completed"],
  Completed: [],
  Rejected: [],
  Cancelled: [],
};

const TERMINAL_STATUSES: CanonicalLabOrderStatus[] = ["Completed", "Rejected", "Cancelled"];

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

export const getLabStatusLabel = (status: CanonicalLabOrderStatus) => STATUS_LABELS[status];

export const formatLabStatusLabel = (status?: string | null) => {
  const canonical = normalizeLabOrderStatus(status);
  if (!canonical) return "Unknown";
  return STATUS_LABELS[canonical];
};

export const getLabStatusBadgeClassName = (status?: string | null) => {
  const canonical = normalizeLabOrderStatus(status);
  if (!canonical) return "bg-muted text-muted-foreground border-border";
  return LAB_STATUS_CLASS_NAMES[canonical];
};

export const getLabStatusesForBucket = (bucket: LabWorkflowBucket) => STATUS_BUCKETS[bucket];

export const getLabWorkflowBucket = (status?: string | null): LabWorkflowBucket | "" => {
  const canonical = normalizeLabOrderStatus(status);
  if (!canonical) return "";
  if (STATUS_BUCKETS.inbox.includes(canonical)) return "inbox";
  if (STATUS_BUCKETS.activeWork.includes(canonical)) return "activeWork";
  if (STATUS_BUCKETS.resultsReady.includes(canonical)) return "resultsReady";
  if (STATUS_BUCKETS.archive.includes(canonical)) return "archive";
  return "";
};

export const isInLabStatusBucket = (status: string | null | undefined, bucket: LabWorkflowBucket) => {
  const canonical = normalizeLabOrderStatus(status);
  return Boolean(canonical && STATUS_BUCKETS[bucket].includes(canonical));
};

export const getNextLabOrderStatuses = (status?: string | null) => {
  const canonical = normalizeLabOrderStatus(status);
  if (!canonical) return [];
  return WORKFLOW_TRANSITIONS[canonical] ?? [];
};

export const canReviewLabOrder = (status?: string | null) => normalizeLabOrderStatus(status) === "Pending";

export const canUploadLabResult = (status?: string | null) => normalizeLabOrderStatus(status) === "In_Progress";

export const isTerminalLabOrderStatus = (status?: string | null) => {
  const canonical = normalizeLabOrderStatus(status);
  return Boolean(canonical && TERMINAL_STATUSES.includes(canonical));
};

export const canReplyOnLabOrder = (status?: string | null) => !isTerminalLabOrderStatus(status);

export const isResultReadyStatus = (status?: string | null) => {
  const canonical = normalizeLabOrderStatus(status);
  return canonical === "Result_Uploaded";
};

export const isPatientResultVisibleStatus = (status?: string | null) =>
  normalizeLabOrderStatus(status) === "Completed";
