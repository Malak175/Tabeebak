import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  MessageSquareText,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { MessageThread, ReplyComposer, SectionCard } from "@/components/patient/BookingFlowSection";
import DoctorRequestTimeline from "@/components/doctor/DoctorRequestTimeline";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { doctorNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  doctorWorkflowQueryKeys,
  useDoctorAppointmentRequestDetailsQuery,
  useDoctorAppointmentRequestMessageMutation,
  useUpdateDoctorAppointmentRequestStatusMutation,
} from "@/hooks/useDoctorWorkflow";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import { formatDisplayDateTime } from "@/lib/date-time";
import { formatApiStatusLabel, normalizeApiStatusKey } from "@/lib/apiStatus";

const formatDateTime = (value?: string | null) => formatDisplayDateTime(value);

const getStatusClassName = (status?: string | null) => {
  switch (normalizeApiStatusKey(status)) {
    case "APPROVED":
      return "bg-green-100 text-green-700 border-green-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "REJECTED":
    case "CANCELLED":
    case "CANCELED":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const InfoRow = ({
  label,
  value,
  fallback = "Not provided",
  hideWhenEmpty = true,
}: {
  label: string;
  value?: string | null;
  fallback?: string;
  hideWhenEmpty?: boolean;
}) => {
  if (!value && hideWhenEmpty) return null;

  return (
    <div className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value || fallback}</p>
    </div>
  );
};

const SummaryStat = ({
  label,
  value,
  fallback,
}: {
  label: string;
  value?: string | null;
  fallback: string;
}) => (
  <div className="min-w-[170px] rounded-lg border border-border/60 bg-muted/20 px-3 py-2">
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="text-sm font-semibold text-foreground">{value || fallback}</p>
  </div>
);

const resolveRequestReference = (requestNumber?: string | null, requestId?: string | null) => {
  if (requestNumber?.trim()) return requestNumber.trim();
  if (!requestId?.trim()) return null;

  const normalized = requestId.trim();
  if (/^\d+$/.test(normalized)) return `#${normalized}`;

  const compact = normalized.replace(/[^a-zA-Z0-9]/g, "");
  if (!compact) return null;

  const suffix = compact.length > 4 ? compact.slice(-4) : compact;
  return `REQ-${suffix.toUpperCase()}`;
};

const toDateTimeLocalValue = (value?: string | null) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const toIsoDateTime = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const DoctorRequestDetailsPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const query = useDoctorAppointmentRequestDetailsQuery(requestId, Boolean(user));
  const mutation = useUpdateDoctorAppointmentRequestStatusMutation();
  const replyMutation = useDoctorAppointmentRequestMessageMutation(requestId ?? "");
  const userName = getDisplayName(user ?? {});

  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [rescheduleAt, setRescheduleAt] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);
  const requestReference = query.data
    ? resolveRequestReference(query.data.requestNumber, requestId)
    : null;
  const requestStatus = normalizeApiStatusKey(query.data?.status);
  const isPendingRequest = requestStatus === "PENDING";
  const isApprovedRequest = requestStatus === "APPROVED";

  useEffect(() => {
    if (!query.data) return;

    setMessage(query.data.providerMessage ?? "");
    setRescheduleAt(toDateTimeLocalValue(query.data.scheduledAt || query.data.preferredTime || null));
  }, [query.data]);

  const submitAction = ({
    status,
    scheduledAt,
    successMessage,
    redirectPath,
  }: {
    status: "APPROVED" | "REJECTED" | "CANCELLED";
    scheduledAt?: string | null;
    successMessage: string;
    redirectPath?: string;
  }) => {
    if (!requestId) return;

    mutation.mutate(
      {
        requestId,
        payload: {
          status,
          message: message || null,
          ...(scheduledAt ? { scheduledAt } : {}),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: doctorWorkflowQueryKeys.appointments() });
          queryClient.invalidateQueries({ queryKey: doctorWorkflowQueryKeys.todayAppointments() });
          toast.success(successMessage);
          if (redirectPath) {
            navigate(redirectPath);
          }
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  const handlePendingApprove = () => {
    const fallbackScheduledAt = toIsoDateTime(
      toDateTimeLocalValue(query.data?.scheduledAt || query.data?.preferredTime || null),
    );
    submitAction({
      status: "APPROVED",
      scheduledAt: fallbackScheduledAt,
      successMessage: "Request approved successfully.",
      redirectPath: "/doctor/appointments",
    });
  };

  const handlePendingReject = () => {
    submitAction({
      status: "REJECTED",
      successMessage: "Request rejected successfully.",
      redirectPath: "/doctor/requests",
    });
  };

  const handleApprovedReschedule = () => {
    const nextScheduledAt = toIsoDateTime(rescheduleAt);
    if (!nextScheduledAt) {
      toast.error("Select a valid schedule before submitting.");
      return;
    }

    submitAction({
      status: "APPROVED",
      scheduledAt: nextScheduledAt,
      successMessage: "Request schedule updated.",
    });
  };

  const handleApprovedRollback = (status: "REJECTED" | "CANCELLED") => {
    submitAction({
      status,
      successMessage: `Request marked as ${formatApiStatusLabel(status).toLowerCase()}.`,
      redirectPath: "/doctor/requests",
    });
  };

  const handleSendReply = () => {
    if (!requestId || !reply.trim()) return;

    setSendError(null);
    replyMutation.mutate(
      { message: reply.trim() },
      {
        onSuccess: () => {
          toast.success("Message sent.");
          setReply("");
        },
        onError: (error: Error) => {
          setSendError(error.message);
          toast.error(error.message);
        },
      },
    );
  };

  return (
    <DashboardLayout
      userRole="doctor"
      userName={userName}
      userSubtitle="Doctor account"
      navItems={doctorNavItems}
      userIcon={Stethoscope}
    >
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Button asChild variant="ghost" className="-ml-4 mb-2">
            <Link to="/doctor/requests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to requests
            </Link>
          </Button>
          <h1 className="text-2xl font-bold md:text-3xl">Appointment Request Details</h1>
          <p className="text-muted-foreground">
            Review the full patient request and decide whether to approve or reject it.
          </p>
        </div>
      </div>

      {query.isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      ) : query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load request details</AlertTitle>
          <AlertDescription>
            {(query.error as Error).message}
            <Button variant="outline" size="sm" className="mt-3" onClick={() => void query.refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : query.data ? (
        <div className="space-y-6">
          <Card className="border-border/60 bg-gradient-to-br from-background via-background to-muted/40">
            <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold">{query.data.patientName}</h2>
                  <Badge className={getStatusClassName(query.data.status)}>
                    {formatApiStatusLabel(query.data.status)}
                  </Badge>
                  {query.data.consultationType ? <Badge variant="outline">{query.data.consultationType}</Badge> : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  Request reference {requestReference || "Unavailable"} - Requested{" "}
                  {formatDateTime(query.data.createdAt) || "Not recorded"}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <SummaryStat
                  label="Preferred time"
                  value={formatDateTime(query.data.preferredTime)}
                  fallback="Time not specified"
                />
              </div>
            </CardContent>
          </Card>

          <DoctorRequestTimeline status={query.data.status} />

          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Request Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-border/70">
                  <InfoRow label="Request number" value={requestReference} />
                  <InfoRow label="Consultation type" value={query.data.consultationType} />
                  <InfoRow
                    label="Preferred time"
                    value={formatDateTime(query.data.preferredTime)}
                    fallback="Time not specified"
                    hideWhenEmpty={false}
                  />
                  <InfoRow label="Scheduled time" value={formatDateTime(query.data.scheduledAt)} />
                  <InfoRow label="Request created" value={formatDateTime(query.data.createdAt)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Patient Info</CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-border/70">
                  <InfoRow label="Patient name" value={query.data.patient.fullName} hideWhenEmpty={false} />
                  <InfoRow
                    label="Age and gender"
                    value={[
                      query.data.patient.age ? `${query.data.patient.age} years` : null,
                      query.data.patient.gender,
                    ]
                      .filter(Boolean)
                      .join(" - ")}
                  />
                  <InfoRow
                    label="Phone"
                    value={query.data.patient.phone}
                    fallback="Not provided"
                    hideWhenEmpty={false}
                  />
                  <InfoRow label="Email" value={query.data.patient.email} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visit Context</CardTitle>
                </CardHeader>
                <CardContent className="divide-y divide-border/70">
                  <InfoRow label="Latest summary" value={query.data.latestSummary} />
                  <InfoRow label="Consultation type" value={query.data.consultationType} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquareText className="h-5 w-5" />
                    Patient Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  {query.data.reason ? (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Reason for visit
                      </p>
                      <p className="whitespace-pre-wrap text-sm text-foreground">{query.data.reason}</p>
                    </div>
                  ) : null}
                  {query.data.notes ? (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Additional notes
                      </p>
                      <p className="whitespace-pre-wrap text-sm text-foreground">{query.data.notes}</p>
                    </div>
                  ) : null}
                  {!query.data.reason && !query.data.notes ? (
                    <p className="text-sm text-muted-foreground">No patient notes were included.</p>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="h-5 w-5" />
                    Review Request
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {isPendingRequest ? (
                    <>
                      <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground">
                        Review the request details and decide whether to approve or reject.
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message to patient</Label>
                        <Textarea
                          id="message"
                          value={message}
                          onChange={(event) => setMessage(event.target.value)}
                          placeholder="Optional note to include with your decision"
                        />
                        <p className="text-xs text-muted-foreground">
                          This note will be sent with your decision.
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button onClick={handlePendingApprove} disabled={mutation.isPending}>
                          {mutation.isPending ? "Saving..." : "Approve request"}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handlePendingReject}
                          disabled={mutation.isPending}
                        >
                          {mutation.isPending ? "Saving..." : "Reject request"}
                        </Button>
                      </div>
                    </>
                  ) : isApprovedRequest ? (
                    <>
                      <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-xs text-green-800">
                        This request is approved. You can reschedule it or submit a rollback action.
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reschedule-at">Scheduled time</Label>
                        <Input
                          id="reschedule-at"
                          type="datetime-local"
                          value={rescheduleAt}
                          onChange={(event) => setRescheduleAt(event.target.value)}
                          disabled={mutation.isPending}
                        />
                        <p className="text-xs text-muted-foreground">
                          Re-approve with a new schedule to sync the linked appointment.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message to patient</Label>
                        <Textarea
                          id="message"
                          value={message}
                          onChange={(event) => setMessage(event.target.value)}
                          placeholder="Optional update note for reschedule or rollback"
                          disabled={mutation.isPending}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={handleApprovedReschedule}
                          disabled={mutation.isPending || !rescheduleAt}
                        >
                          {mutation.isPending ? "Saving..." : "Save reschedule"}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleApprovedRollback("REJECTED")}
                          disabled={mutation.isPending}
                        >
                          {mutation.isPending ? "Saving..." : "Rollback as rejected"}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleApprovedRollback("CANCELLED")}
                          disabled={mutation.isPending}
                        >
                          {mutation.isPending ? "Saving..." : "Rollback as cancelled"}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div
                      className={`flex flex-col gap-3 rounded-lg border p-4 ${
                        isApprovedRequest
                          ? "border-green-200 bg-green-50 text-green-800"
                          : "border-red-200 bg-red-50 text-red-800"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        {isApprovedRequest ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                        {isApprovedRequest
                          ? "Request approved"
                          : `Request ${formatApiStatusLabel(query.data.status).toLowerCase()}`}
                      </div>
                      {message ? (
                        <p className="text-sm text-foreground/80">Message sent: {message}</p>
                      ) : (
                        <p className="text-sm text-foreground/70">No message was sent with this decision.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Follow-up
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {query.data.patientId ? (
                    <Button asChild className="w-full" variant="outline">
                      <Link to={`/doctor/patients/${query.data.patientId}`}>Open patient summary</Link>
                    </Button>
                  ) : null}
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/doctor/appointments">View existing appointments</Link>
                  </Button>
                </CardContent>
              </Card>

              <SectionCard
                title="Request Thread"
                description="Shared conversation with the patient for this appointment request."
              >
                <div className="space-y-4">
                  {sendError ? (
                    <Alert variant="destructive">
                      <AlertTitle>Unable to send message</AlertTitle>
                      <AlertDescription>{sendError}</AlertDescription>
                    </Alert>
                  ) : null}
                  <MessageThread
                    messages={query.data.messages ?? []}
                    currentUserRole={user?.role || "DOCTOR"}
                    isLoading={query.isFetching}
                  />
                  <ReplyComposer
                    value={reply}
                    onChange={(value) => {
                      setReply(value);
                      if (sendError) {
                        setSendError(null);
                      }
                    }}
                    onSubmit={handleSendReply}
                    isSending={replyMutation.isPending}
                    disabled={!requestId || !query.data.canReply}
                  />
                  {!query.data.canReply ? (
                    <p className="text-sm text-muted-foreground">
                      Replies are unavailable for this request in its current state.
                    </p>
                  ) : null}
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Request details were not returned for this record.
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default DoctorRequestDetailsPage;
