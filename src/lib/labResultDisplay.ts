import { formatApiStatusLabel } from "@/lib/apiStatus";
import {
  formatLabStatusLabel,
  getLabStatusBadgeClassName,
  normalizeLabOrderStatus,
} from "@/lib/labStatus";

export type LabResultTitleInput = {
  testName?: string | null;
  primaryServiceName?: string | null;
  serviceNames?: string | null;
  fileName?: string | null;
};

const PLACEHOLDER_TITLES = new Set(["unknown", "lab result", "lab test", "lab results"]);

const stripFileExtension = (fileName: string) =>
  fileName
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .trim();

export const resolveLabResultTitle = (input: LabResultTitleInput): string | null => {
  const candidates = [
    input.testName,
    input.primaryServiceName,
    input.serviceNames?.split(",")[0]?.trim(),
    input.fileName ? stripFileExtension(input.fileName) : null,
  ];

  for (const candidate of candidates) {
    if (!candidate?.trim()) continue;
    const normalized = candidate.trim();
    if (PLACEHOLDER_TITLES.has(normalized.toLowerCase())) continue;
    return normalized;
  }

  return null;
};

export const formatLabResultDocumentStatusLabel = (status?: string | null) => formatApiStatusLabel(status);

type LabWorkflowDisplayInput = {
  orderStatus?: string | null;
  resultStatus?: string | null;
};

export const getDoctorLabWorkflowLabel = (input: LabWorkflowDisplayInput) => {
  const workflowStatus = normalizeLabOrderStatus(input.orderStatus);
  if (workflowStatus) return formatLabStatusLabel(workflowStatus);
  return formatLabResultDocumentStatusLabel(input.resultStatus);
};

export const getDoctorLabWorkflowBadgeClassName = (input: LabWorkflowDisplayInput) => {
  const workflowStatus = normalizeLabOrderStatus(input.orderStatus);
  if (workflowStatus) return getLabStatusBadgeClassName(workflowStatus);
  return "bg-muted text-muted-foreground border-border";
};

export const hasDisplayableLabResult = (input: LabResultTitleInput & { id?: string | null }) =>
  Boolean(input.id && resolveLabResultTitle(input));
