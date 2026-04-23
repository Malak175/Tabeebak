import ProgressTimeline, { ProgressTimelineStep } from "@/components/shared/ProgressTimeline";

const DOCTOR_REQUEST_STEPS: ProgressTimelineStep[] = [
  { key: "REQUEST_SUBMITTED", label: "Request Submitted" },
  { key: "APPROVED", label: "Approved" },
  { key: "APPOINTMENT_SCHEDULED", label: "Appointment Scheduled" },
  { key: "VISIT_IN_PROGRESS", label: "Visit In Progress" },
  { key: "VISIT_COMPLETED", label: "Visit Completed" },
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
    case "APPROVED":
      return { completedIndex: 1, currentIndex: 2 };
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
      message: "This request was rejected and closed before scheduling.",
    };
  }
  if (key === "CANCELLED" || key === "CANCELED") {
    return {
      label: "Cancelled",
      message: "This request was cancelled and is no longer active.",
    };
  }
  return null;
};

const DoctorRequestTimeline = ({ status }: { status?: string | null }) => {
  const progress = resolveProgress(status);
  const terminal = getTerminalState(status);

  return (
    <ProgressTimeline
      title="Request Progress"
      steps={DOCTOR_REQUEST_STEPS}
      completedIndex={progress.completedIndex}
      currentIndex={progress.currentIndex}
      terminalLabel={terminal?.label ?? null}
      terminalMessage={terminal?.message ?? null}
    />
  );
};

export default DoctorRequestTimeline;
