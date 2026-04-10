import { useEffect, useMemo, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { Search, Stethoscope, UserRound, Users } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { doctorNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDoctorPatientSummaryQuery,
  useDoctorPatientsQuery,
} from "@/hooks/useDoctorWorkflow";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName, getInitials } from "@/lib/auth";

const formatDateTime = (value?: string | null) => {
  if (!value) return null;

  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;

  return format(parsed, "PPP");
};

const getConditionClassName = (value?: string | null) => {
  switch ((value ?? "").toLowerCase()) {
    case "stable":
    case "good":
      return "bg-green-100 text-green-700 border-green-200";
    case "improving":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "critical":
    case "urgent":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const DoctorPatients = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [condition, setCondition] = useState("all");
  const [selectedPatientId, setSelectedPatientId] = useState<string>();
  const userName = getDisplayName(user ?? {});

  const filters = useMemo(
    () => ({
      page,
      limit: 8,
      search,
      condition: condition === "all" ? undefined : condition,
      status: condition === "all" ? undefined : condition,
      sortBy: "lastVisitAt",
      sortOrder: "desc" as const,
    }),
    [page, search, condition],
  );

  const enabled = Boolean(user);
  const patientsQuery = useDoctorPatientsQuery(filters, enabled);
  const summaryQuery = useDoctorPatientSummaryQuery(selectedPatientId, enabled);

  const filteredPatients = useMemo(() => {
    const patients = patientsQuery.data?.data ?? [];
    const normalizedSearch = search.trim().toLowerCase();
    const conditionFilter = condition === "all" ? "" : condition.toLowerCase();

    return patients.filter((patient) => {
      if (conditionFilter) {
        const patientCondition = patient.condition?.toLowerCase() ?? "";
        if (patientCondition !== conditionFilter) return false;
      }

      if (!normalizedSearch) return true;

      const haystack = [
        patient.fullName,
        patient.email,
        patient.phone,
        patient.diagnosis,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [patientsQuery.data?.data, search, condition]);

  useEffect(() => {
    if (!filteredPatients.length) {
      setSelectedPatientId(undefined);
      return;
    }

    setSelectedPatientId((current) =>
      current && filteredPatients.some((patient) => patient.id === current)
        ? current
        : filteredPatients[0].id,
    );
  }, [filteredPatients]);

  return (
    <DashboardLayout
      userRole="doctor"
      userName={userName}
      userSubtitle="Doctor account"
      navItems={doctorNavItems}
      userIcon={Stethoscope}
    >
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">Patients</h1>
        <p className="text-muted-foreground">
          Review your paginated patient roster and live patient summary data.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={search}
                  onChange={(event) => {
                    setPage(1);
                    setSearch(event.target.value);
                  }}
                  placeholder="Search patients"
                />
              </div>
              <Select
                value={condition}
                onValueChange={(value) => {
                  setPage(1);
                  setCondition(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All conditions</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="improving">Improving</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {patientsQuery.isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </div>
          ) : patientsQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load patients</AlertTitle>
              <AlertDescription>{(patientsQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : filteredPatients.length ? (
            <>
              <div className="space-y-4">
                {filteredPatients.map((patient) => {
                  const lastVisitLabel = formatDateTime(patient.lastVisitAt);
                  const nextVisitLabel = formatDateTime(patient.upcomingAppointmentAt);
                  const hasDiagnosis = Boolean(patient.diagnosis?.trim());
                  const hasCondition = Boolean(patient.condition?.trim());
                  const hasVisitInfo = Boolean(lastVisitLabel || nextVisitLabel);

                  return (
                  <Card
                    key={patient.id}
                    className={`cursor-pointer transition-colors hover:border-primary/50 ${
                      patient.id === selectedPatientId ? "border-primary" : ""
                    }`}
                    onClick={() => setSelectedPatientId(patient.id)}
                  >
                    <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={patient.avatarUrl ?? undefined} alt={patient.fullName} />
                          <AvatarFallback>{getInitials(patient.fullName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{patient.fullName}</p>
                          <p className="text-sm text-muted-foreground">
                            {[patient.age ? `${patient.age} yrs` : null, patient.gender]
                              .filter(Boolean)
                              .join(" - ") || "Profile details pending"}
                          </p>
                        </div>
                      </div>

                      <div className="flex-1 space-y-1">
                        {hasDiagnosis ? (
                          <p className="text-sm font-medium">{patient.diagnosis}</p>
                        ) : null}
                        {lastVisitLabel ? (
                          <p className="text-sm text-muted-foreground">Last visit: {lastVisitLabel}</p>
                        ) : null}
                        {nextVisitLabel ? (
                          <p className="text-sm text-muted-foreground">
                            Next appointment: {nextVisitLabel}
                          </p>
                        ) : null}
                        {!hasDiagnosis && !hasVisitInfo ? (
                          <p className="text-sm text-muted-foreground">
                            No recent visit details yet.
                          </p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {hasCondition ? (
                          <Badge className={getConditionClassName(patient.condition)}>
                            {patient.condition}
                          </Badge>
                        ) : null}
                        <Button asChild variant="outline" onClick={(event) => event.stopPropagation()}>
                          <Link to={`/doctor/patients/${patient.id}`}>Open summary</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {patientsQuery.data.page} of {patientsQuery.data.totalPages} with{" "}
                  {patientsQuery.data.total} total patients
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!patientsQuery.data.hasPreviousPage}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!patientsQuery.data.hasNextPage}
                    onClick={() => setPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 p-8 text-center text-muted-foreground">
                <Users className="h-10 w-10" />
                <p>No patients matched your current filters.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          {summaryQuery.isLoading ? (
            <Card>
              <CardContent className="space-y-4 p-6">
                <Skeleton className="h-16 w-16 rounded-full" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ) : summaryQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load patient summary</AlertTitle>
              <AlertDescription>{(summaryQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : summaryQuery.data ? (
            <Card>
              <CardHeader>
                <CardTitle>Patient Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={summaryQuery.data.avatarUrl ?? undefined}
                      alt={summaryQuery.data.fullName}
                    />
                    <AvatarFallback>{getInitials(summaryQuery.data.fullName)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg font-semibold">{summaryQuery.data.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {[summaryQuery.data.age ? `${summaryQuery.data.age} yrs` : null, summaryQuery.data.gender]
                        .filter(Boolean)
                        .join(" - ")}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 rounded-lg border bg-muted/20 p-4 text-sm">
                  <p>Email: {summaryQuery.data.email || "Not available"}</p>
                  <p>Phone: {summaryQuery.data.phone || "Not available"}</p>
                  <p>Blood type: {summaryQuery.data.bloodType || "Not available"}</p>
                  <p>
                    Last visit: {formatDateTime(summaryQuery.data.lastVisitAt) || "Not available"}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Allergies</p>
                    <p className="text-sm text-muted-foreground">
                      {summaryQuery.data.allergies.join(", ") || "No allergies returned"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Chronic conditions</p>
                    <p className="text-sm text-muted-foreground">
                      {summaryQuery.data.chronicConditions.join(", ") || "No chronic conditions returned"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Current medications</p>
                    <p className="text-sm text-muted-foreground">
                      {summaryQuery.data.currentMedications.join(", ") || "No current medications returned"}
                    </p>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link to={`/doctor/patients/${summaryQuery.data.id}`}>Open full summary</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-muted/30">
              <CardContent className="flex flex-col items-center gap-3 p-8 text-center text-muted-foreground">
                <UserRound className="h-10 w-10" />
                <p>Select a patient to load their summary.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DoctorPatients;
