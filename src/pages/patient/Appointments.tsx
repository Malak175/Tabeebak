import { useMemo, useState } from "react";
import { Calendar, Clock, MapPin, Plus, Search, User, Video } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AppointmentTimeline from "@/components/patient/AppointmentTimeline";
import { AppointmentReviewDisplay } from "@/components/reviews/AppointmentReviewDisplay";
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
import {
  appointmentStatusFilterOptions,
  appointmentWorkflowStatusOptions,
  getAppointmentStatusClassName,
  getAppointmentStatusLabel,
  getAppointmentStatusOption,
  normalizeAppointmentStatus,
} from "@/lib/appointmentStatus";
import type { Appointment } from "@/types/patient-records.types";

const formatDateTime = (value?: string | null) => formatDisplayDateTime(value);


const AppointmentCard = ({
  id,
  doctorName,
  doctorSpecialty,
  scheduledAt,
  status,
  mode,
  type,
  location,
  joinUrl,
  review,
}: Pick<
  Appointment,
  | "id"
  | "doctorName"
  | "doctorSpecialty"
  | "scheduledAt"
  | "status"
  | "mode"
  | "type"
  | "location"
  | "joinUrl"
  | "review"
>) => {
  const navigate = useNavigate();
  const hasId = Boolean(id);
  const statusOption = getAppointmentStatusOption(status);
  const StatusIcon = statusOption?.icon;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Calendar className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{doctorName}</h3>
            <Badge className={getAppointmentStatusClassName(status)}>
              {StatusIcon ? <StatusIcon className="mr-1 h-3.5 w-3.5" /> : null}
              {statusOption?.label ?? getAppointmentStatusLabel(status)}
            </Badge>
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
          <AppointmentTimeline status={status} />
          <AppointmentReviewDisplay
            appointment={{ status, review }}
            compact
            onRateVisit={
              hasId
                ? () => navigate(`/patient/appointments/${id}?openReview=true`)
                : undefined
            }
            onEditReview={
              hasId
                ? () => navigate(`/patient/appointments/${id}?openReview=true&editReview=true`)
                : undefined
            }
          />
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
      navItems={[...patientBookingNavItems]}
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

      <Card className="mb-6 overflow-hidden">
        <CardHeader className="border-b px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Filters</CardTitle>
              <p className="text-sm text-muted-foreground">Search and filter your appointments across upcoming and history.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPage(1);
                setSearch("");
                setStatus("all");
                setType("all");
              }}
            >
              All Appointments
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-6 py-5">
          <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10"
                value={search}
                onChange={(event) => {
                  setPage(1);
                  setSearch(event.target.value);
                }}
                placeholder="Search doctor, reason, location, or status"
              />
            </div>
            <Select
              value={status}
              onValueChange={(value) => {
                setPage(1);
                setStatus(value);
              }}
            >
              <SelectTrigger className="min-w-[12rem]">
                <SelectValue placeholder="Appointment status" />
              </SelectTrigger>
              <SelectContent>
                {appointmentStatusFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2 overflow-x-auto py-1">
            {appointmentWorkflowStatusOptions.map((option) => {
              const isActive = status === option.value;
              const StatusIcon = option.icon;

              return (
                <Button
                  key={option.value}
                  variant={isActive ? "secondary" : "outline"}
                  size="sm"
                  className="rounded-full px-3 py-2 text-sm font-medium transition"
                  onClick={() => {
                    setPage(1);
                    setStatus(option.value);
                  }}
                >
                  <StatusIcon className="mr-1 h-4 w-4" />
                  {option.label}
                </Button>
              );
            })}

            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-3 py-2 text-sm text-muted-foreground hover:bg-muted/80"
              onClick={() => {
                setPage(1);
                setSearch("");
                setStatus("all");
                setType("all");
              }}
            >
              Reset filters
            </Button>
          </div>
        </CardContent>
      </Card>

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
