import { Link } from "react-router-dom";
import { Calendar, ClipboardList, FlaskConical, Phone, ShieldCheck, User } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { patientNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useEmergencyContactQuery,
  useMedicalHistorySummaryQuery,
  usePatientAppointmentsQuery,
  usePatientDashboardSummaryQuery,
  usePatientLabResultsQuery,
  usePatientMedicalProfileQuery,
  usePatientProfileQuery,
  usePatientPrescriptionsQuery,
  useInsuranceQuery,
} from "@/hooks/usePatientProfile";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import { formatDisplayDateTime } from "@/lib/date-time";
import { getPatientLabWorkflowBadgeClassName, getPatientLabWorkflowLabel } from "@/lib/patientLabStatus";
import { cn } from "@/lib/utils";

const formatNumber = (value: number | null | undefined, digits = 1) => {
  if (value === null || value === undefined || Number.isNaN(value)) return null;
  return value.toFixed(digits);
};

const formatDate = (value?: string | null) => formatDisplayDateTime(value);

const SummaryStat = ({
  title,
  value,
  helper,
  icon: Icon,
  emptyLabel,
  actionLabel,
  actionTo,
  badge,
}: {
  title: string;
  value?: string;
  helper: string;
  icon: typeof Calendar;
  emptyLabel: string;
  actionLabel: string;
  actionTo: string;
  badge?: { text: string; variant?: "default" | "secondary" | "destructive" | "outline" };
}) => (
  <Card className="h-full min-h-[260px] rounded-2xl border-slate-200/80 bg-white/95 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80">
    <CardContent className="flex h-full flex-col p-5 sm:p-6">
      <div className="mb-5 flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
          <Icon className="h-6 w-6" />
        </div>
        {badge ? (
          <Badge variant={badge.variant ?? "secondary"} className="h-fit rounded-full">
            {badge.text}
          </Badge>
        ) : null}
      </div>
      <div className="space-y-1.5">
        <div className={cn("text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100", !value && "text-muted-foreground")}>
          {value ?? emptyLabel}
        </div>
        <div className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</div>
        <div className="text-xs leading-relaxed text-muted-foreground">{helper}</div>
      </div>
      <Button asChild size="sm" variant="outline" className="mt-auto w-full rounded-xl border-slate-200 bg-white/80 transition-colors hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:bg-slate-800">
        <Link to={actionTo}>{actionLabel}</Link>
      </Button>
    </CardContent>
  </Card>
);

const SummaryStatSkeleton = () => (
  <Card className="min-h-[260px] rounded-2xl border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
    <CardContent className="space-y-3 p-5 sm:p-6">
      <Skeleton className="h-12 w-12 rounded-2xl" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
    </CardContent>
  </Card>
);

