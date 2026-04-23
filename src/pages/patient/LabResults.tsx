import { useMemo, useState } from "react";
import { ClipboardList, Download, FlaskConical, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OrderTimeline from "@/components/patient/OrderTimeline";
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
import {
  formatLabStatusLabel,
  getLabStatusBadgeClassName,
  isPatientResultVisibleStatus,
} from "@/lib/labStatus";

const formatDate = (value?: string | null) => formatDisplayDate(value);

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
  const visibleResults = useMemo(
    () =>
      (resultsQuery.data?.data ?? []).filter((result) =>
        isPatientResultVisibleStatus(result.orderStatus ?? result.status),
      ),
    [resultsQuery.data?.data],
  );
  const hiddenResultsCount = (resultsQuery.data?.data.length ?? 0) - visibleResults.length;

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
              <SelectItem value="PENDING">{formatLabStatusLabel("PENDING")}</SelectItem>
              <SelectItem value="SAMPLE_COLLECTION_REQUESTED">
                {formatLabStatusLabel("SAMPLE_COLLECTION_REQUESTED")}
              </SelectItem>
              <SelectItem value="SAMPLE_COLLECTED">{formatLabStatusLabel("SAMPLE_COLLECTED")}</SelectItem>
              <SelectItem value="IN_PROGRESS">{formatLabStatusLabel("IN_PROGRESS")}</SelectItem>
              <SelectItem value="RESULT_UPLOADED">{formatLabStatusLabel("RESULT_UPLOADED")}</SelectItem>
              <SelectItem value="COMPLETED">{formatLabStatusLabel("COMPLETED")}</SelectItem>
              <SelectItem value="REJECTED">{formatLabStatusLabel("REJECTED")}</SelectItem>
              <SelectItem value="CANCELLED">{formatLabStatusLabel("CANCELLED")}</SelectItem>
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
              <AlertDescription>
                {(resultsQuery.error as Error).message}
                <Button variant="outline" size="sm" className="mt-3" onClick={() => void resultsQuery.refetch()}>
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          ) : visibleResults.length ? (
            <>
              {hiddenResultsCount > 0 ? (
                <Alert>
                  <AlertTitle>Some results are not visible yet</AlertTitle>
                  <AlertDescription>
                    {hiddenResultsCount} result record(s) are hidden until the related order reaches Result Uploaded.
                  </AlertDescription>
                </Alert>
              ) : null}
              <div className="grid gap-4">
                {visibleResults.map((result) => {
                  const resolvedId = String(result.id ?? "").trim();
                  const route = `/patient/lab-results/${resolvedId}`;

                  return (
                  <Card key={result.id}>
                    <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <FlaskConical className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{result.testName}</h3>
                          <Badge className={getLabStatusBadgeClassName(result.status)}>
                            {formatLabStatusLabel(result.status)}
                          </Badge>
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
                          disabled={!resolvedId}
                          onClick={() => {
                            if (!resolvedId) return;
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
                  {visibleResults.length} visible published result(s)
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
                No visible lab results matched your current filters.
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
              <AlertDescription>
                {(ordersQuery.error as Error).message}
                <Button variant="outline" size="sm" className="mt-3" onClick={() => void ordersQuery.refetch()}>
                  Retry
                </Button>
              </AlertDescription>
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
                          <Badge className={getLabStatusBadgeClassName(order.status)}>
                            {formatLabStatusLabel(order.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {order.category || "Uncategorized"} • Ordered on {formatDate(order.orderedAt)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.orderingDoctorName || "Unknown clinician"} •{" "}
                          {order.laboratoryName || "Laboratory pending"}
                        </p>
                        <OrderTimeline status={order.status} />
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


