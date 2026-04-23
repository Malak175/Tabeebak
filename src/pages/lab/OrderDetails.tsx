import { ChangeEvent, useEffect, useState } from "react";
import { ArrowLeft, CalendarClock, CheckCircle2, FileUp, FlaskConical, XCircle } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  MessageThread,
  ReplyComposer,
  SectionCard,
} from "@/components/patient/BookingFlowSection";
import LabOrderTimeline from "@/components/lab/LabOrderTimeline";
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
import { formatDisplayDateTime } from "@/lib/date-time";
import { HEART_MEASUREMENT_SCHEMA, resolveHeartMeasurementDefaults } from "@/lib/heartMeasurementSchema";
import { computeMeasurementStatus } from "@/lib/measurementStatus";
import {
  canReplyOnLabOrder,
  canReviewLabOrder,
  canUploadLabResult,
  formatLabStatusLabel,
  getLabStatusBadgeClassName,
  getLabWorkflowBucket,
  getNextLabOrderStatuses,
  isResultReadyStatus,
  normalizeLabOrderStatus,
} from "@/lib/labStatus";
import { UploadLabResultValue } from "@/types/lab-workflow.types";

const formatDateTime = (value?: string | null) => formatDisplayDateTime(value);

const toCanonicalStatus = (status?: string | null) => {
  return normalizeLabOrderStatus(status);
};

const getReviewPresentation = (status?: string | null) => {
  const normalized = toCanonicalStatus(status);
  if (normalized === "PENDING") {
    return null;
  }
  if (normalized === "REJECTED") {
    return {
      label: "Rejected",
      tone: "danger",
      description: "The request was declined and is no longer active.",
    };
  }
  if (normalized === "CANCELLED") {
    return {
      label: "Cancelled",
      tone: "danger",
      description: "The request has been cancelled and is no longer active.",
    };
  }
  if (normalized) {
    return {
      label: "Reviewed",
      tone: "success",
      description: "The request has moved past review and is in the active workflow.",
    };
  }
  return null;
};

