import { useMemo, useState } from "react";
import { ClipboardList, Pill, Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { doctorNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctorPrescriptionsQuery } from "@/hooks/useDoctorWorkflow";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import { formatDisplayDate } from "@/lib/date-time";

const formatDateValue = (value?: string | null) => formatDisplayDate(value);

const DoctorPrescriptions = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const userName = getDisplayName(user ?? {});

  const filters = useMemo(
    () => ({
      page,
      limit: 8,
      search,
      sortBy: "prescribedAt",
      sortOrder: "desc" as const,
    }),
    [page, search],
  );

  const query = useDoctorPrescriptionsQuery(filters, Boolean(user));

  return (
    <DashboardLayout
      userRole="doctor"
      userName={userName}
      userSubtitle="Doctor account"
      navItems={doctorNavItems}
      userIcon={Stethoscope}
    >
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">Prescriptions</h1>
        <p className="text-muted-foreground">
          Browse prescription history with filters and pagination.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search medication or patient"
          />
          <Button
            variant="outline"
            onClick={() => {
              setPage(1);
              setSearch("");
            }}
          >
            Clear filters
          </Button>
        </CardContent>
      </Card>

      {query.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load prescriptions</AlertTitle>
          <AlertDescription>{(query.error as Error).message}</AlertDescription>
        </Alert>
      ) : query.data?.data.length ? (
        <div className="space-y-6">
          <div className="grid gap-4">
            {query.data.data.map((prescription) => (
              <Card key={prescription.id}>
                <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{prescription.medicationName}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Patient: {prescription.patientName || "Unknown patient"} -{" "}
                      {prescription.dosage || "Dosage not provided"} -{" "}
                      {prescription.frequency || "Frequency not provided"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Prescribed on {formatDateValue(prescription.prescribedAt)} - Expires{" "}
                      {formatDateValue(prescription.expiresAt)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {prescription.instructions || prescription.notes || "No instructions returned"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                      <Link to={`/doctor/prescriptions/${prescription.id}`}>View details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {query.data.page} of {query.data.totalPages} with {query.data.total} total prescriptions
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!query.data.hasPreviousPage}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!query.data.hasNextPage}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center text-muted-foreground">
            <ClipboardList className="h-10 w-10" />
            <p>No prescriptions matched your current filters.</p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default DoctorPrescriptions;
