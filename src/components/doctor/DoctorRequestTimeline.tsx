import ProgressTimeline, { ProgressTimelineStep } from "@/components/shared/ProgressTimeline";
import { normalizeApiStatusDisplayKey } from "@/lib/apiStatus";

const DOCTOR_REQUEST_STEPS: ProgressTimelineStep[] = [
  { key: "REQUEST_SUBMITTED", label: "Request Submitted" },
  { key: "APPROVED", label: "Approved" },
];

const resolveProgress = (status?: string | null) => {
  const key = normalizeApiStatusDisplayKey(status);
  switch (key) {
    case "PENDING":
      return { completedIndex: -1, currentIndex: 0 };
    case "APPROVED":
    case "COMPLETED":
      return { completedIndex: 1, currentIndex: null };
    case "REJECTED":
      return { completedIndex: 0, currentIndex: null };
    case "CANCELLED":
      return { completedIndex: 0, currentIndex: null };
    default:
      return { completedIndex: -1, currentIndex: 0 };
  }
};

const getTerminalState = (status?: string | null) => {
  const key = normalizeApiStatusDisplayKey(status);
  if (key === "REJECTED") {
    return {
      label: "Rejected",
      message: "This request was rejected.",
    };
  }
  if (key === "CANCELLED") {
    return {
      label: "Cancelled",
      message: "This request was cancelled.",
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
