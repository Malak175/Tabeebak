import { ChangeEvent, useEffect, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { ArrowLeft, FileUp, FlaskConical, Save } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
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
  useUpdateLabOrderStatusMutation,
  useUploadLabOrderResultMutation,
} from "@/hooks/useLabWorkflow";
import { useLabProfileQuery } from "@/hooks/useLabProfile";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
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
  const { user } = useAuth();
  const profileQuery = useLabProfileQuery(Boolean(user));
  const detailsQuery = useLabOrderDetailsQuery(orderId, Boolean(user));
  const updateStatusMutation = useUpdateLabOrderStatusMutation();
  const uploadResultMutation = useUploadLabOrderResultMutation();
  const userName = getDisplayName(profileQuery.data ?? user ?? {});

  const [status, setStatus] = useState("processing");
  const [statusNotes, setStatusNotes] = useState("");
  const [resultStatus, setResultStatus] = useState("completed");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [summary, setSummary] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [resultNotes, setResultNotes] = useState("");
  const [reportedAt, setReportedAt] = useState("");
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [values, setValues] = useState<UploadLabResultValue[]>([createEmptyValue()]);

  const detail = detailsQuery.data;

  useEffect(() => {
    if (!detail) return;

    setStatus(detail.status);
    setStatusNotes(detail.internalNotes ?? detail.notes ?? "");
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

  const submitResultUpload = () => {
    if (!orderId) return;

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
            <Link to="/lab/pending">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to lab workflow
            </Link>
          </Button>
          <h1 className="text-2xl font-bold md:text-3xl">Lab Order Details</h1>
          <p className="text-muted-foreground">
            Review the live order record, update order status, and upload the final result.
          </p>
        </div>
      </div>

      {detailsQuery.isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : detailsQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load lab order details</AlertTitle>
          <AlertDescription>
            {(detailsQuery.error as Error).message}
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void detailsQuery.refetch()}
            >
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
                  <Badge className={getStatusClassName(detail.status)}>{detail.status}</Badge>
                  {detail.priority ? <Badge variant="outline">{detail.priority}</Badge> : null}
                </div>
                <p className="text-lg font-medium text-primary">{detail.testName}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>Order: {detail.orderNumber || detail.id}</span>
                  <span>Sample: {detail.sampleId || "Pending assignment"}</span>
                  <span>Doctor: {detail.orderingDoctorName || "Not available"}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link to="/lab/completed">Results history</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Snapshot</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <DetailRow label="Ordered at" value={formatDateTime(detail.orderedAt)} />
                  <DetailRow label="Scheduled at" value={formatDateTime(detail.scheduledAt)} />
                  <DetailRow label="Collected at" value={formatDateTime(detail.collectedAt)} />
                  <DetailRow label="Completed at" value={formatDateTime(detail.completedAt)} />
                  <DetailRow label="Patient phone" value={detail.patient.phone} />
                  <DetailRow label="Patient demographics" value={[
                    detail.patient.age ? `${detail.patient.age} years` : null,
                    detail.patient.gender,
                  ].filter(Boolean).join(" - ")} />
                  <DetailRow label="Doctor specialty" value={detail.orderingDoctor?.specialty} />
                  <DetailRow label="Service category" value={detail.service?.category} />
                  <DetailRow label="Sample type" value={detail.specimenType || detail.service?.sampleType} />
                  <DetailRow label="Sample collection" value={detail.sampleCollectionStatus} />
                  <DetailRow label="Collection address" value={detail.sampleCollectionAddress} />
                  <DetailRow label="Turnaround time" value={detail.service?.turnaroundTime} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Update</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="status">Order status</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="sample_collected">Sample collected</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="statusNotes">Order notes</Label>
                    <Textarea
                      id="statusNotes"
                      value={statusNotes}
                      onChange={(event) => setStatusNotes(event.target.value)}
                      placeholder="Add an internal workflow note"
                    />
                  </div>

                  <Button onClick={submitStatusUpdate} disabled={updateStatusMutation.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    {updateStatusMutation.isPending ? "Saving..." : "Update status"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="resultStatus">Result status</Label>
                      <Select value={resultStatus} onValueChange={setResultStatus}>
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
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="summary">Summary</Label>
                    <Textarea
                      id="summary"
                      value={summary}
                      onChange={(event) => setSummary(event.target.value)}
                      placeholder="Clinical summary or interpretation"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="conclusion">Conclusion</Label>
                    <Textarea
                      id="conclusion"
                      value={conclusion}
                      onChange={(event) => setConclusion(event.target.value)}
                      placeholder="Final conclusion"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resultNotes">Notes</Label>
                    <Textarea
                      id="resultNotes"
                      value={resultNotes}
                      onChange={(event) => setResultNotes(event.target.value)}
                      placeholder="Optional lab notes"
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
                      >
                        Add row
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {values.map((item, index) => (
                        <div key={index} className="grid gap-3 rounded-lg border p-3">
                          <Input
                            value={item.name}
                            onChange={(event) =>
                              handleValueChange(index, "name", event.target.value)
                            }
                            placeholder="Measurement name"
                          />
                          <div className="grid gap-3 md:grid-cols-2">
                            <Input
                              value={item.value ?? ""}
                              onChange={(event) =>
                                handleValueChange(index, "value", event.target.value)
                              }
                              placeholder="Value"
                            />
                            <Input
                              value={item.unit ?? ""}
                              onChange={(event) =>
                                handleValueChange(index, "unit", event.target.value)
                              }
                              placeholder="Unit"
                            />
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <Input
                              value={item.referenceRange ?? ""}
                              onChange={(event) =>
                                handleValueChange(index, "referenceRange", event.target.value)
                              }
                              placeholder="Reference range"
                            />
                            <Input
                              value={item.status ?? ""}
                              onChange={(event) =>
                                handleValueChange(index, "status", event.target.value)
                              }
                              placeholder="Status or flag"
                            />
                          </div>
                          {values.length > 1 ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setValues((current) =>
                                  current.filter((_, itemIndex) => itemIndex !== index),
                                )
                              }
                            >
                              Remove row
                            </Button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resultFile">Result file</Label>
                    <Input id="resultFile" type="file" onChange={handleFileChange} />
                    {resultFile ? (
                      <p className="text-sm text-muted-foreground">{resultFile.name}</p>
                    ) : null}
                  </div>

                  <Button onClick={submitResultUpload} disabled={uploadResultMutation.isPending}>
                    <FileUp className="mr-2 h-4 w-4" />
                    {uploadResultMutation.isPending ? "Uploading..." : "Upload result"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Clinical Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>{detail.instructions || "No preparation instructions were returned."}</p>
                  <p>{detail.diagnosis || "No diagnosis details were returned."}</p>
                  <p>{detail.specimenNotes || "No specimen notes were returned."}</p>
                </CardContent>
              </Card>
            </div>
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
