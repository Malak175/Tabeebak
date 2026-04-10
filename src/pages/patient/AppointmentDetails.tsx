import { format, isValid, parseISO } from "date-fns";
import { ArrowLeft, Calendar, Clock, MapPin, User, Video } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { patientNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientAppointmentDetailsQuery } from "@/hooks/usePatientProfile";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";

const formatDateTime = (value?: string | null) => {
  if (!value) return "Not available";

  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;

  return format(parsed, "PPP p");
};

const statusClassName = (status?: string | null) => {
  switch ((status ?? "").toLowerCase()) {
    case "confirmed":
    case "completed":
      return "bg-green-100 text-green-700 border-green-200";
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
                <Badge className={statusClassName(query.data.status)}>{query.data.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  {query.data.mode?.toLowerCase().includes("video") ? (
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
                <DetailRow label="Reference" value={query.data.appointmentNumber} />
                <DetailRow label="Created At" value={formatDateTime(query.data.createdAt)} />
                <DetailRow label="Updated At" value={formatDateTime(query.data.updatedAt)} />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
};

export default PatientAppointmentDetails;
