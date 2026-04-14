import { useMemo, useState } from "react";
import { ClipboardList, Download, FlaskConical, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { patientNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  usePatientLabOrdersQuery,
  usePatientLabResultsQuery,
} from "@/hooks/usePatientProfile";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import { formatDisplayDate } from "@/lib/date-time";

const formatDate = (value?: string | null) => formatDisplayDate(value);

const getStatusClassName = (status?: string | null) => {
  switch ((status ?? "").toLowerCase()) {
    case "completed":
    case "final":
    case "ready":
      return "bg-green-100 text-green-700 border-green-200";
    case "pending":
    case "processing":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "cancelled":
    case "canceled":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const RecordCardSkeleton = () => (
  <Card>
    <CardContent className="space-y-3 p-6">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-4 w-44" />
    </CardContent>
  </Card>
);

const PatientLabResults = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("results");
  const [resultsPage, setResultsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const resultsFilters = useMemo(
    () => ({
      page: resultsPage,
      limit: 8,
      search,
      status: status === "all" ? undefined : status,
      sortBy: "reportedAt",
      sortOrder: "desc" as const,
    }),
    [resultsPage, search, status],
  );

  const ordersFilters = useMemo(
    () => ({
      page: ordersPage,
      limit: 8,
      search,
      status: status === "all" ? undefined : status,
      sortBy: "orderedAt",
      sortOrder: "desc" as const,
    }),
    [ordersPage, search, status],
  );

  const enabled = Boolean(user);
  const resultsQuery = usePatientLabResultsQuery(resultsFilters, enabled);
  const ordersQuery = usePatientLabOrdersQuery(ordersFilters, enabled);
  const userName = getDisplayName(user ?? {});
  const resolveResultId = (result: Record<string, unknown>) => {
    const topLevel =
      (result.id as string | undefined) ||
      (result.resultId as string | undefined) ||
      (result.laboratoryResultId as string | undefined) ||
      (result.laboratory_result_id as string | undefined) ||
      (result.labResultId as string | undefined) ||
      (result.lab_result_id as string | undefined);
    if (topLevel) return topLevel;

    const nestedCandidates = [
      result.laboratory_result,
      result.laboratoryResult,
      result.result,
      result.lab_result,
      result.labResult,
    ];

    for (const candidate of nestedCandidates) {
      if (!candidate || typeof candidate !== "object") continue;
      const record = candidate as Record<string, unknown>;
      const nestedId =
        (record.id as string | undefined) ||
        (record.resultId as string | undefined) ||
        (record.laboratoryResultId as string | undefined) ||
        (record.laboratory_result_id as string | undefined) ||
        (record.labResultId as string | undefined) ||
        (record.lab_result_id as string | undefined);
      if (nestedId) return nestedId;
    }

    return "";
  };

  if (resultsQuery.data?.data?.length) {
    const first = resultsQuery.data.data[0] as unknown as Record<string, unknown>;
    const resolvedId = resolveResultId(first);
    const route = `/patient/lab-results/${resolvedId}`;
    console.warn("[LabResults][First Rendered Item]", first);
    console.warn("[LabResults][First Resolved Id]", resolvedId);
    console.warn("[LabResults][First Route]", route);
  }

  return (
    <DashboardLayout
      userRole="patient"
      userName={userName}
      navItems={patientNavItems}
      userIcon={User}
    >
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">Lab Results & Orders</h1>
        <p className="text-muted-foreground">
          Track your lab results and orders, with filters to help you find what you need.
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
              setResultsPage(1);
              setOrdersPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search test name"
          />
          <Select
            value={status}
            onValueChange={(value) => {
              setResultsPage(1);
              setOrdersPage(1);
              setStatus(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setResultsPage(1);
              setOrdersPage(1);
              setSearch("");
              setStatus("all");
            }}
          >
            Clear Filters
          </Button>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="results">Lab Results</TabsTrigger>
          <TabsTrigger value="orders">Lab Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-6">
          {resultsQuery.isLoading ? (
            <div className="space-y-4">
              <RecordCardSkeleton />
              <RecordCardSkeleton />
              <RecordCardSkeleton />
            </div>
          ) : resultsQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load lab results</AlertTitle>
              <AlertDescription>{(resultsQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : resultsQuery.data?.data.length ? (
            <>
              <div className="grid gap-4">
                {resultsQuery.data.data.map((result) => {
                  const resolvedId = resolveResultId(result as unknown as Record<string, unknown>);
                  const route = `/patient/lab-results/${resolvedId}`;
                  console.warn("[LabResults][Rendered Item]", result);
                  console.warn("[LabResults][Resolved Id]", resolvedId);
                  console.warn("[LabResults][Route]", route);

                  return (
                  <Card key={result.id}>
                    <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <FlaskConical className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{result.testName}</h3>
                          <Badge className={getStatusClassName(result.status)}>{result.status}</Badge>
                          {result.isAbnormal ? <Badge variant="destructive">Abnormal</Badge> : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {result.category || "Uncategorized"} • {result.laboratoryName || "Lab pending"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Result date {formatDate(result.reportedAt)} by{" "}
                          {result.orderingDoctorName || "Unknown clinician"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            console.warn("[LabResults][Details Click] Result:", result);
                            console.warn("[LabResults][Details Click] Resolved Id:", resolvedId);
                            if (!resolvedId) {
                              console.warn("[LabResults][Details Click] Missing result id; not navigating.");
                              return;
                            }
                            navigate(route);
                          }}
                        >
                          View details
                        </Button>
                        {result.reportUrl ? (
                          <Button asChild variant="outline">
                            <a href={result.reportUrl} target="_blank" rel="noreferrer">
                              <Download className="mr-2 h-4 w-4" />
                              Open Full Report
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                );
                })}
              </div>

              <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {resultsQuery.data.page} of {resultsQuery.data.totalPages} with{" "}
                  {resultsQuery.data.total} total results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!resultsQuery.data.hasPreviousPage}
                    onClick={() => setResultsPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!resultsQuery.data.hasNextPage}
                    onClick={() => setResultsPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No lab results matched your current filters.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          {ordersQuery.isLoading ? (
            <div className="space-y-4">
              <RecordCardSkeleton />
              <RecordCardSkeleton />
              <RecordCardSkeleton />
            </div>
          ) : ordersQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load lab orders</AlertTitle>
              <AlertDescription>{(ordersQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : ordersQuery.data?.data.length ? (
            <>
              <div className="grid gap-4">
                {ordersQuery.data.data.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <ClipboardList className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{order.testName}</h3>
                          <Badge className={getStatusClassName(order.status)}>{order.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.category || "Uncategorized"} • Ordered on {formatDate(order.orderedAt)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.orderingDoctorName || "Unknown clinician"} •{" "}
                          {order.laboratoryName || "Laboratory pending"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {ordersQuery.data.page} of {ordersQuery.data.totalPages} with{" "}
                  {ordersQuery.data.total} total orders
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!ordersQuery.data.hasPreviousPage}
                    onClick={() => setOrdersPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!ordersQuery.data.hasNextPage}
                    onClick={() => setOrdersPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No lab orders matched your current filters.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default PatientLabResults;


