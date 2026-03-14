import { format, isValid, parseISO } from "date-fns";
import { Calendar, Clock, FileText, MapPin, Stethoscope, User, Video } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { doctorNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctorAppointmentDetailsQuery } from "@/hooks/useDoctorWorkflow";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";

const formatDateTime = (value?: string | null) => {
  if (!value) return "Not available";

  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;

  return format(parsed, "PPP p");
};

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

const DetailRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="rounded-lg border bg-muted/20 p-4">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="mt-1 font-medium">{value || "Not available"}</p>
  </div>
);

const DoctorAppointmentDetails = () => {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const query = useDoctorAppointmentDetailsQuery(appointmentId, Boolean(user));
  const userName = getDisplayName(user ?? {});

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
            Live appointment information from the doctor workflow endpoint.
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
          <Card>
            <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold">{query.data.patientName}</h2>
                  <Badge className={getStatusClassName(query.data.status)}>{query.data.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {formatDateTime(query.data.scheduledAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Ends {formatDateTime(query.data.endAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {query.data.canJoinOnline ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                    {query.data.location || query.data.mode || "Location pending"}
                  </span>
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
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Visit Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <DetailRow label="Appointment number" value={query.data.appointmentNumber} />
                <DetailRow label="Visit type" value={query.data.type} />
                <DetailRow label="Consultation mode" value={query.data.mode} />
                <DetailRow
                  label="Patient demographics"
                  value={[query.data.patientAge ? `${query.data.patientAge} yrs` : null, query.data.patientGender]
                    .filter(Boolean)
                    .join(" - ")}
                />
                <DetailRow label="Reason" value={query.data.reason} />
                <DetailRow label="Complaint" value={query.data.complaint} />
                <DetailRow label="Diagnosis" value={query.data.diagnosis} />
                <DetailRow label="Updated at" value={formatDateTime(query.data.updatedAt)} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full" variant="outline">
                  <Link to="/doctor/appointments">Return to queue</Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/doctor/prescriptions">View prescriptions</Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/doctor/reviews">View reviews</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Clinical Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {query.data.notes || "No notes were returned for this appointment yet."}
              </p>
            </CardContent>
          </Card>
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
