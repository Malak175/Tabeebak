import { formatApiStatusLabel, normalizeApiStatusKey } from "@/lib/apiStatus";
import { formatLabStatusLabel, getLabStatusBadgeClassName, normalizeLabOrderStatus } from "@/lib/labStatus";

type LabWorkflowStatusInput = {
  orderStatus?: string | null;
  status?: string | null;
};

const resolveFallbackWorkflowStatusFromDocumentStatus = (status?: string | null) => {
  const normalizedDocumentStatus = normalizeApiStatusKey(status);
  if (!normalizedDocumentStatus) return "";

  // Only fallback when the document status itself already matches workflow keys.
  const workflowFromDocument = normalizeLabOrderStatus(normalizedDocumentStatus);
  return workflowFromDocument || "";
};

export const resolvePatientLabWorkflowStatus = (input: LabWorkflowStatusInput) => {
  const fromOrderStatus = normalizeLabOrderStatus(input.orderStatus);
  if (fromOrderStatus) return fromOrderStatus;

  return resolveFallbackWorkflowStatusFromDocumentStatus(input.status);
};

export const getPatientLabWorkflowBadgeClassName = (input: LabWorkflowStatusInput) =>
  getLabStatusBadgeClassName(resolvePatientLabWorkflowStatus(input));

export const getPatientLabWorkflowLabel = (input: LabWorkflowStatusInput) =>
  formatLabStatusLabel(resolvePatientLabWorkflowStatus(input));

export const getPatientLabDocumentStatusLabel = (status?: string | null) => formatApiStatusLabel(status);

type FollowUpStatusInput = {
  appointmentStatus?: string | null;
  requestStatus?: string | null;
  hasFollowUpAppointment: boolean;
  hasRequest: boolean;
};

export const resolvePatientFollowUpStatusLabel = (input: FollowUpStatusInput) => {
  const statusCandidate = input.appointmentStatus ?? input.requestStatus ?? null;
  const normalized = normalizeApiStatusKey(statusCandidate);

  if (normalized && normalized !== "UNKNOWN") {
    return formatApiStatusLabel(normalized);
  }

  if (input.hasFollowUpAppointment) return "Scheduled";
  if (input.hasRequest) return "Pending";
  return "In progress";
};
