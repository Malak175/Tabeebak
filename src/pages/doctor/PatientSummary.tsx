import { Link, useParams } from "react-router-dom";
import { Activity, Mail, Phone, Stethoscope } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { doctorNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctorPatientSummaryQuery } from "@/hooks/useDoctorWorkflow";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName, getInitials } from "@/lib/auth";
import { formatDisplayDate } from "@/lib/date-time";

const formatDateValue = (value?: string | null) => formatDisplayDate(value);

const SummaryList = ({ title, items }: { title: string; items: string[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {items.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No data returned yet.</p>
      )}
    </CardContent>
  </Card>
);

const DoctorPatientSummary = () => {
  const { patientId } = useParams();
  const { user } = useAuth();
  const query = useDoctorPatientSummaryQuery(patientId, Boolean(user));
  const userName = getDisplayName(user ?? {});

  return (
    <DashboardLayout
      userRole="doctor"
      userName={userName}
      userSubtitle="Doctor account"
      navItems={doctorNavItems}
      userIcon={Stethoscope}
    >
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Patient Summary</h1>
          <p className="text-muted-foreground">
            Doctor-facing summary loaded by patient id from the healthcare workflow API.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/doctor/patients">Back to patients</Link>
        </Button>
      </div>

      {query.isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load patient summary</AlertTitle>
          <AlertDescription>
            {(query.error as Error).message}
            <Button variant="outline" size="sm" className="mt-3" onClick={() => void query.refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : query.data ? (
        <div className="space-y-6">
          <Card>
            <CardContent className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={query.data.avatarUrl ?? undefined} alt={query.data.fullName} />
                  <AvatarFallback>{getInitials(query.data.fullName)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-semibold">{query.data.fullName}</h2>
                  <p className="text-sm text-muted-foreground">
                    {[query.data.age ? `${query.data.age} yrs` : null, query.data.gender]
                      .filter(Boolean)
                      .join(" - ")}
                  </p>
                </div>
              </div>

              <div className="grid gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {query.data.email || "Email not available"}
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {query.data.phone || "Phone not available"}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Clinical Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">Date of birth</p>
                  <p className="mt-1 font-medium">{formatDateValue(query.data.dateOfBirth)}</p>
                </div>
                <div className="rounded-lg border bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">Blood type</p>
                  <p className="mt-1 font-medium">{query.data.bloodType || "Not available"}</p>
                </div>
                <div className="rounded-lg border bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">Last visit</p>
                  <p className="mt-1 font-medium">{formatDateValue(query.data.lastVisitAt)}</p>
                </div>
                <div className="rounded-lg border bg-muted/20 p-4">
                  <p className="text-sm text-muted-foreground">Latest diagnoses</p>
                  <p className="mt-1 font-medium">
                    {query.data.recentDiagnoses.join(", ") || "No diagnoses returned"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Latest Vitals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Blood pressure</span>
                  <span>{query.data.latestVitals?.bloodPressure || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Heart rate</span>
                  <span>
                    {query.data.latestVitals?.heartRate != null
                      ? `${query.data.latestVitals.heartRate} bpm`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Temperature</span>
                  <span>
                    {query.data.latestVitals?.temperatureC != null
                      ? `${query.data.latestVitals.temperatureC} C`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Weight</span>
                  <span>
                    {query.data.latestVitals?.weightKg != null
                      ? `${query.data.latestVitals.weightKg} kg`
                      : "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <SummaryList title="Allergies" items={query.data.allergies} />
            <SummaryList title="Chronic Conditions" items={query.data.chronicConditions} />
            <SummaryList title="Current Medications" items={query.data.currentMedications} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {query.data.notes || "No notes were returned for this patient summary yet."}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Patient summary was not returned for this record.
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default DoctorPatientSummary;
