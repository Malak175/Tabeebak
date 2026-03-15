const normalizeKeyPart = (value: unknown) => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : "";
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return "";
};

export const buildStableKey = (parts: unknown[], fallback: string) => {
  const normalized = parts.map(normalizeKeyPart).filter(Boolean);
  return normalized.length ? normalized.join("::") : fallback;
};
