import { useMemo, useState } from "react";
import { formatDisplayDate, formatDisplayDateTime } from "@/lib/date-time";
import { Calendar, Clock, MapPin, Search, Stethoscope, UserRound, Video } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { doctorNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDoctorAppointmentsQuery,
  useDoctorTodayAppointmentsQuery,
} from "@/hooks/useDoctorWorkflow";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import {
  appointmentStatusFilterOptions,
  appointmentWorkflowStatusOptions,
  getAppointmentStatusClassName,
  getAppointmentStatusLabel,
  getAppointmentStatusOption,
  normalizeAppointmentStatus,
} from "@/lib/appointmentStatus";
import { DoctorAppointment } from "@/types/doctor-workflow.types";

const formatDateTime = (value?: string | null, dateOnly = false) => {
  if (dateOnly) return formatDisplayDate(value);
  return formatDisplayDateTime(value);
};


const AppointmentCard = ({
  appointment,
  queueNumber,
}: {
  appointment: DoctorAppointment;
  queueNumber?: number;
}) => {
  const hasAppointmentId = Boolean(appointment.id?.trim());
  const statusOption = getAppointmentStatusOption(appointment.status);
  const StatusIcon = statusOption?.icon;

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4 lg:w-60">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {queueNumber ? <span className="font-semibold">{queueNumber}</span> : <Calendar className="h-5 w-5" />}
          </div>
          <div>
            <p className="font-semibold">{appointment.patientName}</p>
            <p className="text-sm text-muted-foreground">
              {[appointment.patientAge ? `${appointment.patientAge} yrs` : null, appointment.patientGender]
                .filter(Boolean)
                .join(" - ") || "Patient details pending"}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={getAppointmentStatusClassName(appointment.status)}>
              {StatusIcon ? <StatusIcon className="mr-1 h-3.5 w-3.5" /> : null}
              {statusOption?.label ?? getAppointmentStatusLabel(appointment.status)}
            </Badge>
            {appointment.type ? <Badge variant="outline">{appointment.type}</Badge> : null}
            {appointment.mode ? <Badge variant="outline">{appointment.mode}</Badge> : null}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatDateTime(appointment.scheduledAt)}
            </span>
            <span className="flex items-center gap-1.5">
              {appointment.canJoinOnline ? <Video className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
              {appointment.location || appointment.mode || "Location pending"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {appointment.reason || appointment.complaint || "No visit reason was returned for this appointment."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {appointment.joinUrl ? (
            <Button asChild variant="outline">
              <a href={appointment.joinUrl} target="_blank" rel="noreferrer">
                Join
              </a>
            </Button>
          ) : null}
          {hasAppointmentId ? (
            <Button asChild variant="outline">
              <Link to={`/doctor/appointments/${appointment.id}`}>View details</Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled
              onClick={() => {
                console.warn("Doctor appointment is missing an id; details view is disabled.", {
                  appointment,
                });
              }}
            >
              View details
            </Button>
          )}
          {appointment.patientId ? (
            <Button asChild>
              <Link to={`/doctor/patients/${appointment.patientId}`}>Patient summary</Link>
            </Button>
          ) : null}
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

const DoctorAppointments = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const userName = getDisplayName(user ?? {});

  const allFilters = useMemo(
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

  const todayFilters = useMemo(
    () => ({
      page: 1,
      limit: 20,
      search,
      status: status === "all" ? undefined : status,
      type: type === "all" ? undefined : type,
      sortBy: "scheduledAt",
      sortOrder: "asc" as const,
    }),
    [search, status, type],
  );

  const enabled = Boolean(user);
  const appointmentsQuery = useDoctorAppointmentsQuery(allFilters, enabled);
  const todayQuery = useDoctorTodayAppointmentsQuery(todayFilters, enabled);

  return (
    <DashboardLayout
      userRole="doctor"
      userName={userName}
      userSubtitle="Doctor account"
      navItems={doctorNavItems}
      userIcon={Stethoscope}
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your live appointment queue and appointment history.
          </p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">
          Today: {formatDateTime(new Date().toISOString(), true)}
        </div>
      </div>

      <Card className="mb-6 overflow-hidden">
        <CardHeader className="border-b px-6 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">Filters</CardTitle>
              <p className="text-sm text-muted-foreground">Search and filter appointments by status.</p>
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
                placeholder="Search patient, reason, location, or status"
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

      <Tabs defaultValue="today" className="space-y-6">
        <TabsList>
          <TabsTrigger value="today">Today&apos;s Queue</TabsTrigger>
          <TabsTrigger value="all">All Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          {todayQuery.isLoading ? (
            <>
              <AppointmentCardSkeleton />
              <AppointmentCardSkeleton />
            </>
          ) : todayQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load today&apos;s queue</AlertTitle>
              <AlertDescription>{(todayQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : todayQuery.data?.data.length ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">Today&apos;s total</p>
                    <p className="mt-2 text-3xl font-bold">{todayQuery.data.total}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">Ready to see</p>
                    <p className="mt-2 text-3xl font-bold">
                      {
                        todayQuery.data.data.filter((item) =>
                          ["APPROVED", "SCHEDULED", "IN_PROGRESS"].includes(
                            normalizeAppointmentStatus(item.status),
                          ),
                        ).length
                      }
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="mt-2 text-3xl font-bold">
                      {
                        todayQuery.data.data.filter(
                          (item) => normalizeAppointmentStatus(item.status) === "COMPLETED",
                        ).length
                      }
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {todayQuery.data.data.map((appointment, index) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    queueNumber={index + 1}
                  />
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-8 text-center text-muted-foreground">
                <UserRound className="h-10 w-10" />
                <p>No appointments matched today&apos;s queue filters.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-6">
          {appointmentsQuery.isLoading ? (
            <>
              <AppointmentCardSkeleton />
              <AppointmentCardSkeleton />
              <AppointmentCardSkeleton />
            </>
          ) : appointmentsQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load appointments</AlertTitle>
              <AlertDescription>{(appointmentsQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : appointmentsQuery.data?.data.length ? (
            <>
              <div className="space-y-4">
                {appointmentsQuery.data.data.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
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

export default DoctorAppointments;
