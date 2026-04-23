import { useEffect, useRef, useState } from "react";
import { differenceInYears, isValid, parseISO } from "date-fns";
import { ArrowLeft, CheckCircle, Download, FlaskConical, User } from "lucide-react";
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
import { usePatientLabResultDetailsQuery, usePatientProfileQuery } from "@/hooks/usePatientProfile";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import { patientService } from "@/services/patient.service";
import { ApiError } from "@/types/api.types";
import { formatDisplayDateTime } from "@/lib/date-time";
import { resolveHeartMeasurementDefaults } from "@/lib/heartMeasurementSchema";
import { computeMeasurementStatus } from "@/lib/measurementStatus";
import {
  formatLabStatusLabel,
  getLabStatusBadgeClassName,
  isPatientResultVisibleStatus,
} from "@/lib/labStatus";

type LabPrediction = {
  riskLevel?: string | null;
  probability?: number | null;
  explanation?: string | null;
  thresholdUsed?: number | null;
};

const formatDate = (value?: string | null) => formatDisplayDateTime(value);

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
  const thresholdValue =
    (record.thresholdUsed as number | string | undefined) ??
    (record.threshold_used as number | string | undefined) ??
    (record.threshold as number | string | undefined);
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
      ? "The AI analysis indicates an elevated health risk based on the available lab data. Please consider consulting a doctor."
      : riskLevel === "Low"
        ? "The AI analysis indicates a lower health risk based on the available lab data."
        : null;

  const normalized = {
    riskLevel,
    probability: Number.isFinite(parsedProbability) ? parsedProbability : null,
    explanation,
    thresholdUsed: Number.isFinite(parsedThreshold) ? parsedThreshold : null,
  };
  return normalized;
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

const getStatusTone = (status?: string | null) => {
  const normalized = (status ?? "").trim().toLowerCase();
  if (normalized === "normal") return "text-green-700";
  if (normalized === "high") return "text-red-600";
  if (normalized === "low") return "text-orange-600";
  if (normalized === "valid") return "text-green-700";
  if (normalized === "invalid") return "text-red-600";
  return "text-muted-foreground";
};

const computeAge = (dateOfBirth?: string | null) => {
  if (!dateOfBirth) return null;
  const parsed = parseISO(dateOfBirth);
  if (!isValid(parsed)) return null;
  const age = differenceInYears(new Date(), parsed);
  return Number.isFinite(age) && age >= 0 ? age : null;
};

