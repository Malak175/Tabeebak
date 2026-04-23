import { Badge } from "@/components/ui/badge";

type AppointmentTimelineStep = {
  key:
    | "REQUEST_SUBMITTED"
    | "APPROVED"
    | "APPOINTMENT_SCHEDULED"
    | "VISIT_IN_PROGRESS"
    | "VISIT_COMPLETED";
  label: string;
};

type TerminalState = {
  label: string;
  message: string;
};

const APPOINTMENT_TIMELINE_STEPS: AppointmentTimelineStep[] = [
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

const resolveTimelineProgress = (statusKey: string) => {
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

const getTerminalState = (statusKey: string): TerminalState | null => {
  if (statusKey === "REJECTED") {
    return {
      label: "Rejected",
      message: "This request was rejected and the journey stopped before scheduling.",
    };
  }
  if (statusKey === "CANCELLED" || statusKey === "CANCELED") {
    return {
      label: "Cancelled",
      message: "This appointment journey was cancelled and is no longer active.",
    };
  }
  return null;
};

const AppointmentTimeline = ({
  appointmentStatus,
  requestStatus,
}: {
  appointmentStatus?: string | null;
  requestStatus?: string | null;
}) => {
  const statusKey = resolveStatusKey(appointmentStatus, requestStatus);
  const progress = resolveTimelineProgress(statusKey);
  const terminalState = getTerminalState(statusKey);

  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium">Appointment Progress</p>
        {terminalState ? (
          <Badge className="bg-red-100 text-red-700 border-red-200">{terminalState.label}</Badge>
        ) : null}
      </div>
      {terminalState ? <p className="mb-3 text-xs text-muted-foreground">{terminalState.message}</p> : null}
      <div className="grid gap-3 md:grid-cols-5">
        {APPOINTMENT_TIMELINE_STEPS.map((step, index) => {
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

export default AppointmentTimeline;
