import { useEffect, useRef, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { ArrowLeft, Download, FlaskConical, User } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { patientNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePatientLabResultDetailsQuery } from "@/hooks/usePatientProfile";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import { apiRequest } from "@/services/api";
import { ApiError } from "@/types/api.types";

type LabPrediction = {
  riskLevel?: string | null;
  probability?: number | null;
  explanation?: string | null;
  thresholdUsed?: number | null;
};

const formatDate = (value?: string | null) => {
  if (!value) return "Not available";

  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;

  return format(parsed, "PPP");
};

const getStatusClassName = (status?: string | null) => {
  switch ((status ?? "").toLowerCase()) {
    case "completed":
    case "final":
    case "ready":
      return "bg-green-100 text-green-700 border-green-200";
    case "pending":
    case "processing":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const DetailRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="rounded-lg border p-4">
    <p className="mb-1 text-sm font-medium">{label}</p>
    <p className="text-sm text-muted-foreground">{value || "Not available"}</p>
  </div>
);

const normalizePrediction = (payload: unknown): LabPrediction | null => {
  if (!payload) return null;
  const data = (payload as { data?: unknown }).data ?? payload;
  const raw = Array.isArray(data) ? data[0] : data;
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const predictionValue = record.prediction as number | string | undefined;
  const probabilityValue = record.probability as number | string | undefined;
  const thresholdValue = record.threshold_used as number | string | undefined;
  const successValue = record.success as boolean | undefined;

  if (successValue === false) return null;

  const parsedPrediction =
    typeof predictionValue === "number"
      ? predictionValue
      : typeof predictionValue === "string"
        ? Number.parseInt(predictionValue, 10)
        : null;
  const parsedProbability =
    typeof probabilityValue === "number"
      ? probabilityValue
      : typeof probabilityValue === "string"
        ? Number.parseFloat(probabilityValue)
        : null;
  const parsedThreshold =
    typeof thresholdValue === "number"
      ? thresholdValue
      : typeof thresholdValue === "string"
        ? Number.parseFloat(thresholdValue)
        : null;

  let riskLevel: string | null = null;
  if (parsedPrediction === 0) riskLevel = "Low";
  if (parsedPrediction === 1) riskLevel = "High";

  const explanation =
    riskLevel === "High"
      ? "The AI analysis indicates an elevated cardiovascular risk based on the available lab data. Please consider consulting a doctor."
      : riskLevel === "Low"
        ? "The AI analysis indicates a lower cardiovascular risk based on the available lab data."
        : null;

  return {
    riskLevel,
    probability: Number.isFinite(parsedProbability) ? parsedProbability : null,
    explanation,
    thresholdUsed: Number.isFinite(parsedThreshold) ? parsedThreshold : null,
  };
};

const getRiskTone = (riskLevel?: string | null) => {
  const normalized = (riskLevel ?? "").trim().toLowerCase();
  if (["low", "low risk"].includes(normalized)) {
    return { label: "Low", className: "border-green-200 bg-green-50 text-green-700" };
  }
  if (["medium", "moderate", "medium risk"].includes(normalized)) {
    return { label: "Medium", className: "border-yellow-200 bg-yellow-50 text-yellow-700" };
  }
  if (["high", "high risk"].includes(normalized)) {
    return { label: "High", className: "border-red-200 bg-red-50 text-red-700" };
  }
  return { label: riskLevel || "Unknown", className: "border-muted bg-muted/40 text-muted-foreground" };
};

const formatProbability = (value?: number | null) => {
  if (value == null || Number.isNaN(value)) return "Not available";
  const normalized = value <= 1 ? value * 100 : value;
  const clamped = Math.min(Math.max(normalized, 0), 100);
  return `${Math.round(clamped)}%`;
};

const PatientLabResultDetails = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const query = usePatientLabResultDetailsQuery(resultId, Boolean(user));
  const userName = getDisplayName(user ?? {});
  const [prediction, setPrediction] = useState<LabPrediction | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const analysisRef = useRef<HTMLDivElement | null>(null);

  const requestId = query.data?.requestId ?? null;
  const hasPrediction = Boolean(prediction);
  const isHighRisk = (prediction?.riskLevel ?? "").trim().toLowerCase() === "high";

  useEffect(() => {
    if (!requestId) return;
    let isActive = true;

    setPredictionLoading(true);
    apiRequest<unknown>(`/api/v1/test-requests/${requestId}/predictions`, { method: "GET", auth: true })
      .then((response) => {
        if (!isActive) return;
        setPrediction(normalizePrediction(response));
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        const apiError = error instanceof ApiError ? error : null;
        if (apiError?.statusCode === 404) {
          setPrediction(null);
          return;
        }
        const message = error instanceof Error ? error.message : "Unable to load AI analysis.";
        toast.error(message);
      })
      .finally(() => {
        if (isActive) setPredictionLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [requestId]);

  const handleRunAnalysis = async () => {
    if (!requestId) return;
    setPredicting(true);
    try {
      await apiRequest(`/api/v1/test-requests/${requestId}/predict`, { method: "POST", auth: true });
      const response = await apiRequest<unknown>(`/api/v1/test-requests/${requestId}/predictions`, {
        method: "GET",
        auth: true,
      });
      const normalized = normalizePrediction(response);
      if (!normalized) {
        toast.error("Prediction completed, but no analysis was returned.");
      }
      setPrediction(normalized);
      analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unable to run AI analysis.";
      toast.error(message);
    } finally {
      setPredicting(false);
    }
  };

  const handleViewAnalysis = () => {
    analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <DashboardLayout
      userRole="patient"
      userName={userName}
      navItems={patientNavItems}
      userIcon={User}
    >
      <div className="mb-6">
        <Button asChild variant="ghost" className="-ml-4 mb-2">
          <Link to="/patient/lab-results">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to lab records
          </Link>
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">Lab Result Details</h1>
        <p className="text-muted-foreground">
          Result details are loaded per record from the patient lab results detail endpoint.
        </p>
      </div>

      {query.isLoading ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-28 w-full" />
          </CardContent>
        </Card>
      ) : query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load lab result details</AlertTitle>
          <AlertDescription>{(query.error as Error).message}</AlertDescription>
        </Alert>
      ) : query.data ? (
        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FlaskConical className="h-5 w-5" />
                  </div>
                  <CardTitle>{query.data.testName}</CardTitle>
                  <Badge className={getStatusClassName(query.data.status)}>{query.data.status}</Badge>
                  {query.data.isAbnormal ? <Badge variant="destructive">Abnormal</Badge> : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <DetailRow label="Category" value={query.data.category} />
                  <DetailRow label="Laboratory" value={query.data.laboratoryName} />
                  <DetailRow label="Ordering Doctor" value={query.data.orderingDoctorName} />
                  <DetailRow label="Reported At" value={formatDate(query.data.reportedAt)} />
                  <DetailRow label="Collected At" value={formatDate(query.data.collectedAt)} />
                  <DetailRow label="Interpretation" value={query.data.interpretation} />
                  <DetailRow label="Conclusion" value={query.data.conclusion} />
                  <DetailRow label="Notes" value={query.data.notes} />
                </div>

                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Measurement</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {query.data.measurements.length ? (
                        query.data.measurements.map((measurement, index) => (
                          <TableRow key={`${measurement.name}-${index}`}>
                            <TableCell>{measurement.name}</TableCell>
                            <TableCell>
                              {[measurement.value, measurement.unit].filter(Boolean).join(" ")}
                            </TableCell>
                            <TableCell>{measurement.referenceRange || "Not provided"}</TableCell>
                            <TableCell>{measurement.status || "Normal"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No measurement breakdown was returned for this result.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                <div ref={analysisRef} className="rounded-lg border bg-muted/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">AI Analysis</p>
                      <p className="text-xs text-muted-foreground">Generated from this lab request.</p>
                    </div>
                    {predictionLoading || predicting ? (
                      <Badge variant="outline">Analyzing...</Badge>
                    ) : null}
                  </div>

                  {prediction ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      <div
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          getRiskTone(prediction.riskLevel).className
                        }`}
                      >
                        <p className="text-xs uppercase tracking-wide">Risk level</p>
                        <p className="mt-1 text-base font-semibold">
                          {getRiskTone(prediction.riskLevel).label}
                        </p>
                      </div>
                      <div className="rounded-lg border px-3 py-2 text-sm">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Probability</p>
                        <p className="mt-1 text-base font-semibold">
                          {formatProbability(prediction.probability)}
                        </p>
                      </div>
                      <div className="rounded-lg border px-3 py-2 text-sm">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Threshold used</p>
                        <p className="mt-1 text-base font-semibold">
                          {prediction.thresholdUsed != null ? prediction.thresholdUsed : "Not available"}
                        </p>
                      </div>
                      <div className="rounded-lg border px-3 py-2 text-sm md:col-span-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Explanation</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {prediction.explanation || "No explanation provided."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {predictionLoading || predicting
                        ? "Generating analysis for this lab result."
                        : "No AI analysis is available for this request yet."}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Result Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow label="Result ID" value={query.data.id} />
                <DetailRow label="Reference" value={query.data.resultNumber} />
                <DetailRow label="Ordered At" value={formatDate(query.data.orderedAt)} />
                {query.data.reportUrl ? (
                  <Button asChild className="w-full" variant="outline">
                    <a href={query.data.reportUrl} target="_blank" rel="noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Open Full Report
                    </a>
                  </Button>
                ) : null}
                {requestId ? (
                  hasPrediction ? (
                    <Button className="w-full" variant="outline" onClick={handleViewAnalysis}>
                      View Analysis
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={handleRunAnalysis}
                      disabled={predicting || predictionLoading}
                    >
                      {predicting ? "Running Analysis..." : "Run AI Analysis"}
                    </Button>
                  )
                ) : null}
                {hasPrediction && isHighRisk ? (
                  <Button
                    className="w-full"
                    onClick={() =>
                      navigate("/patient/doctors", {
                        state: {
                          source: "ai_prediction",
                          requestId,
                          resultId,
                          riskLevel: "High",
                        },
                      })
                    }
                  >
                    Book Doctor
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
};

export default PatientLabResultDetails;
