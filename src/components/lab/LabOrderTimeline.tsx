import ProgressTimeline, { ProgressTimelineStep } from "@/components/shared/ProgressTimeline";

const LAB_ORDER_STEPS: ProgressTimelineStep[] = [
  { key: "REQUEST_SUBMITTED", label: "Request Submitted" },
  { key: "APPROVED", label: "Approved" },
  { key: "SAMPLE_COLLECTED", label: "Sample Collected" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "RESULTS_READY", label: "Results Ready" },
];

const normalizeStatusKey = (status?: string | null) =>
  (status ?? "")
    .trim()
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toUpperCase();

const resolveProgress = (status?: string | null) => {
  const key = normalizeStatusKey(status);
  switch (key) {
    case "PENDING":
      return { completedIndex: 0, currentIndex: 1 };
    case "SAMPLE_COLLECTION_REQUESTED":
      return { completedIndex: 1, currentIndex: 2 };
    case "SAMPLE_COLLECTED":
      return { completedIndex: 2, currentIndex: 3 };
    case "IN_PROGRESS":
    case "APPROVED":
      return { completedIndex: 3, currentIndex: 4 };
    case "RESULT_UPLOADED":
    case "RESULT_READY":
    case "COMPLETED":
      return { completedIndex: 4, currentIndex: 4 };
    case "REJECTED":
      return { completedIndex: 0, currentIndex: 1 };
    case "CANCELLED":
    case "CANCELED":
      return { completedIndex: 1, currentIndex: 2 };
    default:
      return { completedIndex: 0, currentIndex: 1 };
  }
};

const getTerminalState = (status?: string | null) => {
  const key = normalizeStatusKey(status);
  if (key === "REJECTED") {
    return {
      label: "Rejected",
      message: "This order was rejected and closed before processing.",
    };
  }
  if (key === "CANCELLED" || key === "CANCELED") {
    return {
      label: "Cancelled",
      message: "This order was cancelled and is no longer active.",
    };
  }
  return null;
};

const LabOrderTimeline = ({ status }: { status?: string | null }) => {
  const progress = resolveProgress(status);
  const terminal = getTerminalState(status);

  return (
    <ProgressTimeline
      title="Workflow Progress"
      steps={LAB_ORDER_STEPS}
      completedIndex={progress.completedIndex}
      currentIndex={progress.currentIndex}
      terminalLabel={terminal?.label ?? null}
      terminalMessage={terminal?.message ?? null}
    />
  );
};

export default LabOrderTimeline;
