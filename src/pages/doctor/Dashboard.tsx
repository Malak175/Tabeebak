import { Link } from "react-router-dom";
import {
  Activity,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  Home,
  Settings,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctorDashboardSummaryQuery } from "@/hooks/useDoctorProfile";
import { getDisplayName } from "@/lib/auth";

const navItems = [
  { title: "Dashboard", url: "/doctor/dashboard", icon: Home },
  { title: "Appointments", url: "/doctor/appointments", icon: Calendar },
  { title: "Patients", url: "/doctor/patients", icon: Users },
  { title: "Schedule", url: "/doctor/schedule", icon: Clock },
  { title: "Settings", url: "/doctor/settings", icon: Settings },
  { title: "Help", url: "/doctor/help", icon: HelpCircle },
];

const statCards = (summary: ReturnType<typeof useDoctorDashboardSummaryQuery>["data"]) => [
  {
    label: "Today's Appointments",
    value: summary?.totalAppointmentsToday ?? 0,
    icon: Calendar,
    description: "Appointments scheduled for today",
  },
  {
    label: "Completed Today",
    value: summary?.completedAppointmentsToday ?? 0,
    icon: Activity,
    description: "Visits already completed",
  },
  {
    label: "Upcoming Today",
    value: summary?.upcomingAppointmentsToday ?? 0,
    icon: Clock,
    description: "Still coming up today",
  },
  {
    label: "Total Patients",
    value: summary?.totalPatientsCount ?? 0,
    icon: Users,
    description: "Patients attached to your account",
  },
];

const DoctorDashboard = () => {
  const summaryQuery = useDoctorDashboardSummaryQuery();
  const summary = summaryQuery.data;
  const doctorName = getDisplayName(summary ?? {});
  const userSubtitle = summary?.specialty ?? "Doctor account";
  const firstName = summary?.firstName ?? doctorName.split(" ")[0] ?? "Doctor";

  return (
    <DashboardLayout
      userRole="doctor"
      userName={doctorName}
      userSubtitle={userSubtitle}
      navItems={navItems}
      userIcon={Stethoscope}
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Welcome back, Dr. {firstName}</h1>
          <p className="text-muted-foreground">
            Live dashboard data is now loaded from `/api/v1/doctors/me/dashboard-summary`.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {summary?.rating != null && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{summary.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">rating</span>
            </div>
          )}
          {summary?.yearsOfExperience != null && (
            <Badge variant="secondary">{summary.yearsOfExperience} years exp</Badge>
          )}
          {summary?.clinicName && <Badge variant="outline">{summary.clinicName}</Badge>}
        </div>
      </div>

      {summaryQuery.isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-64 w-full lg:col-span-2" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      ) : summaryQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load dashboard summary</AlertTitle>
          <AlertDescription>
            {(summaryQuery.error as Error).message}
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void summaryQuery.refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards(summary).map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm font-medium">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>Doctor Snapshot</CardTitle>
                  <CardDescription>
                    Core profile and scheduling indicators from the backend.
                  </CardDescription>
                </div>
                <Link
                  to="/doctor/settings"
                  className="text-sm text-primary hover:underline"
                >
                  Edit profile
                </Link>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Specialty</p>
                  <p className="text-lg font-semibold">
                    {summary?.specialty ?? "Not added yet"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {summary?.subspecialty ?? "No subspecialty provided"}
                  </p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-lg font-semibold">
                    {summary?.pendingAppointmentRequestsCount ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Appointment requests waiting for review
                  </p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Next Available Slot</p>
                  <p className="text-lg font-semibold">
                    {summary?.nextAvailableSlot ?? "Not available"}
                  </p>
                </div>
                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">Profile Completion</p>
                  <p className="text-lg font-semibold">
                    {summary?.profileCompletionPercentage ?? 0}%
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-secondary/10 to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Connected Areas
                  </CardTitle>
                  <CardDescription>
                    These routes are now using live doctor profile APIs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-lg bg-background/70 p-3">
                    Dashboard summary uses the doctor summary endpoint.
                  </div>
                  <div className="rounded-lg bg-background/70 p-3">
                    Settings loads personal and professional profile data.
                  </div>
                  <div className="rounded-lg bg-background/70 p-3">
                    Schedule is backed by doctor availability.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                  <CardDescription>
                    The detailed appointment and patient widgets still need their own backend
                    endpoints in later phases.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link
                    to="/doctor/schedule"
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40"
                  >
                    <span className="font-medium">Manage availability</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/doctor/settings"
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40"
                  >
                    <span className="font-medium">Complete profile details</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default DoctorDashboard;
