import ProgressTimeline, { ProgressTimelineStep } from "@/components/shared/ProgressTimeline";

const ORDER_TIMELINE_STEPS: ProgressTimelineStep[] = [
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

const resolveTimelineProgress = (status?: string | null) => {
  const key = normalizeStatusKey(status);
  const normalizedKey =
    key === "INPROGRESS"
      ? "IN_PROGRESS"
      : key === "RESULT_READY" || key === "RESULT_UPLOADED"
        ? "RESULTS_READY"
        : key;

  switch (normalizedKey) {
    case "PENDING":
      return { completedIndex: 0, currentIndex: 1 };
    case "APPROVED":
      return { completedIndex: 1, currentIndex: 2 };
    case "SAMPLE_COLLECTED":
      return { completedIndex: 2, currentIndex: 3 };
    case "IN_PROGRESS":
      return { completedIndex: 3, currentIndex: 4 };
    case "RESULTS_READY":
      return { completedIndex: 4, currentIndex: 4 };
    default:
      return { completedIndex: 0, currentIndex: 1 };
  }
};

const OrderTimeline = ({ status }: { status?: string | null }) => {
  const progress = resolveTimelineProgress(status);

  return (
    <ProgressTimeline
      title="Order Progress"
      steps={ORDER_TIMELINE_STEPS}
      completedIndex={progress.completedIndex}
      currentIndex={progress.currentIndex}
    />
  );
};

export default OrderTimeline;
