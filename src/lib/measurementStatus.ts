export type MeasurementStatusMode = "range" | "categorical";

type ParsedRange = {
  min: number | null;
  max: number | null;
};

const parseRange = (raw?: string | null): ParsedRange => {
  if (!raw) return { min: null, max: null };
  const value = raw.trim();
  if (!value) return { min: null, max: null };

  const betweenMatch = value.match(/^\s*(-?\d+(?:\.\d+)?)\s*-\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (betweenMatch) {
    const min = Number(betweenMatch[1]);
    const max = Number(betweenMatch[2]);
    if (Number.isFinite(min) && Number.isFinite(max)) {
      return { min, max };
    }
  }

  const maxMatch = value.match(/^\s*(?:<=|<)\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (maxMatch) {
    const max = Number(maxMatch[1]);
    return { min: null, max: Number.isFinite(max) ? max : null };
  }

  const minMatch = value.match(/^\s*(?:>=|>)\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (minMatch) {
    const min = Number(minMatch[1]);
    return { min: Number.isFinite(min) ? min : null, max: null };
  }

  return { min: null, max: null };
};

const parseNumericValue = (raw?: string | null) => {
  if (raw == null) return null;
  const cleaned = String(raw).trim().replace(/,/g, "");
  if (!cleaned) return null;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

type ComputeMeasurementStatusInput = {
  value?: string | null;
  referenceRange?: string | null;
  mode?: MeasurementStatusMode;
};

export const computeMeasurementStatus = ({
  value,
  referenceRange,
  mode = "range",
}: ComputeMeasurementStatusInput) => {
  const numericValue = parseNumericValue(value);
  const { min, max } = parseRange(referenceRange);

  if (numericValue == null || (min == null && max == null)) return null;

  if (mode === "categorical") {
    if (min != null && numericValue < min) return "Invalid";
    if (max != null && numericValue > max) return "Invalid";
    return "Valid";
  }

  if (min != null && numericValue < min) return "Low";
  if (max != null && numericValue > max) return "High";
  return "Normal";
};
