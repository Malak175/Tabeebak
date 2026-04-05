import { useEffect, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { ArrowLeft, CalendarClock, MessageSquareText, Stethoscope, User } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  MessageThread,
  ReplyComposer,
  SectionCard,
} from "@/components/patient/BookingFlowSection";
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

const formatDateTime = (value?: string | null) => {
  if (!value) return "Not available";

  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;

  return format(parsed, "PPP p");
};

const toDateTimeInputValue = (value?: string | null) => {
  if (!value) return "";

  const parsed = parseISO(value);
  if (!isValid(parsed)) return "";

  return format(parsed, "yyyy-MM-dd'T'HH:mm");
};

const getStatusClassName = (status?: string | null) => {
  switch ((status ?? "").toLowerCase()) {
    case "approved":
      return "bg-green-100 text-green-700 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "rejected":
    case "cancelled":
    case "canceled":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const DetailRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="rounded-lg border bg-muted/20 p-4">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-1 font-medium">{value || "Not available"}</p>
  </div>
);

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
  const [scheduledAt, setScheduledAt] = useState("");
  const [reply, setReply] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.data) return;

    setMessage(query.data.providerMessage ?? "");
    setScheduledAt(toDateTimeInputValue(query.data.scheduledAt || query.data.preferredTime));
  }, [query.data]);

  const submitAction = (status: "approved" | "rejected") => {
    if (!requestId) return;

    mutation.mutate(
      {
        requestId,
        payload: {
          status,
          message: message || null,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: doctorWorkflowQueryKeys.appointments() });
          queryClient.invalidateQueries({ queryKey: doctorWorkflowQueryKeys.todayAppointments() });
          toast.success(`Request ${status} successfully.`);
          navigate(status === "approved" ? "/doctor/appointments" : "/doctor/requests");
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
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
          <Card>
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold">{query.data.patientName}</h2>
                  <Badge className={getStatusClassName(query.data.status)}>{query.data.status}</Badge>
                  {query.data.consultationType ? <Badge variant="outline">{query.data.consultationType}</Badge> : null}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>Preferred: {formatDateTime(query.data.preferredTime)}</span>
                  <span>Scheduled: {formatDateTime(query.data.scheduledAt)}</span>
                  <span>Requested: {formatDateTime(query.data.createdAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Request Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <DetailRow label="Request number" value={query.data.requestNumber} />
                  <DetailRow label="Patient name" value={query.data.patient.fullName} />
                  <DetailRow
                    label="Patient details"
                    value={[
                      query.data.patient.age ? `${query.data.patient.age} years` : null,
                      query.data.patient.gender,
                    ]
                      .filter(Boolean)
                      .join(" - ")}
                  />
                  <DetailRow label="Phone" value={query.data.patient.phone} />
                  <DetailRow label="Email" value={query.data.patient.email} />
                  <DetailRow label="Preferred time" value={formatDateTime(query.data.preferredTime)} />
                  <DetailRow label="Consultation type" value={query.data.consultationType} />
                  <DetailRow label="Latest summary" value={query.data.latestSummary} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Patient Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  <p className="whitespace-pre-wrap">{query.data.reason || "No reason was returned."}</p>
                  <p className="whitespace-pre-wrap">{query.data.notes || "No additional patient note was returned."}</p>
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
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledAt">Scheduled time</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(event) => setScheduledAt(event.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional. Use this when approval should include a confirmed time.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message to patient</Label>
                    <Textarea
                      id="message"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Optional approval or rejection note"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button onClick={() => submitAction("approved")} disabled={mutation.isPending}>
                      {mutation.isPending ? "Saving..." : "Approve request"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => submitAction("rejected")}
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? "Saving..." : "Reject request"}
                    </Button>
                  </div>
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
                  {query.isFetching ? (
                    <p className="text-xs text-muted-foreground">Refreshing thread...</p>
                  ) : null}
                  {sendError ? (
                    <Alert variant="destructive">
                      <AlertTitle>Unable to send message</AlertTitle>
                      <AlertDescription>{sendError}</AlertDescription>
                    </Alert>
                  ) : null}
                  <MessageThread messages={query.data.messages} currentUserRole={user?.role || "DOCTOR"} />
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
