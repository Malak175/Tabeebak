import { useMemo, useState } from "react";
import { Calendar, Clock, MapPin, Plus, User, Video } from "lucide-react";
import { Link } from "react-router-dom";
import AppointmentTimeline from "@/components/patient/AppointmentTimeline";
import { patientBookingNavItems } from "@/components/patient/patientNavigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  usePatientAppointmentsQuery,
  useUpcomingPatientAppointmentsQuery,
} from "@/hooks/usePatientProfile";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import { formatDisplayDateTime } from "@/lib/date-time";
import { formatApiStatusLabel, normalizeApiStatusKey } from "@/lib/apiStatus";

const formatDateTime = (value?: string | null) => formatDisplayDateTime(value);

const getStatusClassName = (status?: string | null) => {
  switch (normalizeApiStatusKey(status)) {
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

const AppointmentCard = ({
  id,
  doctorName,
  doctorSpecialty,
  scheduledAt,
  status,
  mode,
  type,
  requestStatus,
  location,
  joinUrl,
}: {
  id: string;
  doctorName: string;
  doctorSpecialty?: string | null;
  scheduledAt?: string | null;
  status: string;
  mode?: string | null;
  type?: string | null;
  requestStatus?: string | null;
  location?: string | null;
  joinUrl?: string | null;
}) => {
  const hasId = Boolean(id);

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{doctorName}</h3>
            <Badge className={getStatusClassName(status)}>{formatApiStatusLabel(status)}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {doctorSpecialty || "Specialty not available"}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatDateTime(scheduledAt)}
            </span>
            <span className="flex items-center gap-1.5">
              {mode?.toLowerCase().includes("video") || type?.toLowerCase().includes("video") ? (
                <Video className="h-4 w-4" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              {location || mode || type || "Location pending"}
            </span>
          </div>
          <AppointmentTimeline appointmentStatus={status} requestStatus={requestStatus} />
        </div>
        <div className="flex flex-wrap gap-2">
          {joinUrl ? (
            <Button asChild variant="outline">
              <a href={joinUrl} target="_blank" rel="noreferrer">
                Join
              </a>
            </Button>
          ) : null}
          {hasId ? (
            <Button asChild variant="outline">
              <Link to={`/patient/appointments/${id}`}>View details</Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Details unavailable
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AppointmentCardSkeleton = () => (
  <Card>
    <CardContent className="space-y-3 p-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-4 w-48" />
    </CardContent>
  </Card>
);

const PatientAppointments = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");

  const filters = useMemo(
    () => ({
      page,
      limit: 6,
      search,
      status: status === "all" ? undefined : status,
      type: type === "all" ? undefined : type,
      sortBy: "scheduledAt",
      sortOrder: "desc" as const,
    }),
    [page, search, status, type],
  );

  const enabled = Boolean(user);
  const appointmentsQuery = usePatientAppointmentsQuery(filters, enabled);
  const upcomingQuery = useUpcomingPatientAppointmentsQuery(enabled);
  const userName = getDisplayName(user ?? {});

  return (
    <DashboardLayout
      userRole="patient"
      userName={userName}
      navItems={patientBookingNavItems}
      userIcon={User}
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">My Appointments</h1>
          <p className="text-muted-foreground">
            Your upcoming visits and appointment history appear here.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/patient/book">
            <Plus className="h-4 w-4" />
            Start Request
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="history">All Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingQuery.isLoading ? (
            <>
              <AppointmentCardSkeleton />
              <AppointmentCardSkeleton />
            </>
          ) : upcomingQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load upcoming appointments</AlertTitle>
              <AlertDescription>{(upcomingQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : upcomingQuery.data?.length ? (
            upcomingQuery.data.map((appointment) => (
              <AppointmentCard key={appointment.id} {...appointment} />
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                You do not have any upcoming appointments yet.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <Input
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
                placeholder="Search doctor or reason"
              />
              <Select
                value={status}
                onValueChange={(value) => {
                  setPage(1);
                  setStatus(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={type}
                onValueChange={(value) => {
                  setPage(1);
                  setType(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Visit type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="in-person">In Person</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setPage(1);
                  setSearch("");
                  setStatus("all");
                  setType("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>

          {appointmentsQuery.isLoading ? (
            <>
              <AppointmentCardSkeleton />
              <AppointmentCardSkeleton />
              <AppointmentCardSkeleton />
            </>
          ) : appointmentsQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load appointment history</AlertTitle>
              <AlertDescription>{(appointmentsQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : appointmentsQuery.data?.data.length ? (
            <>
              <div className="space-y-4">
                {appointmentsQuery.data.data.map((appointment) => (
                  <AppointmentCard key={appointment.id} {...appointment} />
                ))}
              </div>

              <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {appointmentsQuery.data.page} of {appointmentsQuery.data.totalPages} with{" "}
                  {appointmentsQuery.data.total} total appointments
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!appointmentsQuery.data.hasPreviousPage}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!appointmentsQuery.data.hasNextPage}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No appointments matched your current filters.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default PatientAppointments;
