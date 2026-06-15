import { isApiStatus } from "@/lib/apiStatus";

export const canCancelOrRescheduleAppointment = (status?: string | null) =>
  isApiStatus(status, "SCHEDULED", "CONFIRMED");
