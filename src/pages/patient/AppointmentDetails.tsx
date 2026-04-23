import { ArrowLeft, Calendar, Clock, MapPin, User, Video } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AppointmentTimeline from "@/components/patient/AppointmentTimeline";
import { patientNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientAppointmentDetailsQuery } from "@/hooks/usePatientProfile";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import { formatDisplayDateTime } from "@/lib/date-time";
import { formatApiStatusLabel, normalizeApiStatusKey } from "@/lib/apiStatus";

const formatDateTime = (value?: string | null) => formatDisplayDateTime(value);

const statusClassName = (status?: string | null) => {
  switch (normalizeApiStatusKey(status)) {
    case "APPROVED":
    case "CONFIRMED":
    case "COMPLETED":
      return "bg-green-100 text-green-700 border-green-200";
    case "PENDING":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "CANCELLED":
    case "CANCELED":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getOutcomeExpectation = (status?: string | null) => {
  const normalized = normalizeApiStatusKey(status);
  if (["CANCELLED", "CANCELED"].includes(normalized)) {
    return {
      kind: "cancelled",
      label: "Visit cancelled",
      message: "This appointment was cancelled, so outcomes are not expected.",
      emptyMessage: "Outcomes are not expected for a cancelled visit.",
    };
  }
  if (["NO_SHOW"].includes(normalized)) {
    return {
      kind: "no_show",
      label: "Visit not attended",
      message: "This appointment was marked as no-show, so outcomes are not expected.",
      emptyMessage: "Outcomes are not expected when a visit is marked as no-show.",
    };
  }
  if (["SCHEDULED", "PENDING", "CONFIRMED", "BOOKED", "UPCOMING"].includes(normalized)) {
    return {
      kind: "upcoming",
      label: "Upcoming visit",
      message: "This visit has not happened yet. Outcomes will appear after the appointment is completed.",
      emptyMessage: "Outcomes will appear after this appointment is completed.",
    };
  }
  if (["COMPLETED", "FINISHED", "DONE"].includes(normalized)) {
    return {
      kind: "completed",
      label: "Visit completed",
      message: "Outcomes from this visit appear below once posted by the provider.",
      emptyMessage: "No outcomes have been posted for this visit yet.",
    };
  }
  return {
    kind: "unknown",
    label: "Visit status",
    message: "Outcomes appear after the appointment is completed.",
    emptyMessage: "Outcomes will appear here once available.",
  };
};

const DetailRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="rounded-lg border p-4">
    <p className="mb-1 text-sm font-medium">{label}</p>
    <p className="text-sm text-muted-foreground">{value || "Not available"}</p>
  </div>
);

const PatientAppointmentDetails = () => {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const query = usePatientAppointmentDetailsQuery(appointmentId, Boolean(user));
  const userName = getDisplayName(user ?? {});
  const prescriptions = query.data?.prescriptions ?? [];
  const prescriptionSummary = query.data?.prescription ?? null;
  const labOrders = query.data?.labOrders ?? [];
  const labResults = query.data?.labResults ?? [];
  const hasOutcomePrescriptions = prescriptions.length > 0 || prescriptionSummary?.exists === true;
  const hasOutcomes = hasOutcomePrescriptions;
  const outcomeExpectation = getOutcomeExpectation(query.data?.status);

  return (
    <DashboardLayout
      userRole="patient"
      userName={userName}
      navItems={patientNavItems}
      userIcon={User}
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button asChild variant="ghost" className="-ml-4 mb-2">
            <Link to="/patient/appointments">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to appointments
            </Link>
          </Button>
          <h1 className="text-2xl font-bold md:text-3xl">Appointment Details</h1>
          <p className="text-muted-foreground">
            Appointment details are shown for this visit.
          </p>
        </div>
      </div>

      {query.isLoading ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      ) : query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load appointment details</AlertTitle>
          <AlertDescription>{(query.error as Error).message}</AlertDescription>
        </Alert>
      ) : query.data ? (
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle>{query.data.doctorName}</CardTitle>
                <Badge className={statusClassName(query.data.status)}>
                  {formatApiStatusLabel(query.data.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <AppointmentTimeline
                status={query.data.status}
              />
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDateTime(query.data.scheduledAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {query.data.type || query.data.mode || "Appointment"}
                </span>
                <span className="flex items-center gap-1.5">
                  {(query.data.mode ?? "").toLowerCase().includes("video") ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  {query.data.location || "Location pending"}
                </span>
              </div>
              <DetailRow label="Doctor Specialty" value={query.data.doctorSpecialty} />
              <DetailRow label="Reason" value={query.data.reason} />
              <DetailRow label="Notes" value={query.data.notes} />
              {query.data.joinUrl ? (
                <Button asChild variant="outline">
                  <a href={query.data.joinUrl} target="_blank" rel="noreferrer">
                    Open visit link
                  </a>
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Appointment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow label="Appointment ID" value={query.data.id} />
                <DetailRow label="Reference" value={query.data.reference ?? query.data.appointmentNumber} />
                <DetailRow label="Created At" value={formatDateTime(query.data.createdAt)} />
                <DetailRow label="Updated At" value={formatDateTime(query.data.updatedAt)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Consultation Outcomes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="rounded-lg border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {outcomeExpectation.label}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{outcomeExpectation.message}</p>
                </div>
                {hasOutcomes ? (
                  <div className="space-y-4">
                    {prescriptions.length ? (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Prescriptions
                        </p>
                        <div className="mt-2 space-y-2">
                          {prescriptions.map((prescription) => (
                            <div
                              key={prescription.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                            >
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {prescription.medicationName}
                                </p>
                                <p className="text-xs text-muted-foreground">{prescription.status}</p>
                              </div>
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/patient/prescriptions/${prescription.id}`}>View</Link>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : prescriptionSummary?.exists ? (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Prescriptions
                        </p>
                        <div className="mt-2 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2">
                            <div>
                              <p className="text-sm font-medium text-foreground">Prescription recorded</p>
                              <p className="text-xs text-muted-foreground">
                                This appointment has a linked prescription.
                              </p>
                            </div>
                            {prescriptionSummary.latestId ? (
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/patient/prescriptions/${prescriptionSummary.latestId}`}>View</Link>
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {labResults.length ? (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Lab results</p>
                        <div className="mt-2 space-y-2">
                          {labResults.map((result) => (
                            <div
                              key={result.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                            >
                              <div>
                                <p className="text-sm font-medium text-foreground">{result.testName}</p>
                                <p className="text-xs text-muted-foreground">{result.status}</p>
                              </div>
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/patient/lab-results/${result.id}`}>View</Link>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {labOrders.length ? (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Lab orders</p>
                        <div className="mt-2 space-y-2">
                          {labOrders.map((order) => (
                            <div key={order.id} className="rounded-lg border px-3 py-2">
                              <p className="text-sm font-medium text-foreground">{order.testName}</p>
                              <p className="text-xs text-muted-foreground">{order.status}</p>
                            </div>
                          ))}
                          {!labResults.length ? (
                            <p className="text-xs text-muted-foreground">
                              Results will appear here once the lab completes the order.
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{outcomeExpectation.emptyMessage}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
};

export default PatientAppointmentDetails;