const PatientLabResultDetails = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const query = usePatientLabResultDetailsQuery(resultId, Boolean(user));
  const profileQuery = usePatientProfileQuery(Boolean(user));
  const userName = getDisplayName(user ?? {});
  const [prediction, setPrediction] = useState<LabPrediction | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const analysisRef = useRef<HTMLDivElement | null>(null);

  const aiResultId = query.data?.id ?? resultId ?? null;
  const canRunAiAnalysis =
    Boolean(aiResultId) && isPatientResultVisibleStatus(query.data?.orderStatus ?? query.data?.status ?? null);
  const requestId = query.data?.requestId ?? null;
  const hasPrediction = Boolean(prediction);
  const isHighRisk = (prediction?.riskLevel ?? "").trim().toLowerCase() === "high";
  const doctorFollowUp = query.data?.doctorFollowUp ?? null;
  const hasDoctorFollowUp =
    doctorFollowUp?.exists === true ||
    Boolean(doctorFollowUp?.requestId) ||
    Boolean(doctorFollowUp?.requestStatus) ||
    Boolean(doctorFollowUp?.doctorName) ||
    Boolean(doctorFollowUp?.appointmentId) ||
    Boolean(doctorFollowUp?.appointmentStatus) ||
    Boolean(doctorFollowUp?.appointmentScheduledAt);
  const hasFollowUpAppointment =
    Boolean(doctorFollowUp?.appointmentId) ||
    Boolean(doctorFollowUp?.appointmentScheduledAt) ||
    Boolean(doctorFollowUp?.appointmentStatus);

  useEffect(() => {
    if (!canRunAiAnalysis || !aiResultId) {
      setPrediction(null);
      setPredictionLoading(false);
      return;
    }
    let isActive = true;

    setPredictionLoading(true);
    setPredictionError(null);
    patientService
      .getPatientLabResultPrediction(aiResultId)
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
        setPredictionError(message);
        toast.error(message);
      })
      .finally(() => {
        if (isActive) setPredictionLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [aiResultId, canRunAiAnalysis]);

  const handleRunAnalysis = async () => {
    if (!canRunAiAnalysis || !aiResultId) return;
    const profile = profileQuery.data;
    const age = computeAge(profile?.dateOfBirth ?? null);
    const gender = profile?.gender ?? null;
    if (age == null || !gender) {
      const message = "Patient age and gender are required for AI analysis. Please update your profile.";
      setPredictionError(message);
      toast.error(message);
      return;
    }
    setPredicting(true);
    setPredictionError(null);
    try {
      await patientService.runPatientLabResultPrediction(aiResultId, { age, gender });
      const response = await patientService.getPatientLabResultPrediction(aiResultId);
      const normalized = normalizePrediction(response);
      if (!normalized) {
        const message = "Prediction completed, but no analysis was returned.";
        setPredictionError(message);
        toast.error(message);
      }
      setPrediction(normalized);
      analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error: unknown) {
      const apiError = error instanceof ApiError ? error : null;
        const message =
        apiError?.statusCode === 404
          ? "AI analysis is temporarily unavailable for this result."
          : error instanceof Error
            ? error.message
            : "Unable to run AI analysis.";
      setPredictionError(message);
      toast.error(message);
    } finally {
      setPredicting(false);
    }
  };

  const handleViewAnalysis = () => {
    analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDownloadAiReport = () => {
    if (!query.data || !prediction) return;

  const measurementRows = query.data.measurements.length
      ? query.data.measurements
          .map(
            (measurement) => {
              const schemaMatch = resolveHeartMeasurementDefaults(measurement.name ?? null);
              const schema = schemaMatch?.schema ?? null;
              const keyLabel = schemaMatch?.key ?? (measurement.name || "Not available");
              const label = schema?.label ?? (measurement.name || "Not available");
              const unit = measurement.unit || schema?.unit || "Not available";
              const referenceRange =
                measurement.referenceRange || schema?.referenceRange || "Not available";
              const description = schema?.description ?? "";
              const computedStatus = schemaMatch
                ? computeMeasurementStatus({
                    value: measurement.value ?? null,
                    referenceRange: schemaMatch.referenceRange ?? measurement.referenceRange ?? null,
                    mode: schemaMatch.statusMode,
                  })
                : computeMeasurementStatus({
                    value: measurement.value ?? null,
                    referenceRange: measurement.referenceRange ?? null,
                  });
              const derivedStatus = schemaMatch
                ? computedStatus
                : measurement.status ?? computedStatus ?? null;
              const statusClass =
                derivedStatus === "Normal"
                  ? "status-normal"
                  : derivedStatus === "High"
                    ? "status-high"
                    : derivedStatus === "Low"
                      ? "status-low"
                      : derivedStatus === "Valid"
                        ? "status-normal"
                        : derivedStatus === "Invalid"
                          ? "status-high"
                      : "status-muted";
              return `
              <tr>
                <td>${keyLabel}</td>
                <td>${label}</td>
                <td>${measurement.value || "Not available"}</td>
                <td>${unit}</td>
                <td>${referenceRange}</td>
                <td class="${statusClass}">${derivedStatus || "Not available"}</td>
                <td>${description || "Not available"}</td>
              </tr>
            `;
            },
          )
          .join("")
      : "";

    const reportWindow = window.open("", "_blank", "width=900,height=700");
    if (!reportWindow) {
      toast.error("Unable to open the report preview. Please allow pop-ups and try again.");
      return;
    }

    const title = "AI Health Risk Report";
    const documentTitle = `AI Report - ${query.data.testName || "Lab Result"}`;
    const generatedAt = new Date().toLocaleString();
    const reportHtml = `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <title>${documentTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111827; margin: 32px; }
            h1 { font-size: 22px; margin: 0 0 8px; }
            h2 { font-size: 16px; margin: 24px 0 8px; }
            .muted { color: #6b7280; font-size: 13px; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
            .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
            .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; color: #6b7280; }
            .value { font-size: 14px; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 13px; }
            th { background: #f9fafb; text-transform: uppercase; letter-spacing: 0.04em; font-size: 11px; color: #6b7280; }
            .status-normal { color: #15803d; font-weight: 600; }
            .status-high { color: #dc2626; font-weight: 600; }
            .status-low { color: #ea580c; font-weight: 600; }
            .status-muted { color: #6b7280; }
            .disclaimer { margin-top: 24px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="muted">
            Generated from your lab result details.<br/>
            Generated at: ${generatedAt}
          </div>

          <h2>Test Details</h2>
          <div class="grid">
            <div class="card">
              <div class="label">Test name</div>
              <div class="value">${query.data.testName || "Not available"}</div>
            </div>
            <div class="card">
              <div class="label">Laboratory</div>
              <div class="value">${query.data.laboratoryName || "Not available"}</div>
            </div>
            <div class="card">
              <div class="label">Result date</div>
              <div class="value">${formatDate(query.data.reportedAt)}</div>
            </div>
          </div>

          <h2>AI Analysis</h2>
          <div class="grid">
            <div class="card">
              <div class="label">Risk level</div>
              <div class="value">${getRiskTone(prediction.riskLevel).label}</div>
            </div>
            <div class="card">
              <div class="label">Probability</div>
              <div class="value">${formatProbability(prediction.probability)}</div>
            </div>
            <div class="card">
              <div class="label">Threshold used</div>
              <div class="value">${prediction.thresholdUsed != null ? prediction.thresholdUsed : "Not available"}</div>
            </div>
            <div class="card" style="grid-column: 1 / -1;">
              <div class="label">Explanation</div>
              <div class="value">${prediction.explanation || "No explanation provided."}</div>
            </div>
          </div>

          <h2>Measurements</h2>
          ${
            measurementRows
              ? `
            <table>
              <thead>
                <tr>
                  <th>Key</th>
                  <th>Scientific Label</th>
                  <th>Value</th>
                  <th>Unit</th>
                  <th>Reference Range</th>
                  <th>Status / Flag</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                ${measurementRows}
              </tbody>
            </table>
          `
              : `<p class="muted">No measurements were provided for this result.</p>`
          }

          <div class="disclaimer">
            Disclaimer: This AI-generated report is informational only and does not replace professional
            medical advice, diagnosis, or treatment.
          </div>
        </body>
      </html>
    `;

    reportWindow.document.open();
    reportWindow.document.write(reportHtml);
    reportWindow.document.close();
    reportWindow.focus();
    reportWindow.print();
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
            Back to lab results
          </Link>
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">Lab Result Details</h1>
        <p className="text-muted-foreground">
          Review your lab result details, measurements, and related notes.
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
          <AlertDescription>
            {(query.error as Error).message}
            <Button variant="outline" size="sm" className="mt-3" onClick={() => void query.refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : query.data ? (
        !isPatientResultVisibleStatus(query.data.orderStatus ?? query.data.status) ? (
          <Alert>
            <AlertTitle>Result not available yet</AlertTitle>
            <AlertDescription>
              This result will appear once the related lab order reaches Result Uploaded.
            </AlertDescription>
          </Alert>
        ) : (
        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FlaskConical className="h-5 w-5" />
                  </div>
                   <CardTitle>{query.data.testName}</CardTitle>
                   <Badge className={getLabStatusBadgeClassName(query.data.status)}>
                     {formatLabStatusLabel(query.data.status)}
                   </Badge>
                   {query.data.isAbnormal ? <Badge variant="destructive">Abnormal</Badge> : null}
                 </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {query.data.category ? <DetailRow label="Category" value={query.data.category} /> : null}
                  {query.data.laboratoryName ? (
                    <DetailRow label="Laboratory" value={query.data.laboratoryName} />
                  ) : null}
                  {query.data.orderingDoctorName ? (
                    <DetailRow label="Ordering Doctor" value={query.data.orderingDoctorName} />
                  ) : null}
                  {query.data.reportedAt ? (
                    <DetailRow label="Result Date" value={formatDate(query.data.reportedAt)} />
                  ) : null}
                  {query.data.collectedAt ? (
                    <DetailRow label="Collected At" value={formatDate(query.data.collectedAt)} />
                  ) : null}
                  {query.data.interpretation ? (
                    <DetailRow label="Interpretation" value={query.data.interpretation} />
                  ) : null}
                  {query.data.conclusion ? (
                    <DetailRow label="Conclusion" value={query.data.conclusion} />
                  ) : null}
                  {query.data.notes ? <DetailRow label="Notes" value={query.data.notes} /> : null}
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
                            (() => {
                              const schemaMatch = resolveHeartMeasurementDefaults(measurement.name ?? null);
                              const schema = schemaMatch?.schema ?? null;
                              const displayName = schema?.label ?? measurement.name;
                              const unit = measurement.unit || schema?.unit || "Not provided";
                              const referenceRange =
                                measurement.referenceRange || schema?.referenceRange || "Not provided";
                              const computedStatus = schemaMatch
                                ? computeMeasurementStatus({
                                    value: measurement.value ?? null,
                                    referenceRange: schemaMatch.referenceRange ?? measurement.referenceRange ?? null,
                                    mode: schemaMatch.statusMode,
                                  })
                                : computeMeasurementStatus({
                                    value: measurement.value ?? null,
                                    referenceRange: measurement.referenceRange ?? null,
                                  });
                              const derivedStatus = schemaMatch
                                ? computedStatus
                                : measurement.status ?? computedStatus ?? null;
                              const statusLabel = derivedStatus || "Not available";
                              return (
                            <TableRow key={`${measurement.name}-${index}`}>
                              <TableCell>
                                {displayName}
                                {schema?.description ? (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {schema.description}
                                  </p>
                                ) : null}
                              </TableCell>
                              <TableCell>
                                {[measurement.value, unit === "Not provided" ? null : unit]
                                  .filter(Boolean)
                                  .join(" ")}
                              </TableCell>
                              <TableCell>{referenceRange}</TableCell>
                              <TableCell className={getStatusTone(derivedStatus)}>
                                {statusLabel}
                              </TableCell>
                            </TableRow>
                              );
                            })()
                          ))
                        ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No measurements are available yet for this result.
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
                      <p className="text-xs text-muted-foreground">Generated from this published lab result.</p>
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
                        : "No AI analysis is available for this result yet."}
                    </p>
                  )}
                  {predictionError ? (
                    <p className="mt-3 text-sm text-destructive">{predictionError}</p>
                  ) : null}
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
                {query.data.resultNumber ? (
                  <DetailRow label="Reference" value={query.data.resultNumber} />
                ) : null}
                {query.data.orderedAt ? (
                  <DetailRow label="Ordered At" value={formatDate(query.data.orderedAt)} />
                ) : null}
                {query.data.reportUrl ? (
                  <Button asChild className="w-full" variant="outline">
                    <a href={query.data.reportUrl} target="_blank" rel="noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Open Full Report
                    </a>
                  </Button>
                ) : null}
                {canRunAiAnalysis ? (
                  hasPrediction ? (
                    <>
                  <Button className="w-full" variant="outline" onClick={handleViewAnalysis}>
                    View AI Analysis
                  </Button>
                  <Button className="w-full" variant="outline" onClick={handleDownloadAiReport}>
                    Print / Save AI Report
                  </Button>
                </>
              ) : (
                  <Button
                    className="w-full"
                    onClick={handleRunAnalysis}
                      disabled={predicting || predictionLoading}
                    >
                      {predicting ? "Running Analysis..." : "Analyze with AI"}
                    </Button>
                  )
                ) : (
                  <p className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                    AI analysis is available after the result reaches Result Uploaded.
                  </p>
                )}
                {hasPrediction && isHighRisk ? (
                  <div className="rounded-lg border bg-green-50 p-4">
                    {hasDoctorFollowUp ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <p className="text-sm font-medium text-green-800">
                            {hasFollowUpAppointment ? "Appointment scheduled" : "Doctor follow-up started"}
                          </p>
                        </div>
                        {hasFollowUpAppointment ? (
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {doctorFollowUp?.doctorName ? (
                              <p>Doctor: {doctorFollowUp.doctorName}</p>
                            ) : null}
                            {doctorFollowUp?.appointmentScheduledAt ? (
                              <p>Appointment: {formatDate(doctorFollowUp.appointmentScheduledAt)}</p>
                            ) : null}
                            {doctorFollowUp?.appointmentStatus ? (
                              <p>Status: {doctorFollowUp.appointmentStatus}</p>
                            ) : null}
                          </div>
                        ) : (
                          <div className="space-y-1 text-sm text-muted-foreground">
                            {doctorFollowUp?.doctorName ? (
                              <p>Doctor: {doctorFollowUp.doctorName}</p>
                            ) : null}
                            {doctorFollowUp?.requestStatus ? (
                              <p>Request status: {doctorFollowUp.requestStatus}</p>
                            ) : null}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {hasFollowUpAppointment && doctorFollowUp?.appointmentId ? (
                            <Button asChild className="w-full" variant="outline">
                              <Link to={`/patient/appointments/${doctorFollowUp.appointmentId}`}>
                                View appointment
                              </Link>
                            </Button>
                          ) : doctorFollowUp?.requestId ? (
                            <Button asChild className="w-full" variant="outline">
                              <Link to={`/patient/requests/doctor/${doctorFollowUp.requestId}`}>
                                View request
                              </Link>
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() =>
                          navigate("/patient/doctors", {
                            state: {
                              source: "ai_prediction",
                              requestId,
                              resultId,
                              riskLevel: "High",
                              sourceTestRequestId: requestId,
                            },
                          })
                        }
                      >
                        Book an appointment
                      </Button>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
        )
      ) : (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            This lab result could not be found. Please return to your lab results and try again.
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default PatientLabResultDetails;
