import type { ProgressTimelineStep } from "@/components/shared/ProgressTimeline";
import { normalizeLabOrderStatus, normalizeLabStatusKey } from "@/lib/labStatus";

export const LAB_ORDER_PROGRESS_STEPS: ProgressTimelineStep[] = [
  { key: "REQUEST_SUBMITTED", label: "Request submitted" },
  { key: "APPROVED", label: "Approved" },
  { key: "SAMPLE_COLLECTED", label: "Sample collected" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "RESULTS_READY", label: "Results ready" },
];

export type LabOrderTimelineTerminal = {
  label: string;
  message: string;
};

export type LabOrderTimelineState = {
  completedIndex: number;
  currentIndex: number | null;
  terminal: LabOrderTimelineTerminal | null;
};

/**
 * Maps backend order status → timeline indices (completed / current).
 * Uses raw key first for legacy values (e.g. APPROVED) that canonical mapping would fold into IN_PROGRESS.
 */
export const resolveLabOrderTimelineState = (status?: string | null): LabOrderTimelineState => {
  const rawKey = normalizeLabStatusKey(status);
  const canonical = normalizeLabOrderStatus(status);

  if (canonical === "REJECTED" || rawKey === "REJECTED" || rawKey === "CANCELLED" || rawKey === "CANCELED") {
    return {
      completedIndex: -1,
      currentIndex: null,
      terminal: {
        label: "Rejected",
        message: "This order was rejected and will not proceed.",
      },
    };
  }

  // Legacy / explicit "approved" — lab accepted; next operational step is sample collection
  if (rawKey === "APPROVED") {
    return { completedIndex: 1, currentIndex: 2, terminal: null };
  }

  switch (canonical) {
    case "PENDING":
      return { completedIndex: 0, currentIndex: 1, terminal: null };
    case "SAMPLE_COLLECTION_REQUESTED":
      return { completedIndex: 1, currentIndex: 2, terminal: null };
    case "SAMPLE_COLLECTED":
      return { completedIndex: 2, currentIndex: 3, terminal: null };
    case "IN_PROGRESS":
      return { completedIndex: 3, currentIndex: 4, terminal: null };
    case "RESULT_UPLOADED":
    case "COMPLETED":
      return { completedIndex: 4, currentIndex: 4, terminal: null };
    default:
      break;
  }

  // Raw fallbacks not covered by canonical enum
  if (
    rawKey === "RESULT_READY" ||
    rawKey === "RESULT_UPLOADED" ||
    rawKey === "RESULTS_READY"
  ) {
    return { completedIndex: 4, currentIndex: 4, terminal: null };
  }
  if (rawKey === "INPROGRESS" || rawKey === "IN_PROGRESS") {
    return { completedIndex: 3, currentIndex: 4, terminal: null };
  }
  if (rawKey === "SAMPLE_COLLECTED") {
    return { completedIndex: 2, currentIndex: 3, terminal: null };
  }
  if (rawKey === "SAMPLE_COLLECTION_REQUESTED") {
    return { completedIndex: 1, currentIndex: 2, terminal: null };
  }
  if (rawKey === "PENDING") {
    return { completedIndex: 0, currentIndex: 1, terminal: null };
  }

  // Unknown non-empty status — show early pipeline rather than a misleading “all done”
  if (rawKey) {
    return { completedIndex: 0, currentIndex: 1, terminal: null };
  }

  return { completedIndex: 0, currentIndex: 1, terminal: null };
};
