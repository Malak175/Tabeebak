import { useEffect, useState } from "react";
import { formatDisplayDate, formatDisplayDateTime } from "@/lib/date-time";
import { Calendar, Clock, MapPin, Stethoscope, Video } from "lucide-react";
import { Link, useParams } from "react-router-dom";
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
  useDoctorAppointmentDetailsQuery,
  useDoctorPrescriptionDetailsQuery,
  useUpdateDoctorAppointmentMutation,
} from "@/hooks/useDoctorWorkflow";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import { toast } from "sonner";

const formatDateTime = (value?: string | null) => formatDisplayDateTime(value);

const formatDateOnly = (value?: string | null) => formatDisplayDate(value);

const getStatusClassName = (status?: string | null) => {
  switch ((status ?? "").toLowerCase()) {
    case "confirmed":
    case "completed":
      return "bg-green-100 text-green-700 border-green-200";
    case "in-progress":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "cancelled":
    case "canceled":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border bg-muted/20 p-4">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-1 font-medium">{value}</p>
  </div>
);

const DoctorAppointmentDetails = () => {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const query = useDoctorAppointmentDetailsQuery(appointmentId, Boolean(user));
  const updateMutation = useUpdateDoctorAppointmentMutation(appointmentId ?? "");
  const userName = getDisplayName(user ?? {});
  const [isEditing, setIsEditing] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [submitAction, setSubmitAction] = useState<"save" | "complete" | null>(null);

  const appointmentRequest = query.data?.appointmentRequest ?? null;
  const reason = appointmentRequest?.reason ?? query.data?.reason ?? null;
  const requestNote = appointmentRequest?.notes ?? appointmentRequest?.providerMessage ?? null;
  const visitNote = query.data?.notes ?? null;
  const showRequestNote = Boolean(requestNote && (!visitNote || requestNote !== visitNote));
  const isCompleted = (query.data?.status ?? "").toLowerCase() === "completed";
  const prescriptionInfo = query.data?.prescription ?? null;
  const prescriptionExists = prescriptionInfo?.exists === true;
  const prescriptionLatestId = prescriptionInfo?.latestId
    ? String(prescriptionInfo.latestId)
    : undefined;
  const prescriptionDetailsQuery = useDoctorPrescriptionDetailsQuery(
    prescriptionLatestId,
    Boolean(user) && prescriptionExists && Boolean(prescriptionLatestId),
  );

  useEffect(() => {
    if (!query.data || isEditing) return;

    setDiagnosis(query.data.diagnosis ?? "");
    setNotes(query.data.notes ?? "");
  }, [query.data, isEditing]);

  useEffect(() => {
    if (isCompleted) {
      setIsEditing(false);
    }
  }, [isCompleted]);

  const detailRows = query.data
    ? ([
        query.data.status ? { label: "Status", value: query.data.status } : null,
        query.data.scheduledAt
          ? { label: "Scheduled for", value: formatDateTime(query.data.scheduledAt) }
          : { label: "Scheduled for", value: "Not recorded yet" },
        query.data.endAt ? { label: "Ends at", value: formatDateTime(query.data.endAt) } : null,
        query.data.type ? { label: "Visit type", value: query.data.type } : null,
        query.data.mode ? { label: "Consultation mode", value: query.data.mode } : null,
        query.data.location
          ? { label: "Location", value: query.data.location }
          : query.data.mode
            ? { label: "Location", value: query.data.mode }
            : null,
        query.data.patientName ? { label: "Patient", value: query.data.patientName } : null,
        query.data.patientGender ? { label: "Gender", value: query.data.patientGender } : null,
        query.data.patientAge !== null && query.data.patientAge !== undefined
          ? { label: "Age", value: `${query.data.patientAge} yrs` }
          : query.data.patientDateOfBirth
            ? { label: "Date of birth", value: formatDateOnly(query.data.patientDateOfBirth) }
            : null,
        query.data.patientPhone ? { label: "Phone", value: query.data.patientPhone } : null,
        query.data.patientEmail ? { label: "Email", value: query.data.patientEmail } : null,
        reason ? { label: "Reason for visit", value: reason } : null,
        query.data.complaint ? { label: "Complaint", value: query.data.complaint } : null,
        showRequestNote ? { label: "Request note", value: requestNote } : null,
        visitNote ? { label: "Visit note", value: visitNote } : null,
        query.data.diagnosis ? { label: "Diagnosis", value: query.data.diagnosis } : null,
        query.data.updatedAt
          ? { label: "Last updated", value: formatDateTime(query.data.updatedAt) }
          : null,
        prescriptionInfo?.exists !== undefined
          ? {
              label: "Prescription",
              value: prescriptionExists ? "Available" : "Not recorded yet",
            }
          : null,
      ] as { label: string; value: string }[]).filter(Boolean)
    : [];

  const hasSnapshot = detailRows.length > 0;
  const isMutating = updateMutation.isPending;

  const handleSave = () => {
    if (!appointmentId) {
      toast.error("Missing appointment id.");
      return;
    }

    setSubmitAction("save");
    updateMutation.mutate(
      {
        appointmentId,
        diagnosis,
        notes,
      },
      {
        onSuccess: () => {
          toast.success("Visit details saved.");
          setIsEditing(false);
          setSubmitAction(null);
        },
        onError: (error: Error) => {
          toast.error(error.message);
          setSubmitAction(null);
        },
      },
    );
  };

  const handleComplete = () => {
    if (!appointmentId) {
      toast.error("Missing appointment id.");
      return;
    }

    setSubmitAction("complete");
    updateMutation.mutate(
      {
        appointmentId,
        diagnosis,
        notes,
        status: "COMPLETED",
      },
      {
        onSuccess: () => {
          toast.success("Visit marked as completed.");
          setIsEditing(false);
          setSubmitAction(null);
        },
        onError: (error: Error) => {
          toast.error(error.message);
          setSubmitAction(null);
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
          <h1 className="text-2xl font-bold md:text-3xl">Appointment Details</h1>
          <p className="text-muted-foreground">
            Live appointment information for this visit.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/doctor/appointments">Back to appointments</Link>
        </Button>
      </div>

      {query.isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load appointment details</AlertTitle>
          <AlertDescription>
            {(query.error as Error).message}
            <Button variant="outline" size="sm" className="mt-3" onClick={() => void query.refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : query.data ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold">{query.data.patientName}</h2>
                <Badge className={getStatusClassName(query.data.status)}>{query.data.status}</Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {query.data.scheduledAt ? (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {formatDateTime(query.data.scheduledAt)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Not recorded yet
                  </span>
                )}
                {query.data.endAt ? (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Ends {formatDateTime(query.data.endAt)}
                  </span>
                ) : null}
                {query.data.location || query.data.mode ? (
                  <span className="flex items-center gap-1.5">
                    {query.data.canJoinOnline ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                    {query.data.location || query.data.mode}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {query.data.joinUrl ? (
                <Button asChild>
                  <a href={query.data.joinUrl} target="_blank" rel="noreferrer">
                    Join consultation
                  </a>
                </Button>
              ) : null}
              {query.data.patientId ? (
                <Button asChild variant="outline">
                  <Link to={`/doctor/patients/${query.data.patientId}`}>Open patient summary</Link>
                </Button>
              ) : null}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Visit Snapshot</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasSnapshot ? (
                    <div className="space-y-6">
                      <div className="grid gap-4 md:grid-cols-2">
                        {detailRows.map((row) => (
                          <DetailRow key={row.label} label={row.label} value={row.value} />
                        ))}
                      </div>

                      <div className="rounded-lg border bg-muted/20 p-4">
                        <p className="text-sm text-muted-foreground">Prescription</p>
                        {prescriptionExists ? (
                          prescriptionDetailsQuery.isLoading ? (
                            <div className="mt-3 space-y-2">
                              <Skeleton className="h-4 w-40" />
                              <Skeleton className="h-4 w-48" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                          ) : prescriptionDetailsQuery.isError ? (
                            <p className="mt-2 text-sm text-destructive">
                              {(prescriptionDetailsQuery.error as Error).message}
                            </p>
                          ) : prescriptionDetailsQuery.data ? (
                            <div className="mt-2 space-y-1 text-sm">
                              <p className="font-medium">
                                {prescriptionDetailsQuery.data.medicationName}
                              </p>
                              {prescriptionDetailsQuery.data.dosage ? (
                                <p>Dosage: {prescriptionDetailsQuery.data.dosage}</p>
                              ) : null}
                              {prescriptionDetailsQuery.data.frequency ? (
                                <p>Frequency: {prescriptionDetailsQuery.data.frequency}</p>
                              ) : null}
                              {prescriptionDetailsQuery.data.duration ? (
                                <p>Duration: {prescriptionDetailsQuery.data.duration}</p>
                              ) : null}
                              {prescriptionDetailsQuery.data.instructions ? (
                                <p>Instructions: {prescriptionDetailsQuery.data.instructions}</p>
                              ) : null}
                            </div>
                          ) : (
                            <p className="mt-2 text-sm text-muted-foreground">
                              Prescription details are not available yet.
                            </p>
                          )
                        ) : (
                          <p className="mt-2 text-sm text-muted-foreground">
                            No prescription recorded yet.
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Visit details have not been recorded yet.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Record Visit</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Capture diagnosis and clinical notes for this visit.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isCompleted || isMutating}
                    onClick={() => setIsEditing((current) => !current)}
                  >
                    {isEditing ? "Close" : "Record Visit"}
                  </Button>
                </CardHeader>
                <CardContent>
                  {isCompleted ? (
                    <p className="text-sm text-muted-foreground">
                      This visit is already completed. Visit details are read-only.
                    </p>
                  ) : isEditing ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="diagnosis">Diagnosis</Label>
                        <Input
                          id="diagnosis"
                          placeholder="Enter diagnosis"
                          value={diagnosis}
                          onChange={(event) => setDiagnosis(event.target.value)}
                          disabled={isMutating}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notes">Clinical notes</Label>
                        <Textarea
                          id="notes"
                          placeholder="Write clinical notes"
                          value={notes}
                          onChange={(event) => setNotes(event.target.value)}
                          disabled={isMutating}
                        />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button
                          type="button"
                          onClick={handleSave}
                          disabled={isMutating}
                        >
                          {isMutating && submitAction === "save" ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleComplete}
                          disabled={isMutating}
                        >
                          {isMutating && submitAction === "complete"
                            ? "Completing..."
                            : "Complete Visit"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click "Record Visit" to update diagnosis and clinical notes.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full" variant="outline">
                  <Link to="/doctor/appointments">Return to queue</Link>
                </Button>
              {prescriptionExists ? (
                <Button asChild className="w-full" variant="outline">
                  <Link
                    to={
                      prescriptionLatestId
                        ? `/doctor/prescriptions/${prescriptionLatestId}`
                        : "/doctor/prescriptions"
                    }
                  >
                    View prescriptions
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full"
                  variant="outline"
                  disabled={!appointmentId || prescriptionInfo?.exists !== false}
                >
                  <Link to={`/doctor/appointments/${appointmentId}/prescription/new`}>
                    Write prescription
                  </Link>
                </Button>
              )}
                <Button asChild className="w-full" variant="outline">
                  <Link to="/doctor/reviews">View reviews</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Appointment details were not returned for this record.
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default DoctorAppointmentDetails;
