import { Link } from "react-router-dom";
import {
  Activity,
  Calendar,
  ChevronRight,
  Clock,
  MessageSquareQuote,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { doctorNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctorProfileQuery, useDoctorDashboardSummaryQuery } from "@/hooks/useDoctorProfile";
import {
  useDoctorReviewsSummaryQuery,
  useDoctorTodayAppointmentsQuery,
} from "@/hooks/useDoctorWorkflow";
import { getDisplayName } from "@/lib/auth";

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
  const profileQuery = useDoctorProfileQuery();
  const todayQuery = useDoctorTodayAppointmentsQuery(
    {
      page: 1,
      limit: 3,
      sortBy: "scheduledAt",
      sortOrder: "asc",
    },
    true,
  );
  const reviewsSummaryQuery = useDoctorReviewsSummaryQuery(true);
  const summary = summaryQuery.data;
  const doctorName = getDisplayName(profileQuery.data ?? summary ?? {});
  const userSubtitle = summary?.specialty ?? "Doctor account";
  const firstName =
    profileQuery.data?.firstName ??
    summary?.firstName ??
    doctorName.replace(/^Dr\.?\s*/i, "").split(" ")[0] ??
    "Doctor";

  return (
    <DashboardLayout
      userRole="doctor"
      userName={doctorName}
      userSubtitle={userSubtitle}
      navItems={doctorNavItems}
      userIcon={Stethoscope}
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Welcome back, Dr. {firstName}</h1>
          <p className="text-muted-foreground">
            Your appointments, patients, prescriptions, and reviews are now backed by doctor workflow APIs.
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
                  <CardTitle>Today&apos;s Queue</CardTitle>
                  <CardDescription>
                    Previewing the first live appointments from `/api/v1/doctors/me/appointments/today`.
                  </CardDescription>
                </div>
                <Link to="/doctor/appointments" className="text-sm text-primary hover:underline">
                  Open queue
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {todayQuery.isLoading ? (
                  <>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </>
                ) : todayQuery.isError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Unable to load today&apos;s queue</AlertTitle>
                    <AlertDescription>{(todayQuery.error as Error).message}</AlertDescription>
                  </Alert>
                ) : todayQuery.data?.data.length ? (
                  todayQuery.data.data.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <p className="font-semibold">{appointment.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.reason || appointment.complaint || "No visit reason returned"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{appointment.status}</Badge>
                        <Link to={`/doctor/appointments/${appointment.id}`} className="text-sm text-primary hover:underline">
                          View details
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
                    No appointments were returned for today&apos;s queue.
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-secondary/10 to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquareQuote className="h-5 w-5" />
                    Reviews Snapshot
                  </CardTitle>
                  <CardDescription>
                    Live ratings summary from the doctor reviews endpoints.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {reviewsSummaryQuery.isLoading ? (
                    <>
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </>
                  ) : reviewsSummaryQuery.isError ? (
                    <p className="text-destructive">
                      {(reviewsSummaryQuery.error as Error).message}
                    </p>
                  ) : (
                    <>
                      <div className="rounded-lg bg-background/70 p-3">
                        Average rating: {reviewsSummaryQuery.data?.averageRating.toFixed(1) ?? "0.0"}
                      </div>
                      <div className="rounded-lg bg-background/70 p-3">
                        Total reviews: {reviewsSummaryQuery.data?.totalReviews ?? 0}
                      </div>
                      <div className="rounded-lg bg-background/70 p-3">
                        Recommendation rate:{" "}
                        {reviewsSummaryQuery.data?.recommendationRate != null
                          ? `${reviewsSummaryQuery.data.recommendationRate}%`
                          : "N/A"}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                  <CardDescription>
                    Jump directly into the new live doctor workflow pages.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link
                    to="/doctor/patients"
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40"
                  >
                    <span className="font-medium">Patients</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/doctor/prescriptions"
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40"
                  >
                    <span className="font-medium">Prescriptions</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/doctor/reviews"
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40"
                  >
                    <span className="font-medium">Reviews</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/doctor/settings"
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40"
                  >
                    <span className="font-medium">Settings</span>
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
