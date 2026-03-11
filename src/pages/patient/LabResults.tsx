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
import { usePatientLabResultsQuery } from "@/hooks/usePatientRecords";
import { patientNavItems } from "@/pages/patient/navigation";
import type { LabResult } from "@/types/patient-records.types";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  FlaskConical,
  Minus,
  TrendingDown,
  TrendingUp,
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
    case "normal":
    case "completed":
      return "bg-green-100 text-green-700";
    case "attention":
    case "high":
    case "abnormal":
      return "bg-yellow-100 text-yellow-700";
    case "low":
      return "bg-blue-100 text-blue-700";
    case "critical":
      return "bg-red-100 text-red-700";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusIcon = (status?: string) => {
  switch ((status ?? "").toLowerCase()) {
    case "high":
    case "abnormal":
      return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    case "low":
      return <TrendingDown className="h-4 w-4 text-blue-600" />;
    default:
      return <Minus className="h-4 w-4 text-green-600" />;
  }
};

const ResultCard = ({ result }: { result: LabResult }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              result.status?.toLowerCase() === "normal"
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            <FlaskConical className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{result.testName}</h3>
            <p className="text-sm text-muted-foreground">
              {[formatDate(result.resultDate), result.labName].filter(Boolean).join(" | ")}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ordered by {result.doctorName ?? "assigned doctor"}
            </p>
            {result.summary && (
              <p className="mt-3 text-sm text-muted-foreground">{result.summary}</p>
            )}
            {!!result.measurements.length && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {result.measurements.slice(0, 4).map((measurement) => (
                  <div className="rounded-lg bg-muted/50 p-3" key={measurement.id}>
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium">{measurement.name}</span>
                      {getStatusIcon(measurement.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {[measurement.value, measurement.unit].filter(Boolean).join(" ")}
                    </div>
                    {measurement.range && (
                      <div className="text-xs text-muted-foreground">
                        Range: {measurement.range}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <Badge className={getStatusColor(result.status)}>{result.status ?? "ready"}</Badge>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to={`/patient/lab-results/${result.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </Link>
            </Button>
            {result.fileUrl && (
              <Button asChild size="sm" variant="ghost">
                <a href={result.fileUrl} rel="noreferrer" target="_blank">
                  <Download className="mr-2 h-4 w-4" />
                  Report
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const PatientLabResults = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(
    () => ({
      page: toPageNumber(searchParams.get("page")),
      limit: toPageNumber(searchParams.get("limit"), 10),
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      resultFrom: searchParams.get("resultFrom") ?? undefined,
      resultTo: searchParams.get("resultTo") ?? undefined,
    }),
    [searchParams],
  );
  const labResultsQuery = usePatientLabResultsQuery(filters);

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
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">Lab Results</h1>
        <p className="text-muted-foreground">
          View completed results and open each report for full details.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            placeholder="Search test name"
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
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="abnormal">Abnormal</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={searchParams.get("resultFrom") ?? ""}
            onChange={(event) => updateSearchParam("resultFrom", event.target.value)}
          />
          <Input
            type="date"
            value={searchParams.get("resultTo") ?? ""}
            onChange={(event) => updateSearchParam("resultTo", event.target.value)}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {labResultsQuery.isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton className="h-56 w-full" key={index} />
          ))
        ) : labResultsQuery.isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lab results unavailable</AlertTitle>
            <AlertDescription>{labResultsQuery.error.message}</AlertDescription>
          </Alert>
        ) : (labResultsQuery.data?.items ?? []).length ? (
          labResultsQuery.data?.items.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))
        ) : (
          <Card className="bg-muted/30">
            <CardContent className="p-8 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                No lab results matched the current filters.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border bg-card p-4 md:flex-row md:items-center">
        <p className="text-sm text-muted-foreground">
          Showing page {labResultsQuery.data?.page ?? 1} of {labResultsQuery.data?.totalPages ?? 1}.
        </p>
        <div className="flex gap-2">
          <Button
            disabled={!labResultsQuery.data?.hasPreviousPage}
            onClick={() =>
              updateSearchParam("page", String((labResultsQuery.data?.page ?? 1) - 1))
            }
            variant="outline"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            disabled={!labResultsQuery.data?.hasNextPage}
            onClick={() =>
              updateSearchParam("page", String((labResultsQuery.data?.page ?? 1) + 1))
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

export default PatientLabResults;
