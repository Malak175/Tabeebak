import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Activity,
  AlertCircle,
  Calendar,
  ChevronRight,
  Clock,
  Download,
  FlaskConical,
  Heart,
  Stethoscope,
  TrendingUp,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePatientDashboardSummaryQuery } from "@/hooks/usePatient";
import { patientNavItems } from "@/pages/patient/navigation";

const formatDisplayDate = (value?: string) => {
  if (!value) return "Not scheduled";

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

const PatientDashboard = () => {
  const { user } = useAuth();
  const dashboardSummaryQuery = usePatientDashboardSummaryQuery();

  const summary = dashboardSummaryQuery.data;
  const firstName =
    summary?.patientName?.split(" ")[0] ??
    user?.firstName ??
    user?.name?.split(" ")[0] ??
    "Patient";

  const stats = [
    {
      icon: Calendar,
      label: "Upcoming",
      value: summary?.upcomingAppointmentsCount ?? 0,
      sublabel: "Appointments",
      color: "primary",
    },
    {
      icon: FlaskConical,
      label: "Pending",
      value: summary?.pendingLabResultsCount ?? 0,
      sublabel: "Lab Results",
      color: "secondary",
    },
    {
      icon: Activity,
      label: "Heart Rate",
      value: summary?.vitals?.heartRate ?? "--",
      sublabel: "bpm",
      color: "green",
    },
  ] as const;

  return (
    <DashboardLayout
      userRole="patient"
      userName={user?.name ?? summary?.patientName ?? "Patient"}
      navItems={patientNavItems}
      userIcon={User}
    >
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">Welcome back, {firstName}!</h1>
        <p className="text-muted-foreground">Here&apos;s an overview of your real patient profile data.</p>
      </div>

      {dashboardSummaryQuery.isLoading && (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-80 w-full lg:col-span-2" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      )}

      {dashboardSummaryQuery.isError && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Dashboard summary unavailable</AlertTitle>
          <AlertDescription>{dashboardSummaryQuery.error.message}</AlertDescription>
        </Alert>
      )}

      {!dashboardSummaryQuery.isLoading && !dashboardSummaryQuery.isError && (
        <>
          <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Stethoscope className="h-5 w-5 text-primary" />
                My Doctor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summary?.primaryDoctor ? (
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                    {summary.primaryDoctor.name
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase() ?? "")
                      .join("")}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{summary.primaryDoctor.name}</h3>
                    <p className="font-medium text-primary">
                      {summary.primaryDoctor.specialty ?? "Specialty unavailable"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {[summary.primaryDoctor.experience, summary.primaryDoctor.location]
                        .filter(Boolean)
                        .join(" | ") || "Doctor details are limited right now."}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button className="gap-2" size="sm" variant="outline">
                      <Calendar className="h-4 w-4" />
                      Book Appointment
                    </Button>
                    <Button className="gap-2" size="sm" variant="hero">
                      <Stethoscope className="h-4 w-4" />
                      Contact Doctor
                    </Button>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No assigned doctor yet</AlertTitle>
                  <AlertDescription>
                    Your dashboard will show doctor details once an assignment is available.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="mb-8">
            <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-6">
              {stats.map((stat) => (
                <Card
                  key={stat.label}
                  className="min-w-[240px] max-w-[320px] flex-1 shadow-sm transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-5">
                    <div className="mb-4 flex items-start justify-between">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          stat.color === "primary"
                            ? "bg-primary/10 text-primary"
                            : stat.color === "green"
                              ? "bg-green-100 text-green-700"
                              : "bg-secondary/20 text-secondary"
                        }`}
                      >
                        <stat.icon className="h-6 w-6" />
                      </div>
                      <TrendingUp className="h-5 w-5 text-green-500 opacity-80" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                      <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                      <div className="text-xs text-muted-foreground/80">{stat.sublabel}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                  <Link
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                    to="/patient/appointments"
                  >
                    View All <ChevronRight className="h-4 w-4" />
                  </Link>
                </CardHeader>
                <CardContent>
                  {summary?.upcomingAppointments.length ? (
                    <div className="space-y-4">
                      {summary.upcomingAppointments.map((appointment) => (
                        <div
                          className="flex items-center gap-4 rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted"
                          key={appointment.id}
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                            {appointment.avatarText}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate font-medium">{appointment.doctorName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {appointment.specialty ?? "Specialty unavailable"}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{formatDisplayDate(appointment.date)}</span>
                              <Clock className="ml-2 h-3.5 w-3.5" />
                              <span>{appointment.time ?? "Time pending"}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                              {appointment.status ?? "Scheduled"}
                            </span>
                            <Button asChild size="sm" variant="ghost">
                              <Link to={`/patient/appointments/${appointment.id}`}>Details</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No upcoming appointments</AlertTitle>
                      <AlertDescription>
                        Upcoming patient appointments will appear here when available.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Recent Lab Results</CardTitle>
                  <Link
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                    to="/patient/lab-results"
                  >
                    View All <ChevronRight className="h-4 w-4" />
                  </Link>
                </CardHeader>
                <CardContent>
                  {summary?.recentLabResults.length ? (
                    <div className="space-y-3">
                      {summary.recentLabResults.map((result) => (
                        <div
                          className="flex items-center justify-between rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted"
                          key={result.id}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                              <FlaskConical className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-medium">{result.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {[formatDisplayDate(result.date), result.doctorName]
                                  .filter(Boolean)
                                  .join(" | ") || "Result details unavailable"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="rounded-full bg-secondary/10 px-2 py-1 text-xs font-medium text-secondary">
                              {result.status ?? "Ready"}
                            </span>
                            <Button asChild size="sm" variant="ghost">
                              <Link to={`/patient/lab-results/${result.id}`}>
                                <Download className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>No recent lab results</AlertTitle>
                      <AlertDescription>
                        Once recent lab results are available, they will be listed here.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-primary" />
                    Vitals Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-primary/5 p-3 text-center">
                      <Heart className="mx-auto mb-1 h-5 w-5 text-primary" />
                      <div className="text-lg font-bold">{summary?.vitals?.heartRate ?? "--"}</div>
                      <div className="text-xs text-muted-foreground">Heart Rate</div>
                    </div>
                    <div className="rounded-xl bg-secondary/10 p-3 text-center">
                      <Activity className="mx-auto mb-1 h-5 w-5 text-secondary" />
                      <div className="text-lg font-bold">{summary?.vitals?.bloodPressure ?? "--"}</div>
                      <div className="text-xs text-muted-foreground">Blood Pressure</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Weight</span>
                      <span className="font-medium">
                        {summary?.vitals?.weightKg ? `${summary.vitals.weightKg} kg` : "--"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">BMI</span>
                      <span className="font-medium">{summary?.vitals?.bmi ?? "--"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Blood Sugar</span>
                      <span className="font-medium">
                        {summary?.vitals?.bloodSugarMgDl
                          ? `${summary.vitals.bloodSugarMgDl} mg/dL`
                          : "--"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="mb-1 text-sm font-medium">Daily Health Tip</h4>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {summary?.dailyTip ??
                          "Health tips will appear here once your patient dashboard summary includes them."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default PatientDashboard;
