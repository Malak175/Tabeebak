import { useMemo, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { ClipboardList, Pill, User } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { patientNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientPrescriptionsQuery } from "@/hooks/usePatientProfile";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";

const formatDate = (value?: string | null) => {
  if (!value) return "Not available";

  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;

  return format(parsed, "PPP");
};

const getStatusClassName = (status?: string | null) => {
  switch ((status ?? "").toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-700 border-green-200";
    case "expired":
      return "bg-red-100 text-red-700 border-red-200";
    case "completed":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const PrescriptionCardSkeleton = () => (
  <Card>
    <CardContent className="space-y-3 p-6">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-40" />
    </CardContent>
  </Card>
);

const PatientPrescriptions = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filters = useMemo(
    () => ({
      page,
      limit: 8,
      search,
      status: status === "all" ? undefined : status,
      sortBy: "prescribedAt",
      sortOrder: "desc" as const,
    }),
    [page, search, status],
  );

  const query = usePatientPrescriptionsQuery(filters, Boolean(user));
  const userName = getDisplayName(user ?? {});

  return (
    <DashboardLayout
      userRole="patient"
      userName={userName}
      navItems={patientNavItems}
      userIcon={User}
    >
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">Prescriptions</h1>
        <p className="text-muted-foreground">
          Browse your medication history with filters and pagination.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search medication"
          />
          <Select
            value={status}
            onValueChange={(value) => {
              setPage(1);
              setStatus(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setPage(1);
              setSearch("");
              setStatus("all");
            }}
          >
            Clear Filters
          </Button>
        </CardContent>
      </Card>

      {query.isLoading ? (
        <div className="space-y-4">
          <PrescriptionCardSkeleton />
          <PrescriptionCardSkeleton />
          <PrescriptionCardSkeleton />
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
                      <Badge className={getStatusClassName(prescription.status)}>
                        {prescription.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {prescription.dosage || "Dosage not provided"} •{" "}
                      {prescription.frequency || "Frequency not provided"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Prescribed by {prescription.prescriberName || "Unknown clinician"} on{" "}
                      {formatDate(prescription.prescribedAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                      <Link to={`/patient/prescriptions/${prescription.id}`}>View details</Link>
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

export default PatientPrescriptions;
