import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  usePatientAppointmentsQuery,
  useUpcomingPatientAppointmentsQuery,
} from "@/hooks/usePatientRecords";
import { patientNavItems } from "@/pages/patient/navigation";
import type { Appointment } from "@/types/patient-records.types";
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Video,
} from "lucide-react";

const toPageNumber = (value: string | null, fallback = 1) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

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

const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
  const doctorInitials =
    appointment.doctorName
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") ?? "DR";

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            {doctorInitials}
          </div>
          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold">
                {appointment.doctorName ?? "Assigned doctor"}
              </h3>
              <Badge className={getStatusColor(appointment.status)}>
                {appointment.status ?? "scheduled"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {appointment.specialty ?? "Specialty unavailable"}
            </p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{formatDateTime(appointment.scheduledAt, appointment.date)}</span>
              </div>
              {appointment.time && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>{appointment.time}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                {(appointment.type ?? "").toLowerCase().includes("video") ? (
                  <Video className="h-4 w-4" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
                <span>{appointment.location ?? appointment.type ?? "Location pending"}</span>
              </div>
            </div>
            {appointment.reason && (
              <p className="mt-3 text-sm text-muted-foreground">{appointment.reason}</p>
            )}
          </div>
          <Button asChild variant="outline">
            <Link to={`/patient/appointments/${appointment.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const PatientAppointments = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") === "upcoming" ? "upcoming" : "all";
  const filters = useMemo(
    () => ({
      page: toPageNumber(searchParams.get("page")),
      limit: toPageNumber(searchParams.get("limit"), 10),
      search: searchParams.get("search") ?? undefined,
      status: activeTab === "all" ? searchParams.get("status") ?? undefined : undefined,
      type: searchParams.get("type") ?? undefined,
      fromDate: searchParams.get("fromDate") ?? undefined,
      toDate: searchParams.get("toDate") ?? undefined,
    }),
    [activeTab, searchParams],
  );
  const appointmentsQuery = usePatientAppointmentsQuery(filters);
  const upcomingAppointmentsQuery = useUpcomingPatientAppointmentsQuery(filters);
  const activeQuery =
    activeTab === "upcoming" ? upcomingAppointmentsQuery : appointmentsQuery;

  const updateSearchParam = (name: string, value?: string) => {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }

    if (name !== "page") {
      next.set("page", "1");
    }

    setSearchParams(next);
  };

  return (
    <DashboardLayout
      userRole="patient"
      userName={user?.name ?? "Patient"}
      navItems={patientNavItems}
      userIcon={User}
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">My Appointments</h1>
          <p className="text-muted-foreground">
            View backend-sourced appointment history and upcoming visits.
          </p>
        </div>
        <Button asChild>
          <Link to="/doctors">Book Appointment</Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Input
            placeholder="Search doctor or reason"
            value={searchParams.get("search") ?? ""}
            onChange={(event) => updateSearchParam("search", event.target.value)}
          />
          <Select
            value={searchParams.get("status") ?? "all"}
            onValueChange={(value) =>
              updateSearchParam("status", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={searchParams.get("type") ?? "all"}
            onValueChange={(value) =>
              updateSearchParam("type", value === "all" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="in-person">In person</SelectItem>
              <SelectItem value="video">Video</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={searchParams.get("fromDate") ?? ""}
            onChange={(event) => updateSearchParam("fromDate", event.target.value)}
          />
          <Input
            type="date"
            value={searchParams.get("toDate") ?? ""}
            onChange={(event) => updateSearchParam("toDate", event.target.value)}
          />
        </CardContent>
      </Card>

      <Tabs
        className="space-y-6"
        onValueChange={(value) => updateSearchParam("tab", value)}
        value={activeTab}
      >
        <TabsList>
          <TabsTrigger value="all">All Appointments</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {appointmentsQuery.isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton className="h-36 w-full" key={index} />
            ))
          ) : appointmentsQuery.isError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Appointments unavailable</AlertTitle>
              <AlertDescription>{appointmentsQuery.error.message}</AlertDescription>
            </Alert>
          ) : (appointmentsQuery.data?.items ?? []).length ? (
            appointmentsQuery.data?.items.map((appointment) => (
              <AppointmentCard appointment={appointment} key={appointment.id} />
            ))
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No appointments found</AlertTitle>
              <AlertDescription>
                Try changing the active filters or book a new appointment.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointmentsQuery.isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton className="h-36 w-full" key={index} />
            ))
          ) : upcomingAppointmentsQuery.isError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Upcoming appointments unavailable</AlertTitle>
              <AlertDescription>{upcomingAppointmentsQuery.error.message}</AlertDescription>
            </Alert>
          ) : (upcomingAppointmentsQuery.data?.items ?? []).length ? (
            upcomingAppointmentsQuery.data?.items.map((appointment) => (
              <AppointmentCard appointment={appointment} key={appointment.id} />
            ))
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No upcoming appointments</AlertTitle>
              <AlertDescription>
                Upcoming appointments will appear here as soon as they are scheduled.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border bg-card p-4 md:flex-row md:items-center">
        <p className="text-sm text-muted-foreground">
          Showing page {activeQuery.data?.page ?? 1} of {activeQuery.data?.totalPages ?? 1} with{" "}
          {activeQuery.data?.total ?? 0} total appointments.
        </p>
        <div className="flex gap-2">
          <Button
            disabled={!activeQuery.data?.hasPreviousPage}
            onClick={() =>
              updateSearchParam("page", String((activeQuery.data?.page ?? 1) - 1))
            }
            variant="outline"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            disabled={!activeQuery.data?.hasNextPage}
            onClick={() =>
              updateSearchParam("page", String((activeQuery.data?.page ?? 1) + 1))
            }
            variant="outline"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientAppointments;
