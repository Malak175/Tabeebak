import { Link } from "react-router-dom";
import { isAfter, isValid, parseISO } from "date-fns";
import {
  Activity,
  Calendar,
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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDoctorAvailabilityQuery,
  useDoctorDashboardSummaryQuery,
  useDoctorProfessionalProfileQuery,
  useDoctorProfileQuery,
} from "@/hooks/useDoctorProfile";
import {
  useDoctorPendingAppointmentRequestsQuery,
  useDoctorReviewsSummaryQuery,
  useDoctorTodayAppointmentsQuery,
} from "@/hooks/useDoctorWorkflow";
import { getDisplayName } from "@/lib/auth";

const getUpcomingAppointmentsCount = (appointments: { scheduledAt?: string | null; status?: string }[]) => {
  const now = new Date();

  return appointments.filter((appointment) => {
    if (!appointment.scheduledAt) return false;
    const parsed = parseISO(appointment.scheduledAt);
    if (!isValid(parsed)) return false;
    const status = appointment.status?.toLowerCase();
    if (status && ["completed", "cancelled", "canceled", "no_show"].includes(status)) {
      return false;
    }
    return isAfter(parsed, now);
  }).length;
};

const DoctorDashboard = () => {
  const summaryQuery = useDoctorDashboardSummaryQuery();
  const profileQuery = useDoctorProfileQuery();
  const professionalProfileQuery = useDoctorProfessionalProfileQuery();
  const availabilityQuery = useDoctorAvailabilityQuery();
  const todayAppointmentsQuery = useDoctorTodayAppointmentsQuery(
    {
      page: 1,
      limit: 50,
      sortBy: "scheduledAt",
      sortOrder: "asc",
    },
    true,
  );
  const pendingRequestsQuery = useDoctorPendingAppointmentRequestsQuery(
    {
      page: 1,
      limit: 1,
      status: "PENDING",
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    true,
  );
  const reviewsSummaryQuery = useDoctorReviewsSummaryQuery(true);
  const summary = summaryQuery.data;
  const profile = profileQuery.data;
  const professionalProfile = professionalProfileQuery.data;
  const availability = availabilityQuery.data;
  const doctorName = getDisplayName(profileQuery.data ?? summary ?? {});
  const userSubtitle = summary?.specialty ?? "Doctor account";
  const firstName =
    profile?.firstName ??
    summary?.firstName ??
    doctorName.replace(/^Dr\.?\s*/i, "").split(" ")[0] ??
    "Doctor";

  const availabilityDays =
    availability?.weeklyScheduleJson ?? availability?.weeklySchedule ?? [];
  const hasAvailability =
    availabilityDays?.some((day) =>
      "slots" in day
        ? day.isAvailable && (day.slots?.length ?? 0) > 0
        : day.isAvailable && Boolean(day.startTime && day.endTime),
    ) ?? false;
  const hasClinicInfo = Boolean(
    professionalProfile?.clinicName ||
      professionalProfile?.clinicAddress ||
      summary?.clinicName ||
      profile?.addressLine1 ||
      profile?.city ||
      profile?.state ||
      profile?.country,
  );
  const hasSpecialty = Boolean(professionalProfile?.specialty || summary?.specialty);
  const hasConsultationFee =
    professionalProfile?.consultationFee !== null &&
    professionalProfile?.consultationFee !== undefined;
  const hasBio = Boolean(professionalProfile?.about || profile?.bio);
  const completionItems = [
    {
      label: "Basic profile info",
      complete: Boolean(
        profile?.firstName ||
          profile?.lastName ||
          profile?.displayName ||
          summary?.displayName ||
          summary?.firstName,
      ),
    },
    { label: "Specialization", complete: hasSpecialty },
    { label: "Consultation fee", complete: hasConsultationFee },
    { label: "Availability schedule", complete: hasAvailability },
    { label: "Clinic or location info", complete: hasClinicInfo },
    { label: "Professional bio", complete: hasBio },
  ];
  const completedItems = completionItems.filter((item) => item.complete).length;
  const completionPercent = Math.round((completedItems / completionItems.length) * 100);
  const missingItems = completionItems.filter((item) => !item.complete).map((item) => item.label);
  const isProfileCompletionLoading =
    profileQuery.isLoading ||
    professionalProfileQuery.isLoading ||
    availabilityQuery.isLoading;
  const reviewsTotal = reviewsSummaryQuery.data?.totalReviews ?? 0;
  const hasReviews = reviewsTotal > 0;

  const todayAppointments = todayAppointmentsQuery.data?.data ?? [];
  const totalAppointmentsToday =
    todayAppointmentsQuery.data
      ? todayAppointmentsQuery.data.total ?? todayAppointments.length
      : null;
  const upcomingAppointmentsToday =
    todayAppointmentsQuery.data ? getUpcomingAppointmentsCount(todayAppointments) : null;
  const pendingRequestsCount =
    pendingRequestsQuery.data?.total ?? pendingRequestsQuery.data?.data.length ?? null;
  const totalPatientsCount = summary?.quickStats?.totalPatients ?? summary?.totalPatientsCount ?? null;

  const todayQueue = summary?.todayQueue ?? [];

  const stats = [
    {
      label: "Today's Appointments",
      value: totalAppointmentsToday,
      icon: Calendar,
      status: todayAppointmentsQuery.isLoading
        ? "loading"
        : todayAppointmentsQuery.isError
          ? "error"
          : "ready",
      description:
        totalAppointmentsToday && totalAppointmentsToday > 0
          ? "Scheduled visits for today"
          : "No appointments scheduled yet",
    },
    {
      label: "Upcoming Today",
      value: upcomingAppointmentsToday,
      icon: Clock,
      status: todayAppointmentsQuery.isLoading
        ? "loading"
        : todayAppointmentsQuery.isError
          ? "error"
          : "ready",
      description:
        upcomingAppointmentsToday && upcomingAppointmentsToday > 0
          ? "Still ahead on today's schedule"
          : "No upcoming visits queued",
    },
    {
      label: "Pending Requests",
      value: pendingRequestsCount,
      icon: Activity,
      status: pendingRequestsQuery.isLoading
        ? "loading"
        : pendingRequestsQuery.isError
          ? "error"
          : "ready",
      description:
        pendingRequestsCount && pendingRequestsCount > 0
          ? "Appointment requests waiting on you"
          : "No pending requests right now",
    },
    {
      label: "Total Patients",
      value: totalPatientsCount,
      icon: Users,
      status: summaryQuery.isLoading ? "loading" : summaryQuery.isError ? "error" : "ready",
      description:
        totalPatientsCount && totalPatientsCount > 0
          ? "Patients under your care"
          : "No patient records yet",
    },
  ] as const;

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
            Here is a focused snapshot of your clinic activity and what needs attention today.
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

      {summaryQuery.isError ? (
        <Alert variant="destructive" className="mb-6">
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
      ) : null}

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat) =>
            stat.status === "loading" ? (
              <Card key={stat.label}>
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ) : (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div
                    className={`text-2xl font-bold ${
                      stat.status === "error" || stat.value === null || stat.value === undefined
                        ? "text-muted-foreground"
                        : ""
                    }`}
                  >
                    {stat.status === "error" || stat.value === null || stat.value === undefined
                      ? "-"
                      : stat.value}
                  </div>
                  <div className="text-sm font-medium">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {stat.status === "error"
                      ? "Unable to load right now"
                      : stat.value === null || stat.value === undefined
                        ? "Not available yet"
                        : stat.description}
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>Today&apos;s Queue</CardTitle>
                <CardDescription>
                  A quick look at the next patients in your queue today.
                </CardDescription>
              </div>
              <Link to="/doctor/appointments" className="text-sm text-primary hover:underline">
                Open queue
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {summaryQuery.isLoading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : summaryQuery.isError ? (
                <Alert variant="destructive">
                  <AlertTitle>Unable to load today&apos;s queue</AlertTitle>
                  <AlertDescription>{(summaryQuery.error as Error).message}</AlertDescription>
                </Alert>
              ) : todayQueue.length ? (
                todayQueue.map((appointment) => (
                  <div
                    key={
                      appointment.id ??
                      `${appointment.patientId ?? "patient"}-${appointment.scheduledAt ?? "time"}`
                    }
                    className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{appointment.patientName ?? "Patient"}</p>
                      {appointment.reason ? (
                        <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3">
                      {appointment.status ? (
                        <Badge variant="outline">{appointment.status}</Badge>
                      ) : null}
                      {appointment.id ? (
                        <Link
                          to={`/doctor/appointments/${appointment.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          View details
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed p-6">
                  <p className="text-sm font-medium">No patients are queued for today yet.</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Update your availability or check pending requests to keep your schedule moving.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to="/doctor/schedule">Review Schedule</Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/doctor/requests">View Requests</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-background">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  Profile Completion
                  <Badge variant={completionPercent === 100 ? "secondary" : "outline"}>
                    {completionPercent}%
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Finish key details so patients see a complete, trustworthy profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isProfileCompletionLoading ? (
                  <>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-40" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-24" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <Skeleton className="h-9 w-full" />
                  </>
                ) : (
                  <>
                    <Progress value={completionPercent} />
                    <div className="text-sm text-muted-foreground">
                      {completedItems} of {completionItems.length} profile items complete
                    </div>
                    {missingItems.length === 0 ? (
                      <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                        You are all set. Keep your information updated as your practice evolves.
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {missingItems.map((item) => (
                          <Badge key={item} variant="outline">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {missingItems.length > 0 ? (
                      <Button asChild className="w-full" variant="outline">
                        <Link to="/doctor/settings">Complete Profile</Link>
                      </Button>
                    ) : null}
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-secondary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquareQuote className="h-5 w-5" />
                  Reviews Snapshot
                </CardTitle>
                <CardDescription>How patients are rating recent visits.</CardDescription>
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
                ) : hasReviews ? (
                  <>
                    <div className="rounded-lg bg-background/70 p-3">
                      Average rating: {reviewsSummaryQuery.data?.averageRating.toFixed(1) ?? "0.0"}
                    </div>
                    <div className="rounded-lg bg-background/70 p-3">
                      Total reviews: {reviewsTotal}
                    </div>
                    <div className="rounded-lg bg-background/70 p-3">
                      Recommendation rate:{" "}
                      {reviewsSummaryQuery.data?.recommendationRate != null
                        ? `${reviewsSummaryQuery.data.recommendationRate}%`
                        : "N/A"}
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg bg-background/70 p-3 text-muted-foreground">
                    No reviews yet. After your first visits, patient feedback will appear here.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;
