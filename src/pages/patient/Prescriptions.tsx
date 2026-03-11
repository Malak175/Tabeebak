import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { usePatientPrescriptionsQuery } from "@/hooks/usePatientRecords";
import { patientNavItems } from "@/pages/patient/navigation";
import type { Prescription } from "@/types/patient-records.types";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Pill,
  User,
} from "lucide-react";

const toPageNumber = (value: string | null, fallback = 1) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const formatDate = (value?: string) => {
  if (!value) return "Date unavailable";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

const getStatusColor = (status?: string) => {
  switch ((status ?? "").toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-700";
    case "completed":
      return "bg-muted text-muted-foreground";
    case "expired":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-primary/10 text-primary";
  }
};

const PrescriptionCard = ({ prescription }: { prescription: Prescription }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold">
                {prescription.medications[0]?.name ?? "Prescription"}
              </h3>
              <Badge className={getStatusColor(prescription.status)}>
                {prescription.status ?? "issued"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Issued on {formatDate(prescription.prescribedAt)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Prescribed by {prescription.doctorName ?? "assigned doctor"}
            </p>
            {prescription.diagnosis && (
              <p className="mt-3 text-sm text-muted-foreground">{prescription.diagnosis}</p>
            )}
            {prescription.medications.length > 1 && (
              <p className="mt-2 text-sm text-muted-foreground">
                Includes {prescription.medications.length} medications
              </p>
            )}
          </div>
        </div>
        <Button asChild variant="outline">
          <Link to={`/patient/prescriptions/${prescription.id}`}>View Details</Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);

const PatientPrescriptions = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(
    () => ({
      page: toPageNumber(searchParams.get("page")),
      limit: toPageNumber(searchParams.get("limit"), 10),
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      prescribedFrom: searchParams.get("prescribedFrom") ?? undefined,
      prescribedTo: searchParams.get("prescribedTo") ?? undefined,
    }),
    [searchParams],
  );
  const prescriptionsQuery = usePatientPrescriptionsQuery(filters);

  const updateSearchParam = (name: string, value?: string) => {
    const next = new URLSearchParams(searchParams);

    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }

    if (name !== "page") {
      next.set("page", "1");
    }

    setSearchParams(next);
  };

  return (
    <DashboardLayout
      userRole="patient"
      userName={user?.name ?? "Patient"}
      navItems={patientNavItems}
      userIcon={User}
    >
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">Prescriptions</h1>
        <p className="text-muted-foreground">
          Review active and historical prescriptions from the backend.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            placeholder="Search medication"
            value={searchParams.get("search") ?? ""}
            onChange={(event) => updateSearchParam("search", event.target.value)}
          />
          <Select
            value={searchParams.get("status") ?? "all"}
            onValueChange={(value) =>
              updateSearchParam("status", value === "all" ? undefined : value)
            }
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
          <Input
            type="date"
            value={searchParams.get("prescribedFrom") ?? ""}
            onChange={(event) => updateSearchParam("prescribedFrom", event.target.value)}
          />
          <Input
            type="date"
            value={searchParams.get("prescribedTo") ?? ""}
            onChange={(event) => updateSearchParam("prescribedTo", event.target.value)}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {prescriptionsQuery.isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton className="h-32 w-full" key={index} />
          ))
        ) : prescriptionsQuery.isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Prescriptions unavailable</AlertTitle>
            <AlertDescription>{prescriptionsQuery.error.message}</AlertDescription>
          </Alert>
        ) : (prescriptionsQuery.data?.items ?? []).length ? (
          prescriptionsQuery.data?.items.map((prescription) => (
            <PrescriptionCard key={prescription.id} prescription={prescription} />
          ))
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No prescriptions found</AlertTitle>
            <AlertDescription>
              Your prescriptions will appear here once they are issued.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border bg-card p-4 md:flex-row md:items-center">
        <p className="text-sm text-muted-foreground">
          Showing page {prescriptionsQuery.data?.page ?? 1} of{" "}
          {prescriptionsQuery.data?.totalPages ?? 1}.
        </p>
        <div className="flex gap-2">
          <Button
            disabled={!prescriptionsQuery.data?.hasPreviousPage}
            onClick={() =>
              updateSearchParam("page", String((prescriptionsQuery.data?.page ?? 1) - 1))
            }
            variant="outline"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            disabled={!prescriptionsQuery.data?.hasNextPage}
            onClick={() =>
              updateSearchParam("page", String((prescriptionsQuery.data?.page ?? 1) + 1))
            }
            variant="outline"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientPrescriptions;
