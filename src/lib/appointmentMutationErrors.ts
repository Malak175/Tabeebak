import { ApiError } from "@/types/api.types";

type ApiErrorPayload = {
  message?: string;
  details?: Record<string, string[]> | null;
};

const extractValidationMessage = (payload?: ApiErrorPayload | null) => {
  if (!payload?.details) return null;
  const messages = Object.values(payload.details).flat().filter(Boolean);
  return messages[0] ?? null;
};

export const formatAppointmentActionError = (
  error: unknown,
  options?: { slotTakenMessage?: string },
): string => {
  if (error instanceof ApiError) {
    if (error.statusCode === 404) {
      return error.message || "This appointment no longer exists.";
    }
    if (error.statusCode === 403) {
      return error.message || "You do not have permission to perform this action.";
    }
    if (error.statusCode === 409) {
      if (/taken|no longer available/i.test(error.message)) {
        return options?.slotTakenMessage ?? "Slot is already taken";
      }
      return error.message;
    }
    if (error.statusCode === 400) {
      return error.message;
    }
    return error.message;
  }

  return (error as Error)?.message ?? "Something went wrong. Please try again.";
};

export const isSlotTakenError = (error: unknown) =>
  error instanceof ApiError
  && error.statusCode === 409
  && /taken|no longer available/i.test(error.message);
