const stripToDigits = (value: string) => value.replace(/\D/g, "");

const E164_REGEX = /^\+[1-9]\d{7,14}$/;

const toEgyptNationalNumber = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const digits = stripToDigits(trimmed);
  const hasPlus = trimmed.startsWith("+");

  if (hasPlus) {
    if (digits.startsWith("20")) {
      const national = digits.slice(2);
      if (national.length === 10 && national.startsWith("1")) {
        return national;
      }
    }
    return null;
  }

  if (digits.startsWith("0") && digits.length === 11 && digits[1] === "1") {
    return digits.slice(1);
  }

  if (digits.length === 10 && digits.startsWith("1")) {
    return digits;
  }

  if (digits.startsWith("20") && digits.length === 12 && digits[2] === "1") {
    return digits.slice(2);
  }

  return null;
};

const formatDisplayFromE164 = (value: string) => {
  if (!value.startsWith("+20")) return value;
  const national = value.slice(3);
  if (national.length === 10 && national.startsWith("1")) {
    return `0${national}`;
  }
  return value;
};

export const normalizeEgyptianPhone = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return { e164: null as string | null, display: "", isValid: true };
  }

  if (trimmed.startsWith("+") && E164_REGEX.test(trimmed)) {
    return {
      e164: trimmed,
      display: formatDisplayFromE164(trimmed),
      isValid: true,
    };
  }

  const national = toEgyptNationalNumber(trimmed);
  if (!national) {
    return { e164: null as string | null, display: trimmed, isValid: false };
  }

  const e164 = `+20${national}`;
  return {
    e164,
    display: `0${national}`,
    isValid: true,
  };
};

export const formatEgyptianPhoneForDisplay = (value: string) => {
  if (!value) return "";
  const normalized = normalizeEgyptianPhone(value);
  if (normalized.isValid && normalized.display) {
    return normalized.display;
  }

  return value;
};

export const getEgyptianPhoneValidationError = (value: string, label = "Phone number") => {
  if (!value.trim()) return null;
  const normalized = normalizeEgyptianPhone(value);
  if (normalized.isValid) return null;
  return `Enter a valid phone number in E.164 format like +15551234567. Egyptian numbers like 01012345678 are also accepted.`;
};

// Note: Phone normalization accepts any valid E.164 number.
// Egyptian local mobile formats are converted to E.164 for convenience.
