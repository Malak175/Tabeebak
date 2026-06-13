export const normalizeApiStatusKey = (value?: string | null) =>
  (value ?? "")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toUpperCase();

export const normalizeApiStatusDisplayKey = (value?: string | null) => {
  const normalized = normalizeApiStatusKey(value);
  if (!normalized) return "";
  if (normalized === "CANCELLED" || normalized === "CANCELED") return "REJECTED";
  return normalized;
};

export const isApiStatus = (
  value: string | null | undefined,
  ...expected: string[]
) => {
  const normalized = normalizeApiStatusKey(value);
  return expected.map((item) => normalizeApiStatusKey(item)).includes(normalized);
};

export const isRejectedApiStatus = (value?: string | null) => {
  const normalized = normalizeApiStatusKey(value);
  return ["REJECTED", "CANCELLED", "CANCELED"].includes(normalized);
};

export const formatApiStatusLabel = (value?: string | null) => {
  const normalized = normalizeApiStatusDisplayKey(value);
  if (!normalized) return "Unknown";
  const lowered = normalized.toLowerCase().replace(/_/g, " ");
  return `${lowered.charAt(0).toUpperCase()}${lowered.slice(1)}`;
};
