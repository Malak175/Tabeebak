export type CanonicalLabOrderStatus =
  | "PENDING"
  | "SAMPLE_COLLECTION_REQUESTED"
  | "SAMPLE_COLLECTED"
  | "IN_PROGRESS"
  | "RESULT_UPLOADED"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export type LabWorkflowBucket = "inbox" | "activeWork" | "resultsReady" | "archive";

const STATUS_LABELS: Record<CanonicalLabOrderStatus, string> = {
  PENDING: "Pending",
  SAMPLE_COLLECTION_REQUESTED: "Collection Requested",
  SAMPLE_COLLECTED: "Sample Collected",
  IN_PROGRESS: "In Progress",
  RESULT_UPLOADED: "Results Ready",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  REJECTED: "Rejected",
};

const CANONICAL_STATUS_BY_KEY: Record<string, CanonicalLabOrderStatus> = {
  PENDING: "PENDING",
  SAMPLE_COLLECTION_REQUESTED: "SAMPLE_COLLECTION_REQUESTED",
  SAMPLE_COLLECTED: "SAMPLE_COLLECTED",
  IN_PROGRESS: "IN_PROGRESS",
  RESULT_UPLOADED: "RESULT_UPLOADED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED",
};

const LEGACY_STATUS_ALIASES: Record<string, CanonicalLabOrderStatus> = {
  APPROVED: "IN_PROGRESS",
  ACCEPTED: "IN_PROGRESS",
  PROCESSING: "IN_PROGRESS",
  REQUESTED: "SAMPLE_COLLECTION_REQUESTED",
  // Legacy intermediary value removed from the official workflow.
  ASSIGNED_TO_DOCTOR: "RESULT_UPLOADED",
};

const LAB_STATUS_CLASS_NAMES: Record<CanonicalLabOrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  SAMPLE_COLLECTION_REQUESTED: "bg-blue-100 text-blue-700 border-blue-200",
  SAMPLE_COLLECTED: "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  RESULT_UPLOADED: "bg-green-100 text-green-700 border-green-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_BUCKETS: Record<LabWorkflowBucket, CanonicalLabOrderStatus[]> = {
  inbox: ["PENDING"],
  activeWork: ["SAMPLE_COLLECTION_REQUESTED", "SAMPLE_COLLECTED", "IN_PROGRESS"],
  resultsReady: ["RESULT_UPLOADED"],
  archive: ["COMPLETED", "REJECTED", "CANCELLED"],
};

const WORKFLOW_TRANSITIONS: Record<CanonicalLabOrderStatus, CanonicalLabOrderStatus[]> = {
  PENDING: ["SAMPLE_COLLECTION_REQUESTED", "IN_PROGRESS", "REJECTED", "CANCELLED"],
  SAMPLE_COLLECTION_REQUESTED: ["SAMPLE_COLLECTED", "CANCELLED"],
  SAMPLE_COLLECTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["RESULT_UPLOADED", "CANCELLED"],
  RESULT_UPLOADED: ["COMPLETED"],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
};

const TERMINAL_STATUSES: CanonicalLabOrderStatus[] = ["COMPLETED", "REJECTED", "CANCELLED"];

export const normalizeLabStatusKey = (value?: string | null) =>
  (value ?? "")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toUpperCase();

export const normalizeLabOrderStatus = (status?: string | null): CanonicalLabOrderStatus | "" => {
  const key = normalizeLabStatusKey(status);
  if (!key) return "";
  if (key === "CANCELED") return "CANCELLED";
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

export const canReviewLabOrder = (status?: string | null) => normalizeLabOrderStatus(status) === "PENDING";

export const canUploadLabResult = (status?: string | null) => normalizeLabOrderStatus(status) === "IN_PROGRESS";

export const isTerminalLabOrderStatus = (status?: string | null) => {
  const canonical = normalizeLabOrderStatus(status);
  return Boolean(canonical && TERMINAL_STATUSES.includes(canonical));
};

export const canReplyOnLabOrder = (status?: string | null) => !isTerminalLabOrderStatus(status);

export const isResultReadyStatus = (status?: string | null) => {
  const canonical = normalizeLabOrderStatus(status);
  return canonical === "RESULT_UPLOADED";
};

export const isPatientResultVisibleStatus = (status?: string | null) =>
  ["RESULT_UPLOADED", "COMPLETED"].includes(normalizeLabOrderStatus(status));
