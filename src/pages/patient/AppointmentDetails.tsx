import { Link, useParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { usePatientAppointmentDetailsQuery } from "@/hooks/usePatientRecords";
import { patientNavItems } from "@/pages/patient/navigation";
import {
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  Video,
} from "lucide-react";

const formatDateTime = (value?: string, fallback?: string) => {
  const raw = value ?? fallback;
  if (!raw) return "Not scheduled";
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? raw : parsed.toLocaleString();
};

const getStatusColor = (status?: string) => {
  switch ((status ?? "").toLowerCase()) {
    case "confirmed":
    case "completed":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const PatientAppointmentDetails = () => {
  const { user } = useAuth();
  const { appointmentId } = useParams();
  const appointmentQuery = usePatientAppointmentDetailsQuery(appointmentId);

  return (
    <DashboardLayout
      userRole="patient"
      userName={user?.name ?? "Patient"}
      navItems={patientNavItems}
      userIcon={User}
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Appointment Details</h1>
          <p className="text-muted-foreground">
            Review the selected appointment from your records.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/patient/appointments">Back to appointments</Link>
        </Button>
      </div>

      {!appointmentId ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid appointment</AlertTitle>
          <AlertDescription>The appointment identifier is missing.</AlertDescription>
        </Alert>
      ) : appointmentQuery.isLoading ? (
        <Skeleton className="h-80 w-full" />
      ) : appointmentQuery.isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Appointment unavailable</AlertTitle>
          <AlertDescription>{appointmentQuery.error.message}</AlertDescription>
        </Alert>
      ) : appointmentQuery.data ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-3">
              <CardTitle className="text-xl">
                {appointmentQuery.data.doctorName ?? "Assigned doctor"}
              </CardTitle>
              <Badge className={getStatusColor(appointmentQuery.data.status)}>
                {appointmentQuery.data.status ?? "scheduled"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-muted/50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(
                    appointmentQuery.data.scheduledAt,
                    appointmentQuery.data.date,
                  )}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  {(appointmentQuery.data.type ?? "").toLowerCase().includes("video") ? (
                    <Video className="h-4 w-4" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  Visit Type
                </div>
                <p className="text-sm text-muted-foreground">
                  {appointmentQuery.data.type ?? "Type unavailable"}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Time
                </div>
                <p className="text-sm text-muted-foreground">
                  {appointmentQuery.data.time ?? "Time unavailable"}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4" />
                  Location
                </div>
                <p className="text-sm text-muted-foreground">
                  {appointmentQuery.data.location ?? "Location unavailable"}
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <h2 className="mb-2 font-medium">Specialty</h2>
              <p className="text-sm text-muted-foreground">
                {appointmentQuery.data.specialty ?? "Specialty unavailable"}
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <h2 className="mb-2 font-medium">Reason</h2>
              <p className="text-sm text-muted-foreground">
                {appointmentQuery.data.reason ?? "No visit reason was provided."}
              </p>
            </div>
            <div className="rounded-xl bg-muted/50 p-4">
              <h2 className="mb-2 font-medium">Notes</h2>
              <p className="text-sm text-muted-foreground">
                {appointmentQuery.data.notes ?? "No appointment notes are available."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </DashboardLayout>
  );
};

export default PatientAppointmentDetails;