const HistoryList = ({ title, items }: { title: string; items: string[] }) => (
  <Card className="rounded-2xl border-slate-200/80 bg-white/95 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80">
    <CardHeader className="pb-3">
      <CardTitle className="text-base font-semibold tracking-tight">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No information added yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={`${title}-${item}`}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200"
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
  const profileQuery = usePatientProfileQuery(Boolean(user));
  const historyQuery = useMedicalHistorySummaryQuery(Boolean(user));
  const medicalProfileQuery = usePatientMedicalProfileQuery(Boolean(user));
  const emergencyContactQuery = useEmergencyContactQuery(Boolean(user));
  const insuranceQuery = useInsuranceQuery(Boolean(user));
  const recentLabResultsQuery = usePatientLabResultsQuery(
    { page: 1, limit: 3, sortBy: "reportedAt", sortOrder: "desc" },
    Boolean(user),
  );
  const recentAppointmentsQuery = usePatientAppointmentsQuery(
    { page: 1, limit: 3, sortBy: "scheduledAt", sortOrder: "desc" },
    Boolean(user),
  );
  const recentPrescriptionsQuery = usePatientPrescriptionsQuery(
    { page: 1, limit: 3, sortBy: "prescribedAt", sortOrder: "desc" },
    Boolean(user),
  );

  const summary = dashboardSummaryQuery.data;
  const profile = profileQuery.data;
  const medicalProfile = medicalProfileQuery.data;
  const emergencyContact = emergencyContactQuery.data;
  const insurance = insuranceQuery.data;
  const userName = getDisplayName({
    name: summary?.name ?? user?.name,
    displayName: summary?.displayName,
    firstName: summary?.firstName ?? profile?.firstName ?? user?.firstName,
    lastName: summary?.lastName ?? profile?.lastName ?? user?.lastName,
    email: summary?.email ?? user?.email,
  });

  const weightKg = summary?.latestWeightKg ?? (medicalProfile?.weightKg ?? null);
  const heightCm = medicalProfile?.heightCm ?? null;
  const heightMeters = heightCm !== null && heightCm > 0 ? heightCm / 100 : null;
  const bmiValue =
    weightKg !== null && heightMeters !== null
      ? weightKg / (heightMeters * heightMeters)
      : null;
  const hasWeight = weightKg !== null;
  const bloodType = medicalProfile?.bloodType ?? historyQuery.data?.bloodType ?? null;
  const vitalSummary = [
    summary?.latestHeartRate ? `${summary.latestHeartRate} bpm` : null,
    summary?.latestBloodPressure ? summary.latestBloodPressure : null,
  ]
    .filter(Boolean)
    .join(" / ");
  const hasVitals = vitalSummary.length > 0;
  const hasBloodSugar =
    summary?.bloodSugarMgDl !== null && summary?.bloodSugarMgDl !== undefined;

  const upcomingAppointmentsCount = summary?.upcomingAppointmentsCount ?? 0;
  const hasUpcomingAppointments = upcomingAppointmentsCount > 0;
  const pendingLabResultsCount = summary?.pendingLabResultsCount ?? 0;
  const hasPendingLabResults = pendingLabResultsCount > 0;
  const medicationsFallbackCount =
    medicalProfile?.currentMedications?.length ??
    historyQuery.data?.currentMedications?.length ??
    0;
  const resolvedMedicationsCount = summary?.activeMedicationsCount ?? medicationsFallbackCount;
  const hasActiveMedications = resolvedMedicationsCount > 0;
  const medicationsHelper = hasActiveMedications
    ? summary?.activeMedicationsCount !== undefined
      ? "Currently tracked medications"
      : "Based on your medical history"
    : "Update your medical profile to track medications";

  const hasEmergencyContact = Boolean(
    emergencyContact?.fullName ||
      emergencyContact?.phone ||
      historyQuery.data?.highlights?.hasEmergencyContact,
  );
  const hasInsurance = Boolean(
    insurance?.providerName || insurance?.memberId || historyQuery.data?.highlights?.hasInsurance,
  );

  const completionItems = [
    {
      label: "Add full name",
      complete: Boolean(
        profile?.firstName ||
          profile?.lastName ||
          profile?.displayName ||
          summary?.displayName ||
          summary?.name ||
          user?.name,
      ),
    },
    { label: "Add phone number", complete: Boolean(profile?.phone) },
    { label: "Add date of birth", complete: Boolean(profile?.dateOfBirth) },
    { label: "Add gender", complete: Boolean(profile?.gender) },
    { label: "Add blood type", complete: Boolean(bloodType) },
    { label: "Add height", complete: Boolean(heightCm) },
    { label: "Add weight", complete: Boolean(weightKg) },
    { label: "Add emergency contact", complete: hasEmergencyContact },
    { label: "Add insurance details", complete: hasInsurance },
  ];
  const completedItems = completionItems.filter((item) => item.complete).length;
  const completionPercent = Math.round((completedItems / completionItems.length) * 100);
  const missingItems = completionItems.filter((item) => !item.complete).map((item) => item.label);
  const isProfileCompletionLoading =
    profileQuery.isLoading ||
    medicalProfileQuery.isLoading ||
    emergencyContactQuery.isLoading ||
    insuranceQuery.isLoading;

  const nextSteps = [
    !hasEmergencyContact && {
      label: "Add Emergency Contact",
      to: "/patient/settings",
      helper: "Add someone we can contact in an emergency.",
    },
    !hasInsurance && {
      label: "Add Insurance Details",
      to: "/patient/settings",
      helper: "Save insurance to speed up visits.",
    },
    !hasUpcomingAppointments && {
      label: "Book an Appointment",
      to: "/patient/book",
      helper: "Schedule your next visit with a doctor.",
    },
    !hasPendingLabResults && {
      label: "Request a Lab Test",
      to: "/patient/labs",
      helper: "Find a lab and request a test.",
    },
    completionPercent < 100 && {
      label: "Complete Your Profile",
      to: "/patient/settings",
      helper: "Finish missing profile sections.",
    },
  ].filter(Boolean) as { label: string; to: string; helper: string }[];

  const snapshotRows = [
    hasWeight && { label: "Weight", value: `${weightKg} kg` },
    formatNumber(bmiValue, 1) && { label: "BMI", value: `${formatNumber(bmiValue, 1)} kg/m2` },
    bloodType && { label: "Blood Type", value: bloodType },
    hasVitals && { label: "Vital Signs", value: vitalSummary },
    hasBloodSugar && { label: "Blood Sugar", value: `${summary?.bloodSugarMgDl} mg/dL` },
  ].filter(Boolean) as { label: string; value: string }[];

  const recentLabResults = recentLabResultsQuery.data?.data ?? [];
  const recentAppointments = recentAppointmentsQuery.data?.data ?? [];
  const recentPrescriptions = recentPrescriptionsQuery.data?.data ?? [];
  const hasAnyAppointments = recentAppointments.length > 0;
  const hasAnyLabResults = recentLabResults.length > 0;
  const recentAnalyses = recentLabResults.filter(
    (result) => Boolean(result.requestId) && Boolean(result.interpretation || result.conclusion),
  );

  return (
    <DashboardLayout userRole="patient" userName={userName} navItems={patientNavItems} userIcon={User}>
      <div className="mb-8 rounded-2xl border border-slate-200/70 bg-gradient-to-r from-sky-50 via-white to-slate-50 px-5 py-6 shadow-sm sm:px-6 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100">
          Welcome back, {userName.split(" ")[0]}!
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
          Here is a clear snapshot of your health and care in one place.
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

      <div className="mb-8 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card className="rounded-2xl border border-sky-200/60 bg-gradient-to-r from-sky-50/80 via-white to-transparent shadow-sm dark:border-sky-900/40 dark:from-sky-950/30 dark:via-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg font-semibold tracking-tight">
              Profile Completion
              <Badge variant={completionPercent === 100 ? "secondary" : "outline"}>
                {completionPercent}%
              </Badge>
            </CardTitle>
            <CardDescription>
              Complete missing sections to unlock more personalized insights.
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
                  <div className="rounded-xl bg-slate-100/80 p-3 text-sm text-muted-foreground dark:bg-slate-800/80">
                    You are all set. Keep your information up to date as things change.
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
                  <Button asChild className="w-full rounded-xl border-slate-200 bg-white/90 transition-colors hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:bg-slate-800" variant="outline">
                    <Link to="/patient/settings">Complete Missing Info</Link>
                  </Button>
                ) : null}
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              <ClipboardList className="h-5 w-5 text-sky-600 dark:text-sky-300" />
              Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {snapshotRows.length === 0 ? (
              <div className="rounded-xl bg-slate-100/80 p-3 text-muted-foreground dark:bg-slate-800/80">
                No snapshot data yet. Add medical details to see your key metrics.
              </div>
            ) : (
              snapshotRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900/50">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{row.value}</span>
                </div>
              ))
            )}
            <div className="rounded-xl bg-sky-50/80 p-3 text-muted-foreground dark:bg-sky-950/30">
              {summary?.healthTip?.trim()
                ? summary.healthTip
                : "Personalized health tips will appear here when they are available."}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid items-stretch gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-5">
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
              title="Appointments"
              value={
                hasUpcomingAppointments
                  ? String(upcomingAppointmentsCount)
                  : hasAnyAppointments
                    ? String(recentAppointments.length)
                    : undefined
              }
              emptyLabel="No appointments yet"
              helper={
                hasUpcomingAppointments
                  ? "Upcoming visits scheduled"
                  : hasAnyAppointments
                    ? "Review your recent appointment history"
                    : "Schedule your next visit with a doctor"
              }
              icon={Calendar}
              actionLabel={hasUpcomingAppointments || hasAnyAppointments ? "View Appointments" : "Book an Appointment"}
              actionTo={hasUpcomingAppointments || hasAnyAppointments ? "/patient/appointments" : "/patient/book"}
            />
            <SummaryStat
              title="Lab Results"
              value={
                hasPendingLabResults
                  ? String(pendingLabResultsCount)
                  : hasAnyLabResults
                    ? String(recentLabResults.length)
                    : undefined
              }
              emptyLabel="No lab results yet"
              helper={
                hasPendingLabResults
                  ? "Pending results in progress"
                  : hasAnyLabResults
                    ? "Recent lab results are available"
                    : "Request a lab test to get started"
              }
              icon={FlaskConical}
              actionLabel={hasPendingLabResults || hasAnyLabResults ? "View Lab Results" : "Request a Lab Test"}
              actionTo={hasPendingLabResults || hasAnyLabResults ? "/patient/lab-results" : "/patient/labs"}
            />
            <SummaryStat
              title="Current Medications"
              value={hasActiveMedications ? String(resolvedMedicationsCount) : undefined}
              emptyLabel="No active medications recorded"
              helper={
                hasActiveMedications ? "Based on your medical profile" : "Update your medical profile to add meds"
              }
              icon={ClipboardList}
              actionLabel={hasActiveMedications ? "Update Medical Profile" : "Add Medications"}
              actionTo="/patient/settings"
            />
            <SummaryStat
              title="Emergency Contact"
              value={hasEmergencyContact ? "On file" : undefined}
              emptyLabel="No emergency contact"
              helper={
                hasEmergencyContact
                  ? emergencyContact?.fullName ?? "Emergency contact saved"
                  : "Add someone we can reach in an emergency"
              }
              icon={Phone}
              actionLabel={hasEmergencyContact ? "Review Contact" : "Add Emergency Contact"}
              actionTo="/patient/settings"
              badge={{
                text: hasEmergencyContact ? "Complete" : "Missing",
                variant: hasEmergencyContact ? "secondary" : "outline",
              }}
            />
            <SummaryStat
              title="Insurance Status"
              value={hasInsurance ? "On file" : undefined}
              emptyLabel="No insurance details"
              helper={
                hasInsurance
                  ? insurance?.providerName ?? "Insurance details saved"
                  : "Add insurance to speed up visits"
              }
              icon={ShieldCheck}
              actionLabel={hasInsurance ? "Review Insurance" : "Add Insurance"}
              actionTo="/patient/settings"
              badge={{
                text: hasInsurance ? "Complete" : "Missing",
                variant: hasInsurance ? "secondary" : "outline",
              }}
            />
          </>
        )}
      </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <Card className="rounded-2xl border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader>
                <CardTitle className="font-semibold tracking-tight">Medical History Summary</CardTitle>
                <CardDescription>
                  Summary of your recorded medical history.
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
                  {[
                    { title: "Allergies", items: historyQuery.data?.allergies ?? [] },
                    {
                      title: "Chronic Conditions",
                      items: historyQuery.data?.chronicConditions ?? [],
                    },
                    { title: "Medications", items: historyQuery.data?.currentMedications ?? [] },
                    { title: "Surgeries", items: historyQuery.data?.pastSurgeries ?? [] },
                    { title: "Family History", items: historyQuery.data?.familyHistory ?? [] },
                  ].map((section) => (
                    <HistoryList
                      key={section.title}
                      title={section.title}
                      items={section.items}
                    />
                  ))}
                </div>
              )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-semibold tracking-tight">Recent Lab Results</CardTitle>
                  <CardDescription>Preview of your latest lab reports.</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-xl transition-colors hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-slate-800">
                  <Link to="/patient/lab-results">View All</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentLabResultsQuery.isLoading ? (
                  <>
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </>
                ) : recentLabResultsQuery.isError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Unable to load lab results</AlertTitle>
                    <AlertDescription>{(recentLabResultsQuery.error as Error).message}</AlertDescription>
                  </Alert>
                ) : recentLabResults.length ? (
                  recentLabResults.map((result) => (
                    <div key={result.id} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200/80 bg-white/70 p-3 transition-colors hover:bg-sky-50/60 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800/80">
                      <div>
                        <p className="text-sm font-medium">{result.testName}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.laboratoryName || "Lab pending"} • {formatDate(result.reportedAt)}
                        </p>
                      </div>
                      <Badge
                        className={getPatientLabWorkflowBadgeClassName({
                          orderStatus: result.orderStatus ?? null,
                          status: result.status ?? null,
                        })}
                      >
                        {getPatientLabWorkflowLabel({
                          orderStatus: result.orderStatus ?? null,
                          status: result.status ?? null,
                        })}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl bg-slate-100/80 p-3 text-sm text-muted-foreground dark:bg-slate-800/80">
                    No lab results yet.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-semibold tracking-tight">Recent Appointments</CardTitle>
                  <CardDescription>Your latest visits and bookings.</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-xl transition-colors hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-slate-800">
                  <Link to="/patient/appointments">View All</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentAppointmentsQuery.isLoading ? (
                  <>
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </>
                ) : recentAppointmentsQuery.isError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Unable to load appointments</AlertTitle>
                    <AlertDescription>{(recentAppointmentsQuery.error as Error).message}</AlertDescription>
                  </Alert>
                ) : recentAppointments.length ? (
                  recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-start justify-between gap-4 rounded-xl border border-slate-200/80 bg-white/70 p-3 transition-colors hover:bg-sky-50/60 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800/80">
                      <div>
                        <p className="text-sm font-medium">{appointment.doctorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.doctorSpecialty || "Specialty not available"} •{" "}
                          {formatDate(appointment.scheduledAt)}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {appointment.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl bg-slate-100/80 p-3 text-sm text-muted-foreground dark:bg-slate-800/80">
                    No appointments yet.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-semibold tracking-tight">Recent Prescriptions</CardTitle>
                  <CardDescription>Latest medications added to your record.</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-xl transition-colors hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-slate-800">
                  <Link to="/patient/prescriptions">View All</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentPrescriptionsQuery.isLoading ? (
                  <>
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </>
                ) : recentPrescriptionsQuery.isError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Unable to load prescriptions</AlertTitle>
                    <AlertDescription>{(recentPrescriptionsQuery.error as Error).message}</AlertDescription>
                  </Alert>
                ) : recentPrescriptions.length ? (
                  recentPrescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="flex items-start justify-between gap-4 rounded-xl border border-slate-200/80 bg-white/70 p-3 transition-colors hover:bg-sky-50/60 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800/80"
                    >
                      <div>
                        <p className="text-sm font-medium">{prescription.medicationName}</p>
                        <p className="text-xs text-muted-foreground">
                          {prescription.prescriberName || "Prescriber pending"} •{" "}
                          {formatDate(prescription.prescribedAt)}
                        </p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {(prescription as { status?: string }).status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl bg-slate-100/80 p-3 text-sm text-muted-foreground dark:bg-slate-800/80">
                    No prescriptions yet.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-semibold tracking-tight">Recent Lab Insights</CardTitle>
                  <CardDescription>Highlights from recent lab interpretations.</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-xl transition-colors hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-slate-800">
                  <Link to="/patient/lab-results">View Lab Results</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentLabResultsQuery.isLoading ? (
                  <>
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </>
                ) : recentLabResultsQuery.isError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Unable to load lab insights</AlertTitle>
                    <AlertDescription>{(recentLabResultsQuery.error as Error).message}</AlertDescription>
                  </Alert>
                ) : recentAnalyses.length ? (
                  recentAnalyses.map((result) => (
                    <div key={`${result.id}-analysis`} className="rounded-xl border border-slate-200/80 bg-white/70 p-3 transition-colors hover:bg-sky-50/60 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800/80">
                      <p className="text-sm font-medium">{result.testName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(result.reportedAt)} • {result.laboratoryName || "Lab pending"}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {result.interpretation || result.conclusion}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl bg-slate-100/80 p-3 text-sm text-muted-foreground dark:bg-slate-800/80">
                    No lab insights are available yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200/80 bg-white/95 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 xl:sticky xl:top-6">
            <CardHeader>
              <CardTitle className="font-semibold tracking-tight">Next Steps</CardTitle>
              <CardDescription>
                Recommended actions based on what is missing in your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {nextSteps.length === 0 ? (
                <div className="rounded-xl bg-slate-100/80 p-3 text-sm text-muted-foreground dark:bg-slate-800/80">
                  You are all caught up. Explore appointments, labs, or health tips anytime.
                </div>
              ) : (
                nextSteps.slice(0, 4).map((step) => (
                  <div key={step.label} className="rounded-xl border border-slate-200/80 bg-white/70 p-3 transition-colors hover:bg-sky-50/60 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:bg-slate-800/80">
                    <div className="mb-2 text-sm font-medium text-slate-800 dark:text-slate-100">{step.label}</div>
                    <div className="mb-3 text-xs text-muted-foreground">{step.helper}</div>
                    <Button asChild className="w-full justify-start rounded-xl border-slate-200 bg-white/90 transition-colors hover:bg-sky-50 hover:text-sky-700 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:bg-slate-800" variant="outline">
                      <Link to={step.to}>{step.label}</Link>
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDashboard;

