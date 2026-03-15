import { useState } from "react";
import { ArrowLeft, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  AvailabilityPanel,
  CancelRequestButton,
  EmptyCard,
  ErrorCard,
  LoadingCard,
  MessageThread,
  ReplyComposer,
  RequestDetailsGrid,
  SectionCard,
} from "@/components/patient/BookingFlowSection";
import { patientBookingNavItems } from "@/components/patient/patientNavigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  useAppointmentRequestDetailQuery,
  useAppointmentRequestMessageMutation,
  useCancelAppointmentRequestMutation,
  useCancelTestRequestMutation,
  useTestRequestDetailQuery,
  useTestRequestMessageMutation,
} from "@/hooks/usePatientBooking";
import { getDisplayName } from "@/lib/auth";

const PatientRequestDetailsPage = () => {
  const { requestType, requestId } = useParams();
  const { user } = useAuth();
  const userName = getDisplayName(user ?? {});
  const [reply, setReply] = useState("");
  const [sendError, setSendError] = useState<string | null>(null);

  const isDoctorRequest = requestType === "doctor";
  const doctorQuery = useAppointmentRequestDetailQuery(requestId, isDoctorRequest);
  const labQuery = useTestRequestDetailQuery(requestId, !isDoctorRequest);
  const activeQuery = isDoctorRequest ? doctorQuery : labQuery;
  const cancelDoctorMutation = useCancelAppointmentRequestMutation();
  const cancelLabMutation = useCancelTestRequestMutation();
  const doctorReplyMutation = useAppointmentRequestMessageMutation(requestId ?? "");
  const labReplyMutation = useTestRequestMessageMutation(requestId ?? "");

  const activeRequest = activeQuery.data;
  const sendingMutation = isDoctorRequest ? doctorReplyMutation : labReplyMutation;
  const cancelMutation = isDoctorRequest ? cancelDoctorMutation : cancelLabMutation;

  const handleSendReply = () => {
    if (!requestId || !reply.trim()) return;

    setSendError(null);
    sendingMutation.mutate(
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

  const handleCancel = () => {
    if (!requestId) return;

    cancelMutation.mutate(requestId, {
      onSuccess: () => toast.success("Request cancelled."),
      onError: (error: Error) => toast.error(error.message),
    });
  };

  return (
    <DashboardLayout userRole="patient" userName={userName} navItems={patientBookingNavItems} userIcon={User}>
      <div className="mb-6">
        <Button asChild variant="ghost" className="-ml-4 mb-3">
          <Link to="/patient/requests">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to requests
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Request details</h1>
        <p className="mt-2 text-muted-foreground">
          Status updates and messaging are scoped to this request thread.
        </p>
      </div>

      {activeQuery.isLoading ? (
        <LoadingCard lines={6} />
      ) : activeQuery.isError ? (
        <ErrorCard title="Unable to load request" message={(activeQuery.error as Error).message} />
      ) : activeRequest ? (
        <div className="space-y-6">
          <RequestDetailsGrid
            providerName={activeRequest.providerName}
            providerSubtitle={activeRequest.providerSubtitle}
            providerLocation={activeRequest.providerLocation}
            requestNumber={activeRequest.requestNumber}
            status={activeRequest.status}
            preferredDate={activeRequest.preferredDate}
            preferredTime={activeRequest.preferredTime}
            createdAt={activeRequest.createdAt}
            note={activeRequest.patientNote}
            extra={
              isDoctorRequest ? (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Visit type</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {"visitType" in activeRequest ? activeRequest.visitType || "Not provided" : "Not provided"}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Reason</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {"reason" in activeRequest ? activeRequest.reason || "Not provided" : "Not provided"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Branch</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {"branchName" in activeRequest ? activeRequest.branchName || "Not selected" : "Not selected"}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Services</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {"selectedServices" in activeRequest && activeRequest.selectedServices.length
                        ? activeRequest.selectedServices.join(", ")
                        : "No services listed"}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Home collection</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {"homeCollection" in activeRequest
                        ? activeRequest.homeCollection === true
                          ? "Requested"
                          : activeRequest.homeCollection === false
                            ? "Not requested"
                            : "Not specified"
                        : "Not specified"}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Lab location</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {activeRequest.providerLocation || "Location not provided"}
                    </p>
                  </div>
                </div>
              )
            }
          />

          {isDoctorRequest && "availability" in activeRequest ? (
            <SectionCard title="Doctor availability snapshot" description="Shown when the request detail includes availability">
              <AvailabilityPanel availability={activeRequest.availability} />
            </SectionCard>
          ) : null}

          <SectionCard
            title="Messages"
            description="Per-request thread only"
            actions={
              activeRequest.canCancel ? (
                <CancelRequestButton
                  onCancel={handleCancel}
                  isPending={cancelMutation.isPending}
                />
              ) : undefined
            }
          >
            <div className="space-y-4">
              {activeQuery.isFetching ? (
                <p className="text-xs text-muted-foreground">Refreshing thread...</p>
              ) : null}
              {sendError ? (
                <Alert variant="destructive">
                  <AlertTitle>Unable to send message</AlertTitle>
                  <AlertDescription>{sendError}</AlertDescription>
                </Alert>
              ) : null}
              <MessageThread messages={activeRequest.messages} currentUserRole={user?.role || "Patient"} />
              {activeRequest.canReply ? (
                <ReplyComposer
                  value={reply}
                  onChange={(value) => {
                    setReply(value);
                    if (sendError) {
                      setSendError(null);
                    }
                  }}
                  onSubmit={handleSendReply}
                  isSending={sendingMutation.isPending}
                />
              ) : (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Replies are not available for this request in its current state.
                </div>
              )}
            </div>
          </SectionCard>
        </div>
      ) : (
        <EmptyCard title="Request not found" description="This request is unavailable." />
      )}
    </DashboardLayout>
  );
};

export default PatientRequestDetailsPage;
