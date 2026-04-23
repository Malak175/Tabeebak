import ProgressTimeline, { ProgressTimelineStep } from "@/components/shared/ProgressTimeline";
import { normalizeApiStatusKey } from "@/lib/apiStatus";

type TerminalState = {
  label: string;
  message: string;
};

const APPOINTMENT_TIMELINE_STEPS: ProgressTimelineStep[] = [
  { key: "REQUEST_SUBMITTED", label: "Request Submitted" },
  { key: "APPROVED", label: "Approved" },
  { key: "SCHEDULED", label: "Scheduled" },
  { key: "COMPLETED", label: "Completed" },
];

const resolveTimelineProgress = (statusKey: string) => {
  switch (statusKey) {
    case "PENDING":
      return { completedIndex: -1, currentIndex: 0 };
    case "APPROVED":
      return { completedIndex: 0, currentIndex: 1 };
    case "SCHEDULED":
    case "CONFIRMED":
    case "BOOKED":
    case "UPCOMING":
    case "IN_PROGRESS":
      return { completedIndex: 1, currentIndex: 2 };
    case "COMPLETED":
    case "FINISHED":
    case "DONE":
      return { completedIndex: 3, currentIndex: null };
    case "CANCELLED":
    case "CANCELED":
      return { completedIndex: 2, currentIndex: null };
    case "REJECTED":
      return { completedIndex: 0, currentIndex: null };
    default:
      return { completedIndex: -1, currentIndex: 0 };
  }
};

const getTerminalState = (statusKey: string): TerminalState | null => {
  if (statusKey === "REJECTED") {
    return {
      label: "Rejected",
      message: "This appointment request was rejected.",
    };
  }
  if (statusKey === "CANCELLED" || statusKey === "CANCELED") {
    return {
      label: "Cancelled",
      message: "This appointment was cancelled.",
    };
  }
  return null;
};

const AppointmentTimeline = ({
  status,
}: {
  status?: string | null;
}) => {
  const statusKey = normalizeApiStatusKey(status);
  const progress = resolveTimelineProgress(statusKey);
  const terminalState = getTerminalState(statusKey);

  return (
    <ProgressTimeline
      title="Appointment Progress"
      steps={APPOINTMENT_TIMELINE_STEPS}
      completedIndex={progress.completedIndex}
      currentIndex={progress.currentIndex}
      terminalLabel={terminalState?.label ?? null}
      terminalMessage={terminalState?.message ?? null}
    />
  );
};

export default AppointmentTimeline;
