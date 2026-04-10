import { format, isValid, parseISO } from "date-fns";
import { Calendar, Clock, MapPin, MessageSquare, XCircle } from "lucide-react";
import { ReactNode, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { DoctorAvailability } from "@/types/doctor-profile.types";
import { buildStableKey } from "@/lib/reactKeys";
import { formatDateTime as formatDateTimeParts } from "@/lib/date-time";
import {
  DoctorRequestSummary,
  LabRequestSummary,
  RequestMessage,
  RequestStatus,
} from "@/types/patient-booking.types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

export const formatDateTime = (value?: string | null) => {
  if (!value) return "Not available";

  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;

  return format(parsed, "PPP p");
};

export const formatDateOnly = (value?: string | null) => {
  if (!value) return "Not available";
  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;
  return format(parsed, "PPP");
};

export const requestStatusClassName = (status?: RequestStatus) => {
  switch (status) {
    case "approved":
    case "completed":
      return "bg-green-100 text-green-700 border-green-200";
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "rejected":
    case "cancelled":
    case "canceled":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export const SectionCard = ({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) => (
  <Card>
    <CardHeader className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <CardTitle>{title}</CardTitle>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions}
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

export const LoadingCard = ({ lines = 3 }: { lines?: number }) => (
  <Card>
    <CardContent className="space-y-3 p-6">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-full" />
      ))}
    </CardContent>
  </Card>
);

export const ErrorCard = ({ title, message }: { title: string; message: string }) => (
  <Alert variant="destructive">
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

export const EmptyCard = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
      <div className="rounded-full bg-muted p-3">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </CardContent>
  </Card>
);

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="rounded-lg border p-4">
    <p className="text-sm font-medium">{label}</p>
    <p className="mt-1 text-sm text-muted-foreground">{value || "Not available"}</p>
  </div>
);

type RequestCardProps = {
  request: DoctorRequestSummary | LabRequestSummary;
  href: string;
};

