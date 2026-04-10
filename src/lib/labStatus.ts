const STATUS_LABEL_OVERRIDES: Record<string, string> = {
  sample_collected: "Sample Collected",
  "sample-collected": "Sample Collected",
  in_progress: "In Progress",
  "in-progress": "In Progress",
  result_uploaded: "Result Uploaded",
  "result-uploaded": "Result Uploaded",
};

const toTitleCase = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export const formatLabStatusLabel = (status?: string | null) => {
  if (!status) return "Unknown";
  const normalized = status.trim();
  if (!normalized) return "Unknown";
  const key = normalized.toLowerCase();
  if (STATUS_LABEL_OVERRIDES[key]) return STATUS_LABEL_OVERRIDES[key];
  return toTitleCase(key.replace(/[_-]+/g, " "));
};

export const isResultReadyStatus = (status?: string | null) => {
  if (!status) return false;
  const normalized = status.trim().toLowerCase();
  return normalized === "result_uploaded" || normalized === "result-uploaded";
};
