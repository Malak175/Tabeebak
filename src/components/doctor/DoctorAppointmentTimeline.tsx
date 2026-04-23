import ProgressTimeline, { ProgressTimelineStep } from "@/components/shared/ProgressTimeline";

const DOCTOR_APPOINTMENT_STEPS: ProgressTimelineStep[] = [
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

const resolveStatusKey = (appointmentStatus?: string | null, requestStatus?: string | null) =>
  normalizeStatusKey(appointmentStatus) || normalizeStatusKey(requestStatus);

const resolveProgress = (statusKey: string) => {
  switch (statusKey) {
    case "PENDING":
      return { completedIndex: 0, currentIndex: 1 };
    case "APPROVED":
      return { completedIndex: 1, currentIndex: 2 };
    case "SCHEDULED":
    case "CONFIRMED":
    case "BOOKED":
    case "UPCOMING":
      return { completedIndex: 2, currentIndex: 3 };
    case "IN_PROGRESS":
      return { completedIndex: 3, currentIndex: 4 };
    case "COMPLETED":
    case "FINISHED":
    case "DONE":
      return { completedIndex: 4, currentIndex: 4 };
    case "REJECTED":
      return { completedIndex: 0, currentIndex: 1 };
    case "CANCELLED":
    case "CANCELED":
      return { completedIndex: 2, currentIndex: 3 };
    default:
      return { completedIndex: 0, currentIndex: 1 };
  }
};

const getTerminalState = (statusKey: string) => {
  if (statusKey === "REJECTED") {
    return {
      label: "Rejected",
      message: "This appointment flow was rejected before scheduling.",
    };
  }
  if (statusKey === "CANCELLED" || statusKey === "CANCELED") {
    return {
      label: "Cancelled",
      message: "This appointment flow was cancelled and is no longer active.",
    };
  }
  return null;
};

const DoctorAppointmentTimeline = ({
  appointmentStatus,
  requestStatus,
}: {
  appointmentStatus?: string | null;
  requestStatus?: string | null;
}) => {
  const statusKey = resolveStatusKey(appointmentStatus, requestStatus);
  const progress = resolveProgress(statusKey);
  const terminal = getTerminalState(statusKey);

  return (
    <ProgressTimeline
      title="Appointment Progress"
      steps={DOCTOR_APPOINTMENT_STEPS}
      completedIndex={progress.completedIndex}
      currentIndex={progress.currentIndex}
      terminalLabel={terminal?.label ?? null}
      terminalMessage={terminal?.message ?? null}
    />
  );
};

export default DoctorAppointmentTimeline;
