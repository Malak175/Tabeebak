import { normalizeApiStatusKey, formatApiStatusLabel } from "./apiStatus";
import type { LucideIcon } from "lucide-react";
import {
    ArrowRight,
    CheckCircle2,
    CalendarCheck,
    Play,
    Check,
    XCircle,
    Slash,
} from "lucide-react";

export type AppointmentStatusKey =
    | "REQUEST_SUBMITTED"
    | "APPROVED"
    | "SCHEDULED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "REJECTED"
    | "UNKNOWN";

export interface AppointmentStatusOption {
    value: AppointmentStatusKey;
    label: string;
    badgeClassName: string;
    icon: LucideIcon;
}

export const appointmentStatusOptions: AppointmentStatusOption[] = [
    {
        value: "REQUEST_SUBMITTED",
        label: "Request Submitted",
        badgeClassName: "bg-sky-100 text-sky-700 border-sky-200",
        icon: ArrowRight,
    },
    {
        value: "APPROVED",
        label: "Approved",
        badgeClassName: "bg-emerald-100 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
    },
    {
        value: "SCHEDULED",
        label: "Scheduled",
        badgeClassName: "bg-violet-100 text-violet-700 border-violet-200",
        icon: CalendarCheck,
    },
    {
        value: "IN_PROGRESS",
        label: "In Progress",
        badgeClassName: "bg-blue-100 text-blue-700 border-blue-200",
        icon: Play,
    },
    {
        value: "COMPLETED",
        label: "Completed",
        badgeClassName: "bg-emerald-200 text-emerald-900 border-emerald-200",
        icon: Check,
    },
    {
        value: "CANCELLED",
        label: "Cancelled",
        badgeClassName: "bg-red-100 text-red-700 border-red-200",
        icon: XCircle,
    },
    {
        value: "REJECTED",
        label: "Rejected",
        badgeClassName: "bg-rose-100 text-rose-700 border-rose-200",
        icon: Slash,
    },
];

export const APPOINTMENT_WORKFLOW_STATUS_KEYS = [
    "SCHEDULED",
    "IN_PROGRESS",
    "COMPLETED",
] as const;

export type AppointmentWorkflowStatusKey = typeof APPOINTMENT_WORKFLOW_STATUS_KEYS[number];

export const appointmentWorkflowStatusOptions = appointmentStatusOptions.filter((item) =>
    APPOINTMENT_WORKFLOW_STATUS_KEYS.includes(item.value),
);

export const appointmentStatusFilterOptions = [
    { value: "all", label: "All Appointments" },
    ...appointmentWorkflowStatusOptions.map((item) => ({ value: item.value, label: item.label })),
];

export type AppointmentTimelineStep = {
    key: AppointmentStatusKey;
    label: string;
};

export const appointmentTimelineSteps: AppointmentTimelineStep[] = appointmentWorkflowStatusOptions.map(
    (option) => ({ key: option.value, label: option.label }),
);

export const resolveAppointmentTimelineState = (
    status?: string | null,
): { completedIndex: number; currentIndex: number | null } => {
    const statusKey = normalizeAppointmentStatus(status);

    switch (statusKey) {
        case "REQUEST_SUBMITTED":
            return { completedIndex: -1, currentIndex: 0 };
        case "APPROVED":
            return { completedIndex: 0, currentIndex: 1 };
        case "SCHEDULED":
            return { completedIndex: 1, currentIndex: 2 };
        case "IN_PROGRESS":
            return { completedIndex: 2, currentIndex: 3 };
        case "COMPLETED":
            return { completedIndex: 4, currentIndex: null };
        default:
            return { completedIndex: -1, currentIndex: 0 };
    }
};

export const normalizeAppointmentStatus = (status?: string | null): AppointmentStatusKey => {
    const key = normalizeApiStatusKey(status);

    if (!key) {
        return "UNKNOWN";
    }

    switch (key) {
        case "REQUEST_SUBMITTED":
        case "PENDING":
        case "UNDER_REVIEW":
        case "IN_REVIEW":
        case "REQUESTED":
        case "SUBMITTED":
            return "REQUEST_SUBMITTED";
        case "APPROVED":
        case "CONFIRMED":
        case "ACCEPTED":
        case "READY":
            return "APPROVED";
        case "SCHEDULED":
        case "BOOKED":
        case "UPCOMING":
        case "RESCHEDULED":
            return "SCHEDULED";
        case "IN_PROGRESS":
        case "ON_GOING":
        case "ONGOING":
        case "STARTED":
            return "IN_PROGRESS";
        case "COMPLETED":
        case "FINISHED":
        case "DONE":
            return "COMPLETED";
        case "CANCELLED":
        case "CANCELED":
            return "CANCELLED";
        case "REJECTED":
        case "DECLINED":
        case "DENIED":
            return "REJECTED";
        default:
            return key as AppointmentStatusKey;
    }
};

export const getAppointmentStatusLabel = (status?: string | null) => {
    const normalized = normalizeAppointmentStatus(status);
    return (
        appointmentStatusOptions.find((option) => option.value === normalized)?.label ??
        formatApiStatusLabel(status)
    );
};

export const getAppointmentStatusClassName = (status?: string | null) => {
    const normalized = normalizeAppointmentStatus(status);
    return (
        appointmentStatusOptions.find((option) => option.value === normalized)?.badgeClassName ??
        "bg-muted text-muted-foreground border-border"
    );
};

export const getAppointmentStatusOption = (status?: string | null) =>
    appointmentStatusOptions.find((option) => option.value === normalizeAppointmentStatus(status));