export const RequestSummaryCard = ({ request, href }: RequestCardProps) => {
  const preferredDateTime = request.preferredDateTime ?? undefined;
  const derivedTime = preferredDateTime ? formatDateTimeParts(preferredDateTime).time : "-";
  const timeLabel =
    request.preferredTime || (derivedTime !== "-" ? derivedTime : null) || "Time pending";

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-start">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{request.providerName}</h3>
            <Badge className={requestStatusClassName(request.status)}>
              {request.statusLabel || request.status}
            </Badge>
          </div>
          {request.providerSubtitle ? (
            <p className="text-sm text-muted-foreground">{request.providerSubtitle}</p>
          ) : null}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDateOnly(request.preferredDateTime ?? request.preferredDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {timeLabel}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {request.providerLocation || "Location pending"}
            </span>
          </div>
          <p className="text-sm">
            <span className="font-medium">Latest message:</span>{" "}
            <span className="text-muted-foreground">{request.latestMessage || "No messages yet"}</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to={href}>View request</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const MessageThread = ({
  messages,
  currentUserRole,
  isLoading = false,
  emptyMessage = "No messages yet in this thread.",
}: {
  messages: RequestMessage[];
  currentUserRole: string;
  isLoading?: boolean;
  emptyMessage?: string;
}) => {
  const normalizeRole = (role?: string | null) => role?.trim().toLowerCase() ?? "";
  const getRoleLabel = (role?: string | null) => {
    const normalizedRole = normalizeRole(role);

    if (normalizedRole === "lab" || normalizedRole === "laboratory") return "Lab";
    if (normalizedRole === "doctor") return "Doctor";
    if (normalizedRole === "patient") return "Patient";

    return role?.trim() || "Unknown";
  };

  const getRoleAccentClassName = (role?: string | null, isCurrentUser?: boolean) => {
    if (isCurrentUser) {
      return "bg-primary/15 text-primary-foreground/80";
    }

    switch (normalizeRole(role)) {
      case "lab":
      case "laboratory":
        return "bg-amber-100 text-amber-800";
      case "doctor":
        return "bg-emerald-100 text-emerald-800";
      case "patient":
        return "bg-sky-100 text-sky-800";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const groups = useMemo(() => {
    if (!messages.length) return [];

    const grouped: Array<{
      senderRole?: string | null;
      senderName?: string | null;
      isCurrentUser: boolean;
      displayRole: string;
      displayName: string;
      messages: RequestMessage[];
    }> = [];

    messages.forEach((message) => {
      const normalizedRole = normalizeRole(message.senderRole);
      const displayRole = getRoleLabel(message.senderRole);
      const displayName = message.senderName || displayRole;
      const isCurrentUser = normalizedRole === normalizeRole(currentUserRole);
      const lastGroup = grouped[grouped.length - 1];
      const sameSender =
        lastGroup &&
        normalizeRole(lastGroup.senderRole) === normalizedRole &&
        (lastGroup.senderName || "") === (message.senderName || "");

      if (sameSender) {
        lastGroup.messages.push(message);
      } else {
        grouped.push({
          senderRole: message.senderRole,
          senderName: message.senderName,
          isCurrentUser,
          displayRole,
          displayName,
          messages: [message],
        });
      }
    });

    return grouped;
  }, [messages, currentUserRole]);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isFirstScroll = useRef(true);

  useEffect(() => {
    if (!bottomRef.current) return;
    const behavior = isFirstScroll.current ? "auto" : "smooth";
    bottomRef.current.scrollIntoView({ behavior, block: "end" });
    isFirstScroll.current = false;
  }, [messages.length]);

  return (
    <div className="rounded-lg border border-border/60 bg-background">
      <div className="flex items-center justify-end border-b border-border/60 px-4 py-2">
        {isLoading ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Updating</span>
          </div>
        ) : (
          <div className="h-3" aria-hidden />
        )}
      </div>
      <ScrollArea className="h-[320px]">
        {!groups.length ? (
          <div className="flex h-[320px] flex-col items-center justify-center gap-2 px-6 text-center text-sm text-muted-foreground">
            <div className="rounded-full bg-muted p-3">
              <MessageSquare className="h-5 w-5" />
            </div>
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-5 p-4">
            {groups.map((group, groupIndex) => (
              <div
                key={buildStableKey(
                  [
                    group.senderRole,
                    group.senderName,
                    group.messages[0]?.id,
                    group.messages[group.messages.length - 1]?.id,
                    groupIndex,
                  ],
                  `message-group-${groupIndex}`,
                )}
                className={`flex ${group.isCurrentUser ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[85%] space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/80">{group.displayName}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        getRoleAccentClassName(group.senderRole, group.isCurrentUser)
                      }`}
                    >
                      {group.displayRole}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.messages.map((message, messageIndex) => (
                      <div
                        key={buildStableKey(
                          [message.id, message.createdAt, message.message, messageIndex],
                          `message-${groupIndex}-${messageIndex}`,
                        )}
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          group.isCurrentUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.message}</p>
                        <p className="mt-2 text-[11px] opacity-75">{formatDateTime(message.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export const ReplyComposer = ({
  value,
  onChange,
  onSubmit,
  isSending,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSending: boolean;
  disabled?: boolean;
}) => (
  <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
    <Textarea
      placeholder="Reply in this request thread"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled || isSending}
      rows={4}
    />
    <div className="flex justify-end">
      <Button onClick={onSubmit} disabled={disabled || isSending || !value.trim()}>
        {isSending ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Send message
          </span>
        ) : (
          "Send message"
        )}
      </Button>
    </div>
  </div>
);

export const CancelRequestButton = ({
  onCancel,
  isPending,
  disabled,
}: {
  onCancel: () => void;
  isPending: boolean;
  disabled?: boolean;
}) => (
  <Button variant="outline" onClick={onCancel} disabled={disabled || isPending} className="gap-2">
    <XCircle className="h-4 w-4" />
    {isPending ? "Cancelling..." : "Cancel request"}
  </Button>
);

export const AvailabilityPanel = ({ availability }: { availability?: DoctorAvailability | null }) => {
  if (!availability?.weeklySchedule?.length) {
    return <p className="text-sm text-muted-foreground">Availability not published yet.</p>;
  }

  const publishedAvailableDays = availability.weeklySchedule.filter((day) => day.isAvailable);

  if (!publishedAvailableDays.length) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Availability exists for this provider, but no open days or times are currently published.
        </p>
        {availability.notes ? (
          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            {availability.notes}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {publishedAvailableDays.map((day, index) => (
        <div
          key={buildStableKey(
            [day.dayOfWeek, day.startTime, day.endTime, day.breakStartTime, day.breakEndTime, index],
            `availability-${index}`,
          )}
          className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="font-medium">{day.dayOfWeek}</p>
            <p className="text-sm text-muted-foreground">
              {day.startTime || day.endTime
                ? `${day.startTime || "--"} - ${day.endTime || "--"}`
                : "Open times not published yet"}
            </p>
          </div>
          {day.breakStartTime || day.breakEndTime ? (
            <p className="text-sm text-muted-foreground">
              Break: {day.breakStartTime || "--"} - {day.breakEndTime || "--"}
            </p>
          ) : null}
        </div>
      ))}
      {availability.notes ? (
        <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
          {availability.notes}
        </div>
      ) : null}
    </div>
  );
};

export const RequestDetailsGrid = ({
  providerName,
  providerSubtitle,
  providerLocation,
  requestNumber,
  status,
  statusLabel,
  preferredTime,
  preferredDateTime,
  createdAt,
  note,
  extra,
}: {
  providerName: string;
  providerSubtitle?: string | null;
  providerLocation?: string | null;
  requestNumber?: string | null;
  status: RequestStatus;
  statusLabel?: string;
  preferredTime?: string | null;
  preferredDateTime?: string | null;
  createdAt?: string | null;
  note?: string | null;
  extra?: ReactNode;
}) => {
  const primaryDateTime = preferredDateTime ?? preferredTime ?? undefined;
  const { date, time } = formatDateTimeParts(primaryDateTime);
  const timeLabel = preferredTime || (time !== "-" ? time : "-");

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <SectionCard title={providerName} description={providerSubtitle || undefined}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={requestStatusClassName(status)}>{statusLabel || status}</Badge>
            {providerLocation ? (
              <span className="text-sm text-muted-foreground">{providerLocation}</span>
            ) : null}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <DetailItem label="Preferred date" value={date} />
            <DetailItem label="Preferred time" value={timeLabel} />
            <DetailItem label="Created" value={formatDateTime(createdAt)} />
            <DetailItem label="Reference" value={requestNumber} />
          </div>
          <DetailItem label="Patient note" value={note} />
          {extra}
        </div>
      </SectionCard>
    </div>
  );
};
