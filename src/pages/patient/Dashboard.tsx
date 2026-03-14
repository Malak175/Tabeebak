import { Link } from "react-router-dom";
import {
  Activity,
  Calendar,
  ClipboardList,
  FlaskConical,
  Heart,
  HelpCircle,
  Home,
  Settings,
  Stethoscope,
  User,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { patientNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useMedicalHistorySummaryQuery,
  usePatientDashboardSummaryQuery,
} from "@/hooks/usePatientProfile";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName, getInitials } from "@/lib/auth";

const formatMetric = (value: number | string | null | undefined, suffix?: string) => {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

  return suffix ? `${value} ${suffix}` : String(value);
};

const SummaryStat = ({
  title,
  value,
  helper,
  icon: Icon,
}: {
  title: string;
  value: string;
  helper: string;
  icon: typeof Calendar;
}) => (
  <Card>
    <CardContent className="p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{helper}</div>
      </div>
    </CardContent>
  </Card>
);

const SummaryStatSkeleton = () => (
  <Card>
    <CardContent className="space-y-3 p-5">
      <Skeleton className="h-12 w-12 rounded-2xl" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
    </CardContent>
  </Card>
);

const HistoryList = ({ title, items }: { title: string; items: string[] }) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-base">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No information added yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={`${title}-${item}`}
              className="rounded-full border bg-muted px-3 py-1 text-xs font-medium"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

const PatientDashboard = () => {
  const { user } = useAuth();
  const dashboardSummaryQuery = usePatientDashboardSummaryQuery(Boolean(user));
  const historyQuery = useMedicalHistorySummaryQuery(Boolean(user));

  const summary = dashboardSummaryQuery.data;
  const userName = getDisplayName({
    name: summary?.name ?? user?.name,
    displayName: summary?.displayName,
    firstName: summary?.firstName ?? user?.firstName,
    lastName: summary?.lastName ?? user?.lastName,
    email: summary?.email ?? user?.email,
  });

  return (
    <DashboardLayout userRole="patient" userName={userName} navItems={patientNavItems} userIcon={User}>
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">
          Welcome back, {userName.split(" ")[0]}!
        </h1>
        <p className="text-muted-foreground">
          Your dashboard is now connected to live patient summary data.
        </p>
      </div>

      {dashboardSummaryQuery.isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Unable to load dashboard summary</AlertTitle>
          <AlertDescription>
            {(dashboardSummaryQuery.error as Error).message}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stethoscope className="h-5 w-5 text-primary" />
              Care Team
            </CardTitle>
            <CardDescription>Your assigned doctor information from the dashboard summary.</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardSummaryQuery.isLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ) : summary?.assignedDoctorName ? (
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={summary.assignedDoctorAvatarUrl ?? undefined}
                    alt={summary.assignedDoctorName}
                  />
                  <AvatarFallback>{getInitials(summary.assignedDoctorName)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{summary.assignedDoctorName}</h3>
                  <p className="font-medium text-primary">
                    {summary.assignedDoctorSpecialty || "Specialty not available"}
                  </p>
                </div>
                <Button asChild variant="outline">
                  <Link to="/patient/settings">Update Profile Details</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  No assigned doctor information is available yet.
                </p>
                <Button asChild variant="outline">
                  <Link to="/patient/settings">Complete Your Profile</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="h-5 w-5 text-primary" />
              Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Weight</span>
              <span className="font-medium">
                {formatMetric(summary?.latestWeightKg, "kg")}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">BMI</span>
              <span className="font-medium">{formatMetric(summary?.bmi)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">Blood Sugar</span>
              <span className="font-medium">
                {formatMetric(summary?.bloodSugarMgDl, "mg/dL")}
              </span>
            </div>
            <div className="rounded-lg bg-muted p-3 text-muted-foreground">
              {summary?.healthTip?.trim()
                ? summary.healthTip
                : "Personalized health tips will appear here when the backend provides them."}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        {dashboardSummaryQuery.isLoading ? (
          <>
            <SummaryStatSkeleton />
            <SummaryStatSkeleton />
            <SummaryStatSkeleton />
            <SummaryStatSkeleton />
            <SummaryStatSkeleton />
          </>
        ) : (
          <>
            <SummaryStat
              title="Upcoming Appointments"
              value={formatMetric(summary?.upcomingAppointmentsCount)}
              helper="Scheduled visits ahead"
              icon={Calendar}
            />
            <SummaryStat
              title="Pending Lab Results"
              value={formatMetric(summary?.pendingLabResultsCount)}
              helper="Results still in progress"
              icon={FlaskConical}
            />
            <SummaryStat
              title="Active Medications"
              value={formatMetric(summary?.activeMedicationsCount)}
              helper="Currently tracked medications"
              icon={ClipboardList}
            />
            <SummaryStat
              title="Heart Rate"
              value={formatMetric(summary?.latestHeartRate, "bpm")}
              helper="Latest recorded pulse"
              icon={Heart}
            />
            <SummaryStat
              title="Blood Pressure"
              value={formatMetric(summary?.latestBloodPressure)}
              helper="Latest recorded reading"
              icon={Activity}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Medical History Summary</CardTitle>
              <CardDescription>
                Read-only summary loaded from `/api/v1/patients/me/medical-history-summary`.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {historyQuery.isLoading ? (
                <>
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : historyQuery.isError ? (
                <Alert variant="destructive">
                  <AlertTitle>Unable to load medical history</AlertTitle>
                  <AlertDescription>{(historyQuery.error as Error).message}</AlertDescription>
                </Alert>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <HistoryList title="Allergies" items={historyQuery.data?.allergies ?? []} />
                  <HistoryList
                    title="Chronic Conditions"
                    items={historyQuery.data?.chronicConditions ?? []}
                  />
                  <HistoryList title="Medications" items={historyQuery.data?.medications ?? []} />
                  <HistoryList title="Surgeries" items={historyQuery.data?.surgeries ?? []} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                These destinations are linked, but their detailed datasets are outside this phase.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/patient/appointments">Go to Appointments</Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/patient/lab-results">Go to Lab Results</Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/patient/prescriptions">Go to Prescriptions</Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link to="/patient/settings">Manage Profile & Insurance</Link>
              </Button>
            </CardContent>
          </Card>

          <HistoryList
            title="Family History"
            items={historyQuery.data?.familyHistory ?? []}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;
