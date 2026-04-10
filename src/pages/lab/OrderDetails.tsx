import { ChangeEvent, useEffect, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { ArrowLeft, CalendarClock, FileUp, FlaskConical, Save, User } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  MessageThread,
  ReplyComposer,
  SectionCard,
} from "@/components/patient/BookingFlowSection";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { labNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useLabOrderDetailsQuery,
  useLabOrderMessageMutation,
  useReviewLabOrderMutation,
  useUpdateLabOrderStatusMutation,
  useUploadLabOrderResultMutation,
} from "@/hooks/useLabWorkflow";
import { useLabProfileQuery } from "@/hooks/useLabProfile";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import { formatLabStatusLabel, isResultReadyStatus } from "@/lib/labStatus";
import { UploadLabResultValue } from "@/types/lab-workflow.types";

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
    case "completed":
    case "reported":
    case "ready":
    case "result_uploaded":
    case "result-uploaded":
      return "bg-green-100 text-green-700 border-green-200";
    case "processing":
    case "sample_collected":
    case "sample-collected":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "pending":
    case "requested":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
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

const createEmptyValue = (): UploadLabResultValue => ({
  name: "",
  value: "",
  unit: "",
  referenceRange: "",
  status: "",
});

const LabOrderDetailsPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const profileQuery = useLabProfileQuery(Boolean(user));
  const detailsQuery = useLabOrderDetailsQuery(orderId, Boolean(user));
  const reviewMutation = useReviewLabOrderMutation();
  const messageMutation = useLabOrderMessageMutation(detailsQuery.data?.requestId ?? "");
  const updateStatusMutation = useUpdateLabOrderStatusMutation();
  const uploadResultMutation = useUploadLabOrderResultMutation();
  const userName = getDisplayName(profileQuery.data ?? user ?? {});

  const [status, setStatus] = useState("processing");
  const [statusNotes, setStatusNotes] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reply, setReply] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [resultStatus, setResultStatus] = useState("completed");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [summary, setSummary] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [resultNotes, setResultNotes] = useState("");
  const [reportedAt, setReportedAt] = useState("");
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [values, setValues] = useState<UploadLabResultValue[]>([createEmptyValue()]);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const detail = detailsQuery.data;
  const patientNote = [detail?.instructions, detail?.diagnosis, detail?.specimenNotes]
    .filter(Boolean)
    .join("\n\n");

  useEffect(() => {
    if (!detail) return;

    setStatus(detail.status);
    setStatusNotes(detail.internalNotes ?? detail.notes ?? "");
    setReviewMessage(detail.notes ?? "");
    setResultStatus(detail.resultStatus ?? "completed");
    setReferenceNumber(detail.resultId ?? detail.orderNumber ?? "");
    setResultNotes(detail.internalNotes ?? "");
    setReportedAt(toDateTimeInputValue(detail.completedAt));
  }, [detail]);

  const handleValueChange = (
    index: number,
    field: keyof UploadLabResultValue,
    value: string,
  ) => {
    setValues((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setResultFile(file);
    event.target.value = "";
  };

  const submitReview = (action: "approve" | "reject") => {
    if (!orderId) return;

    reviewMutation.mutate(
      {
        orderId,
        payload: {
          action,
          message: reviewMessage || null,
          notes: statusNotes || null,
        },
      },
      {
        onSuccess: () =>
          toast.success(action === "approve" ? "Order approved successfully." : "Order rejected successfully."),
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  const submitStatusUpdate = () => {
    if (!orderId) return;

    updateStatusMutation.mutate(
      {
        orderId,
        payload: {
          status,
          notes: statusNotes || null,
        },
      },
      {
        onSuccess: () => toast.success("Order status updated successfully."),
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  const handleSendReply = () => {
    if (!detail?.requestId || !reply.trim()) return;

    setReplyError(null);
    messageMutation.mutate(
      { message: reply.trim() },
      {
        onSuccess: () => {
          toast.success("Message sent.");
          setReply("");
        },
        onError: (error: Error) => {
          setReplyError(error.message);
          toast.error(error.message);
        },
      },
    );
  };

  const submitResultUpload = () => {
    if (!orderId) return;
    setUploadSuccess(false);

    const cleanedValues = values.filter(
      (item) => item.name.trim() || item.value?.trim() || item.referenceRange?.trim(),
    );

    uploadResultMutation.mutate(
      {
        orderId,
        payload: {
          status: resultStatus,
          referenceNumber: referenceNumber || null,
          summary: summary || null,
          conclusion: conclusion || null,
          notes: resultNotes || null,
          reportedAt: reportedAt ? new Date(reportedAt).toISOString() : null,
          resultFile,
          values: cleanedValues,
        },
      },
      {
        onSuccess: () => {
          toast.success("Lab result uploaded successfully.");
          setUploadSuccess(true);
          setSummary("");
          setConclusion("");
          setResultNotes("");
          setResultFile(null);
          setValues([createEmptyValue()]);
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };
  const isUploading = uploadResultMutation.isPending;

  const backLink = location.pathname.startsWith("/lab/requests") ? "/lab/requests" : "/lab/pending";
  const backLabel = location.pathname.startsWith("/lab/requests")
    ? "Back to requests"
    : "Back to lab workflow";

  return (
    <DashboardLayout
      userRole="laboratory"
      userName={userName}
      userSubtitle={profileQuery.data?.accreditation ?? "Laboratory account"}
      navItems={labNavItems}
      userIcon={FlaskConical}
    >
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <Button asChild variant="ghost" className="-ml-4 mb-2">
            <Link to={backLink}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
          <h1 className="text-2xl font-bold md:text-3xl">Lab Request Details</h1>
          <p className="text-muted-foreground">
            Review the full patient request, manage the shared thread, and continue the lab workflow.
          </p>
        </div>
      </div>

      {detailsQuery.isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      ) : detailsQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load lab order details</AlertTitle>
          <AlertDescription>
            {(detailsQuery.error as Error).message}
            <Button variant="outline" size="sm" className="mt-3" onClick={() => void detailsQuery.refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : detail ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold">{detail.patientName}</h2>
                  <Badge className={getStatusClassName(detail.status)}>
                    {formatLabStatusLabel(detail.status)}
                  </Badge>
                  {isResultReadyStatus(detail.status) ? (
                    <Badge variant="secondary">Results Ready for Analysis</Badge>
                  ) : null}
                  {detail.service?.sampleType ? <Badge variant="outline">{detail.service.sampleType}</Badge> : null}
                  {detail.service?.category ? <Badge variant="outline">{detail.service.category}</Badge> : null}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>Requested: {formatDateTime(detail.orderedAt)}</span>
                  <span>Preferred: {formatDateTime(detail.scheduledAt)}</span>
                  <span>Collected: {formatDateTime(detail.collectedAt)}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {detail.testName}
                  {detail.orderingDoctor?.fullName || detail.orderingDoctorName
                    ? ` • Ordered by ${detail.orderingDoctor?.fullName || detail.orderingDoctorName}`
                    : ""}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Request Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <DetailRow label="Request number" value={detail.orderNumber || detail.requestId || detail.id} />
                    <DetailRow label="Requested test" value={detail.testName} />
                    <DetailRow label="Patient name" value={detail.patient.fullName} />
                    <DetailRow
                      label="Patient details"
                      value={[
                        detail.patient.age ? `${detail.patient.age} years` : null,
                        detail.patient.gender,
                      ]
                        .filter(Boolean)
                        .join(" - ")}
                    />
                    <DetailRow label="Phone" value={detail.patient.phone} />
                    <DetailRow label="Preferred time" value={formatDateTime(detail.scheduledAt)} />
                    <DetailRow label="Ordering doctor" value={detail.orderingDoctor?.fullName || detail.orderingDoctorName} />
                    <DetailRow label="Doctor specialty" value={detail.orderingDoctor?.specialty} />
                    <DetailRow label="Service category" value={detail.service?.category} />
                    <DetailRow label="Selected service" value={detail.service?.name || detail.testName} />
                    <DetailRow label="Sample type" value={detail.specimenType || detail.service?.sampleType} />
                    <DetailRow
                      label="Sample collection"
                      value={
                        detail.sampleCollectionStatus || detail.sampleCollectionRequested
                          ? formatLabStatusLabel(
                              detail.sampleCollectionStatus ||
                                (detail.sampleCollectionRequested ? "Requested" : ""),
                            )
                          : null
                      }
                    />
                    <DetailRow label="Collection address" value={detail.sampleCollectionAddress} />
                    <DetailRow label="Turnaround time" value={detail.service?.turnaroundTime} />
                  </div>

                  <div className="rounded-lg border bg-muted/10 p-4">
                    <p className="text-sm text-muted-foreground">Patient note</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm">
                      {patientNote || "No patient-facing lab request notes were returned."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="h-5 w-5" />
                    Step 1: Review Request
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reviewMessage">Message to patient</Label>
                    <Textarea
                      id="reviewMessage"
                      value={reviewMessage}
                      onChange={(event) => setReviewMessage(event.target.value)}
                      placeholder="Optional approval or rejection note"
                    />
                    <p className="text-xs text-muted-foreground">
                      This message is sent with the review decision. The shared thread stays separate below.
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button onClick={() => submitReview("approve")} disabled={reviewMutation.isPending}>
                      {reviewMutation.isPending ? "Saving..." : "Approve request"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => submitReview("reject")}
                      disabled={reviewMutation.isPending}
                    >
                      {reviewMutation.isPending ? "Saving..." : "Reject request"}
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
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/lab/completed">View results history</Link>
                  </Button>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/lab/requests">Back to request inbox</Link>
                  </Button>
                </CardContent>
              </Card>

              <SectionCard
                title="Request Thread"
                description="Shared conversation with the patient for this lab request."
              >
                <div className="space-y-4">
                  {replyError ? (
                    <Alert variant="destructive">
                      <AlertTitle>Unable to send message</AlertTitle>
                      <AlertDescription>{replyError}</AlertDescription>
                    </Alert>
                  ) : null}
                  <MessageThread
                    messages={detail.messages}
                    currentUserRole={user?.role || "LAB"}
                    isLoading={detailsQuery.isFetching}
                  />
                  <ReplyComposer
                    value={reply}
                    onChange={(value) => {
                      setReply(value);
                      if (replyError) {
                        setReplyError(null);
                      }
                    }}
                    onSubmit={handleSendReply}
                    isSending={messageMutation.isPending}
                    disabled={!detail.requestId || !detail.canReply}
                  />
                  {!detail.requestId ? (
                    <p className="text-sm text-muted-foreground">
                      Messaging is unavailable because the request ID is missing from the lab detail response.
                    </p>
                  ) : null}
                  {detail.requestId && !detail.canReply ? (
                    <p className="text-sm text-muted-foreground">
                      Replies are unavailable for this request in its current state.
                    </p>
                  ) : null}
                </div>
              </SectionCard>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Order status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sample_collected">Sample Collected</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="statusNotes">Internal workflow note</Label>
                  <Textarea
                    id="statusNotes"
                    value={statusNotes}
                    onChange={(event) => setStatusNotes(event.target.value)}
                    placeholder="Optional internal note for the request workflow"
                  />
                  <p className="text-xs text-muted-foreground">
                    Kept separate from the patient-facing review message and the shared request thread.
                  </p>
                </div>

                <Button onClick={submitStatusUpdate} disabled={updateStatusMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {updateStatusMutation.isPending ? "Saving..." : "Update status"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 3: Upload Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="resultStatus">Result status</Label>
                    <Select value={resultStatus} onValueChange={setResultStatus} disabled={isUploading}>
                      <SelectTrigger id="resultStatus">
                        <SelectValue placeholder="Result status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="reported">Reported</SelectItem>
                        <SelectItem value="final">Final</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="referenceNumber">Result reference</Label>
                    <Input
                      id="referenceNumber"
                      value={referenceNumber}
                      onChange={(event) => setReferenceNumber(event.target.value)}
                      placeholder="Optional result number"
                      disabled={isUploading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportedAt">Reported at</Label>
                  <Input
                    id="reportedAt"
                    type="datetime-local"
                    value={reportedAt}
                    onChange={(event) => setReportedAt(event.target.value)}
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    value={summary}
                    onChange={(event) => setSummary(event.target.value)}
                    placeholder="Clinical summary or interpretation"
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conclusion">Conclusion</Label>
                  <Textarea
                    id="conclusion"
                    value={conclusion}
                    onChange={(event) => setConclusion(event.target.value)}
                    placeholder="Final conclusion"
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Measured values</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setValues((current) => [...current, createEmptyValue()])}
                      disabled={isUploading}
                    >
                      Add row
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {values.map((item, index) => (
                      <div key={index} className="grid gap-3 rounded-lg border p-3">
                        <Input
                          value={item.name}
                          onChange={(event) => handleValueChange(index, "name", event.target.value)}
                          placeholder="Measurement name"
                          disabled={isUploading}
                        />
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input
                            value={item.value ?? ""}
                            onChange={(event) => handleValueChange(index, "value", event.target.value)}
                            placeholder="Value"
                            disabled={isUploading}
                          />
                          <Input
                            value={item.unit ?? ""}
                            onChange={(event) => handleValueChange(index, "unit", event.target.value)}
                            placeholder="Unit"
                            disabled={isUploading}
                          />
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <Input
                            value={item.referenceRange ?? ""}
                            onChange={(event) => handleValueChange(index, "referenceRange", event.target.value)}
                            placeholder="Reference range"
                            disabled={isUploading}
                          />
                          <Input
                            value={item.status ?? ""}
                            onChange={(event) => handleValueChange(index, "status", event.target.value)}
                            placeholder="Status or flag"
                            disabled={isUploading}
                          />
                        </div>
                        {values.length > 1 ? (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setValues((current) => current.filter((_, itemIndex) => itemIndex !== index))
                            }
                            disabled={isUploading}
                          >
                            Remove row
                          </Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resultNotes">Lab notes</Label>
                  <Textarea
                    id="resultNotes"
                    value={resultNotes}
                    onChange={(event) => setResultNotes(event.target.value)}
                    placeholder="Optional result note"
                    disabled={isUploading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resultFile">Result file</Label>
                  <Input id="resultFile" type="file" onChange={handleFileChange} disabled={isUploading} />
                  {resultFile ? <p className="text-sm text-muted-foreground">{resultFile.name}</p> : null}
                </div>

                <Button onClick={submitResultUpload} disabled={isUploading}>
                  <FileUp className="mr-2 h-4 w-4" />
                  {isUploading ? "Uploading..." : "Upload result"}
                </Button>
                {isUploading ? (
                  <p className="text-sm text-muted-foreground">Uploading result and measurements...</p>
                ) : null}
                {uploadSuccess ? (
                  <Alert>
                    <AlertTitle>Result uploaded</AlertTitle>
                    <AlertDescription>
                      The result is now available in history and ready for downstream analysis.
                    </AlertDescription>
                  </Alert>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No order details were returned for this record.
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default LabOrderDetailsPage;