const resolveReviewedOrderStatus = (
  action: "approve" | "reject",
  sampleCollectionRequired?: boolean,
): "SAMPLE_COLLECTION_REQUESTED" | "IN_PROGRESS" | "REJECTED" => {
  if (action === "reject") return "REJECTED";
  return sampleCollectionRequired !== false ? "SAMPLE_COLLECTION_REQUESTED" : "IN_PROGRESS";
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

const createDefaultValues = (): UploadLabResultValue[] =>
  Object.keys(HEART_MEASUREMENT_SCHEMA).map((key) => {
    const defaults = resolveHeartMeasurementDefaults(key);
    return {
      name: key,
      value: "",
      unit: defaults?.unit ?? "score",
      referenceRange: defaults?.referenceRange ?? "",
      status: "",
    };
  });

type LabOrderDetailLocationState = {
  fromPath?: string;
  fromLabel?: string;
};

const getFallbackBackLink = (status?: string | null) => {
  const bucket = getLabWorkflowBucket(status);
  if (bucket === "inbox") return "/lab/requests";
  if (bucket === "activeWork") return "/lab/pending";
  if (bucket === "resultsReady" || bucket === "archive") return "/lab/completed";
  return "/lab/dashboard";
};

const getWorkflowActionHint = (status?: string | null, sampleCollectionRequired?: boolean) => {
  const canonical = toCanonicalStatus(status);
  if (canonical === "PENDING") {
    return "This order is in Inbox. Approve to start Active Work, or reject if it cannot be processed.";
  }
  if (canonical === "SAMPLE_COLLECTION_REQUESTED") {
    return "Collection is pending. Move to Sample Collected once the specimen is received.";
  }
  if (canonical === "SAMPLE_COLLECTED") {
    return "Collection is complete. Move to In Progress when processing starts.";
  }
  if (canonical === "IN_PROGRESS") {
    return "Processing is active. Upload the result to move this order into Results Ready.";
  }
  if (canonical === "RESULT_UPLOADED") {
    return "Result upload is complete. Move this order to Completed when hand-off is confirmed.";
  }
  if (canonical === "COMPLETED") {
    return "Workflow complete. This order is now in Archive.";
  }
  if (canonical === "CANCELLED" || canonical === "REJECTED") {
    return "Workflow closed. No further workflow actions are available.";
  }
  if (sampleCollectionRequired === false) {
    return "No sample collection is required for this order.";
  }
  return "Review and continue this order through the official workflow.";
};

const LabOrderDetailsPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const profileQuery = useLabProfileQuery(Boolean(user));
  const detailsQuery = useLabOrderDetailsQuery(orderId, Boolean(user));
  const reviewMutation = useReviewLabOrderMutation();
  const messageThreadId = detailsQuery.data?.requestId?.trim() ?? "";
  const messageMutation = useLabOrderMessageMutation(messageThreadId, orderId);
  const updateStatusMutation = useUpdateLabOrderStatusMutation();
  const uploadResultMutation = useUploadLabOrderResultMutation();
  const userName = getDisplayName(profileQuery.data ?? user ?? {});

  const [status, setStatus] = useState("");
  const [statusNotes, setStatusNotes] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reply, setReply] = useState("");
  const [replyError, setReplyError] = useState<string | null>(null);
  const [summary, setSummary] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [resultNotes, setResultNotes] = useState("");
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [values, setValues] = useState<UploadLabResultValue[]>(createDefaultValues);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const detail = detailsQuery.data;
  const reviewPresentation = getReviewPresentation(detail?.status);
  const normalizedStatus = toCanonicalStatus(detail?.status);
  const actionStatus = normalizedStatus || toCanonicalStatus(detail?.resultStatus);
  const branchName = detail?.branch?.name ?? null;
  const requestedServices = detail?.services ?? [];
  const orderingDoctorName = detail?.orderingDoctor?.fullName || detail?.orderingDoctorName || null;
  const sampleCollectionLabel = detail?.sampleCollectionStatus
    ? formatLabStatusLabel(detail.sampleCollectionStatus)
    : null;
  const resultStatusLabel = detail?.resultStatus ? formatLabStatusLabel(detail.resultStatus) : null;
  const canReviewOrder = canReviewLabOrder(actionStatus);
  const canUploadResultNow = canUploadLabResult(actionStatus);
  const statusOptions = getNextLabOrderStatuses(actionStatus);
  const hasAvailableStatusTransition = statusOptions.length > 0 && !canReviewOrder && !canUploadResultNow;
  const canReplyToRequest =
    Boolean(detail?.requestId?.trim()) &&
    Boolean(detail?.canReply) &&
    canReplyOnLabOrder(detail?.status);

  const locationState = (location.state as LabOrderDetailLocationState | null) ?? null;
  const backLink =
    locationState?.fromPath && locationState.fromPath.startsWith("/lab/")
      ? locationState.fromPath
      : getFallbackBackLink(detail?.status);
  const backLabel = locationState?.fromLabel ? `Back to ${locationState.fromLabel}` : "Back to lab workflow";
  const workflowActionHint = getWorkflowActionHint(actionStatus, detail?.sampleCollectionRequired);

  useEffect(() => {
    if (!detail) return;
    setStatus(statusOptions[0] ?? "");
    setStatusNotes(detail.internalNotes ?? detail.notes ?? "");
    setReviewMessage(detail.notes ?? "");
    setResultNotes(detail.internalNotes ?? "");
  }, [detail, statusOptions]);

  const handleValueChange = (
    index: number,
    field: keyof UploadLabResultValue,
    value: string,
  ) => {
    setValues((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? (() => {
              if (field !== "name") {
                return { ...item, [field]: value };
              }
              const defaults = resolveHeartMeasurementDefaults(value);
              return {
                ...item,
                name: value,
                unit: defaults?.unit ?? item.unit,
                referenceRange: defaults?.referenceRange ?? item.referenceRange,
              };
            })()
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

    const nextStatus = resolveReviewedOrderStatus(action, detail?.sampleCollectionRequired);

    reviewMutation.mutate(
      {
        orderId,
        payload: {
          action,
          status: nextStatus,
          message: reviewMessage || null,
          notes: statusNotes || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(action === "approve" ? "Review saved successfully." : "Order rejected successfully.");
          void detailsQuery.refetch();
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  const submitStatusUpdate = () => {
    if (!orderId || !status) return;

    updateStatusMutation.mutate(
      {
        orderId,
        payload: {
          status,
          notes: statusNotes || null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Workflow step updated.");
          void detailsQuery.refetch();
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  const handleSendReply = () => {
    if (!messageThreadId || !reply.trim() || !canReplyToRequest) return;

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

    const normalizedValues = values.map((item) => {
      const defaults = resolveHeartMeasurementDefaults(item.name);
      if (!defaults) {
        if (item.status?.trim()) return item;
        const computedStatus = computeMeasurementStatus({
          value: item.value ?? null,
          referenceRange: item.referenceRange ?? null,
        });
        return { ...item, status: computedStatus ?? item.status ?? "" };
      }

      const computedStatus = computeMeasurementStatus({
        value: item.value ?? null,
        referenceRange: defaults.referenceRange ?? item.referenceRange ?? null,
        mode: defaults.statusMode,
      });

      return {
        ...item,
        unit: defaults.unit,
        referenceRange: defaults.referenceRange ?? item.referenceRange,
        status: computedStatus ?? "",
      };
    });

    const cleanedValues = normalizedValues.filter(
      (item) => item.name.trim() || item.value?.trim() || item.referenceRange?.trim(),
    );

    uploadResultMutation.mutate(
      {
        orderId,
        payload: {
          status: "RESULT_UPLOADED",
          summary: summary || null,
          conclusion: conclusion || null,
          notes: resultNotes || null,
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
          setValues(createDefaultValues());
          void detailsQuery.refetch();
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };
  const isUploading = uploadResultMutation.isPending;

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
            Continue this order through Inbox, Active Work, Results Ready, and Archive.
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
                  <Badge className={getLabStatusBadgeClassName(detail.status)}>
                    {formatLabStatusLabel(detail.status)}
                  </Badge>
                  {isResultReadyStatus(detail.status) ? (
                    <Badge variant="secondary">Result Uploaded</Badge>
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
                    ? ` - Ordered by ${detail.orderingDoctor?.fullName || detail.orderingDoctorName}`
                    : ""}
                </p>
              </div>
            </CardContent>
          </Card>

          <LabOrderTimeline status={actionStatus} />

          <Card className="border-primary/25">
            <CardHeader>
              <CardTitle>Next Workflow Action</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{workflowActionHint}</p>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <DetailRow label="Request number" value={detail.orderNumber || detail.requestId || detail.id} />
                    <DetailRow label="Patient name" value={detail.patient.fullName} />
                    <DetailRow label="Phone" value={detail.patient.phone} />
                    <DetailRow label="Status" value={formatLabStatusLabel(detail.status)} />
                    <DetailRow label="Created at" value={formatDateTime(detail.orderedAt)} />
                    {orderingDoctorName ? <DetailRow label="Ordering doctor" value={orderingDoctorName} /> : null}
                    {branchName ? <DetailRow label="Branch" value={branchName} /> : null}
                    {sampleCollectionLabel ? (
                      <DetailRow label="Sample collection" value={sampleCollectionLabel} />
                    ) : null}
                    {resultStatusLabel ? <DetailRow label="Result status" value={resultStatusLabel} /> : null}
                  </div>
                </CardContent>
              </Card>

              {requestedServices.length ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Requested Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {requestedServices.length === 1 ? (
                      <div className="rounded-lg border bg-muted/10 p-4">
                        <p className="font-medium">{requestedServices[0].name}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {requestedServices[0].code ? (
                            <Badge variant="outline">Code: {requestedServices[0].code}</Badge>
                          ) : null}
                          {requestedServices[0].category ? (
                            <Badge variant="outline">{requestedServices[0].category}</Badge>
                          ) : null}
                          {requestedServices[0].sampleType ? (
                            <Badge variant="outline">Sample: {requestedServices[0].sampleType}</Badge>
                          ) : null}
                          {requestedServices[0].tatHours != null ? (
                            <Badge variant="outline">TAT: {requestedServices[0].tatHours}h</Badge>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {requestedServices.map((item, index) => (
                          <div key={item.id || `${item.name}-${index}`} className="rounded-lg border bg-muted/10 p-4">
                            <p className="font-medium">{item.name}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {item.code ? <Badge variant="outline">Code: {item.code}</Badge> : null}
                              {item.category ? <Badge variant="outline">{item.category}</Badge> : null}
                              {item.sampleType ? <Badge variant="outline">Sample: {item.sampleType}</Badge> : null}
                              {item.tatHours != null ? <Badge variant="outline">TAT: {item.tatHours}h</Badge> : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : null}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="h-5 w-5" />
                    Decision
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {canReviewOrder ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        This order is in Inbox and requires an approve or reject decision.
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor="reviewMessage">Message to patient</Label>
                        <Textarea
                          id="reviewMessage"
                          value={reviewMessage}
                          onChange={(event) => setReviewMessage(event.target.value)}
                          placeholder="Optional approval or rejection note"
                        />
                        <p className="text-xs text-muted-foreground">
                          This note is sent with the decision.
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button onClick={() => submitReview("approve")} disabled={reviewMutation.isPending}>
                          {reviewMutation.isPending ? "Saving..." : "Approve and start workflow"}
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => submitReview("reject")}
                          disabled={reviewMutation.isPending}
                        >
                          {reviewMutation.isPending ? "Saving..." : "Reject request"}
                        </Button>
                      </div>
                    </>
                  ) : reviewPresentation ? (
                    <div
                      className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                        reviewPresentation.tone === "success"
                          ? "border-green-200 bg-green-50/80 text-green-800"
                          : "border-red-200 bg-red-50/80 text-red-700"
                      }`}
                    >
                      {reviewPresentation.tone === "success" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <Badge
                        className={`border-transparent ${
                          reviewPresentation.tone === "success"
                            ? "bg-green-600 text-white"
                            : "bg-red-600 text-white"
                        }`}
                      >
                        {reviewPresentation.label}
                      </Badge>
                      <span>{reviewPresentation.description}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Decision state is already set to {formatLabStatusLabel(detail.status)}.
                    </p>
                  )}
                </CardContent>
              </Card>

              <SectionCard
                title="Communication"
                description="Shared messages with the patient for this request."
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
                    disabled={!canReplyToRequest}
                  />
                  {!detail.requestId ? (
                    <p className="text-sm text-muted-foreground">
                      Messaging is unavailable for this request at the moment.
                    </p>
                  ) : null}
                  {detail.requestId && !canReplyToRequest ? (
                    <p className="text-sm text-muted-foreground">
                      Replies are disabled because this request is {formatLabStatusLabel(detail.status)}.
                    </p>
                  ) : null}
                </div>
              </SectionCard>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            {hasAvailableStatusTransition ? (
              <Card>
                <CardHeader>
                  <CardTitle>Workflow Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Order status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {formatLabStatusLabel(option)}
                          </SelectItem>
                        ))}
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

                  <Button onClick={submitStatusUpdate} disabled={updateStatusMutation.isPending || !status}>
                    {updateStatusMutation.isPending
                      ? "Saving..."
                      : `Move to ${status ? formatLabStatusLabel(status) : "next step"}`}
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {canUploadResultNow ? (
              <Card>
              <CardHeader>
                <CardTitle>Result Upload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    placeholder="Diagnostic conclusion"
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
                        <div className="space-y-1">
                          <Input
                            value={item.name}
                            onChange={(event) => handleValueChange(index, "name", event.target.value)}
                            placeholder="Measurement name"
                            disabled={isUploading}
                          />
                          {resolveHeartMeasurementDefaults(item.name) ? (
                            <p className="text-xs text-muted-foreground">
                              {resolveHeartMeasurementDefaults(item.name)?.schema.label} -{" "}
                              {resolveHeartMeasurementDefaults(item.name)?.schema.description}
                            </p>
                          ) : null}
                        </div>
                        {(() => {
                          const defaults = resolveHeartMeasurementDefaults(item.name);
                          const unitValue = defaults?.unit ?? (item.unit ?? "");
                          const referenceValue = defaults?.referenceRange ?? (item.referenceRange ?? "");
                          const isSchemaRow = Boolean(defaults);
                          const computedStatus = computeMeasurementStatus({
                            value: item.value ?? null,
                            referenceRange: defaults?.referenceRange ?? item.referenceRange ?? null,
                            mode: defaults?.statusMode,
                          });
                          const statusLabel = computedStatus ?? "Not available";

                          return (
                            <>
                              <div className="grid gap-3 md:grid-cols-2">
                                <Input
                                  value={item.value ?? ""}
                                  onChange={(event) => handleValueChange(index, "value", event.target.value)}
                                  placeholder="Value"
                                  disabled={isUploading}
                                />
                                <Input
                                  value={unitValue}
                                  onChange={(event) => handleValueChange(index, "unit", event.target.value)}
                                  placeholder="Unit"
                                  disabled={isUploading || isSchemaRow}
                                  readOnly={isSchemaRow}
                                />
                              </div>
                              <div className="grid gap-3 md:grid-cols-2">
                                <Input
                                  value={referenceValue}
                                  onChange={(event) =>
                                    handleValueChange(index, "referenceRange", event.target.value)
                                  }
                                  placeholder="Reference range"
                                  disabled={isUploading || isSchemaRow}
                                  readOnly={isSchemaRow}
                                />
                                {isSchemaRow ? (
                                  <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">Status / flag</Label>
                                    <div className="rounded-md border bg-muted/20 px-3 py-2 text-sm">
                                      {statusLabel}
                                    </div>
                                  </div>
                                ) : (
                                  <Input
                                    value={item.status ?? ""}
                                    onChange={(event) => handleValueChange(index, "status", event.target.value)}
                                    placeholder="Status or flag"
                                    disabled={isUploading}
                                  />
                                )}
                              </div>
                            </>
                          );
                        })()}
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
                  <Label htmlFor="resultFile">Result file (optional)</Label>
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
                      This order is now in Results Ready. Move it to Completed after final hand-off.
                    </AlertDescription>
                  </Alert>
                ) : null}
              </CardContent>
              </Card>
            ) : actionStatus === "RESULT_UPLOADED" || actionStatus === "COMPLETED" ? (
              <Alert>
                <AlertTitle>Result upload complete</AlertTitle>
                <AlertDescription>
                  This order already has an uploaded result and is currently {formatLabStatusLabel(detail.status)}.
                </AlertDescription>
              </Alert>
            ) : null}
          </div>

        </div>
      ) : (
        <Card>
          <CardContent className="space-y-3 p-8 text-center text-muted-foreground">
            <p>No order details were returned for this record.</p>
            <Button variant="outline" size="sm" onClick={() => void detailsQuery.refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default LabOrderDetailsPage;



