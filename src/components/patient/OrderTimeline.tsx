type TimelineStep = {
  key: "REQUEST_SUBMITTED" | "APPROVED" | "SAMPLE_COLLECTED" | "IN_PROGRESS" | "RESULTS_READY";
  label: string;
};

const ORDER_TIMELINE_STEPS: TimelineStep[] = [
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
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="mb-3 text-sm font-medium">Order Progress</p>
      <div className="grid gap-3 md:grid-cols-5">
        {ORDER_TIMELINE_STEPS.map((step, index) => {
          const isCompleted = index <= progress.completedIndex;
          const isCurrent = index === progress.currentIndex && !isCompleted;

          return (
            <div key={step.key} className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isCompleted ? "bg-green-600" : isCurrent ? "bg-primary" : "bg-muted-foreground/40"
                }`}
              />
              <span
                className={`text-xs ${
                  isCompleted
                    ? "font-medium text-green-700"
                    : isCurrent
                      ? "font-medium text-primary"
                      : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
