import { useMemo, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { CheckCircle, ClipboardList, Eye, FileText, FlaskConical, Search } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { labNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLabOrdersQuery, useLabResultsQuery } from "@/hooks/useLabWorkflow";
import { useLabProfileQuery } from "@/hooks/useLabProfile";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import { formatLabStatusLabel, isResultReadyStatus } from "@/lib/labStatus";

const formatDateTime = (value?: string | null) => {
  if (!value) return "Not available";

  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;

  return format(parsed, "PPP p");
};

const getStatusClassName = (status?: string | null) => {
  switch ((status ?? "").toLowerCase()) {
    case "completed":
    case "ready":
    case "final":
    case "reported":
    case "delivered":
    case "result_uploaded":
    case "result-uploaded":
      return "bg-green-100 text-green-700 border-green-200";
    case "processing":
    case "review":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "cancelled":
    case "canceled":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const RecordsSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <Card key={index}>
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-60" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const LabCompleted = () => {
  const { user } = useAuth();
  const profileQuery = useLabProfileQuery(Boolean(user));
  const [activeTab, setActiveTab] = useState("results");
  const [ordersPage, setOrdersPage] = useState(1);
  const [resultsPage, setResultsPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const enabled = Boolean(user);
  const userName = getDisplayName(profileQuery.data ?? user ?? {});

  const ordersFilters = useMemo(
    () => ({
      page: ordersPage,
      limit: 6,
      search,
      status: status === "all" ? undefined : status,
      sortBy: "orderedAt",
      sortOrder: "desc" as const,
    }),
    [ordersPage, search, status],
  );

  const resultsFilters = useMemo(
    () => ({
      page: resultsPage,
      limit: 6,
      search,
      status: status === "all" ? undefined : status,
      sortBy: "reportedAt",
      sortOrder: "desc" as const,
    }),
    [resultsPage, search, status],
  );

  const ordersQuery = useLabOrdersQuery(ordersFilters, enabled);
  const resultsQuery = useLabResultsQuery(resultsFilters, enabled);

  return (
    <DashboardLayout
      userRole="laboratory"
      userName={userName}
      userSubtitle={profileQuery.data?.accreditation ?? "Laboratory account"}
      navItems={labNavItems}
      userIcon={FlaskConical}
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Orders & Results History</h1>
          <p className="text-muted-foreground">
            Browse the live lab order ledger and previously uploaded results.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">{ordersQuery.data?.total ?? 0} total orders</Badge>
          <Badge variant="outline">{resultsQuery.data?.total ?? 0} results</Badge>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => {
                setOrdersPage(1);
                setResultsPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search patient, result, order"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setOrdersPage(1);
              setResultsPage(1);
              setStatus(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="reported">Reported</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setOrdersPage(1);
              setResultsPage(1);
              setSearch("");
              setStatus("all");
            }}
          >
            Clear filters
          </Button>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="results">Results History</TabsTrigger>
          <TabsTrigger value="orders">All Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-6">
          {resultsQuery.isLoading ? (
            <RecordsSkeleton />
          ) : resultsQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load lab results</AlertTitle>
              <AlertDescription>{(resultsQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : resultsQuery.data?.data.length ? (
            <>
              <div className="space-y-4">
                {resultsQuery.data.data.map((result) => (
                  <Card key={result.id}>
                    <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{result.patientName}</h3>
                          <Badge className={getStatusClassName(result.status)}>
                            {formatLabStatusLabel(result.status)}
                          </Badge>
                          {isResultReadyStatus(result.status) ? (
                            <Badge variant="secondary">Results Ready for Analysis</Badge>
                          ) : null}
                          {result.priority ? <Badge variant="outline">{result.priority}</Badge> : null}
                        </div>
                        <p className="font-medium text-primary">{result.testName}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>Result: {result.resultNumber || result.id}</span>
                          <span>Order: {result.orderNumber || result.orderId || "Not available"}</span>
                          <span>Doctor: {result.orderingDoctorName || "Not available"}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>Collected {formatDateTime(result.collectedAt)}</span>
                          <span>Reported {formatDateTime(result.reportedAt)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {result.reportUrl ? (
                          <Button asChild variant="outline">
                            <a href={result.reportUrl} target="_blank" rel="noreferrer">
                              Open report
                            </a>
                          </Button>
                        ) : null}
                        {result.orderId ? (
                          <Button asChild variant="outline">
                            <Link to={`/lab/orders/${result.orderId}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              Order
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {resultsQuery.data.page} of {resultsQuery.data.totalPages} with{" "}
                  {resultsQuery.data.total} results
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
                No uploaded lab results matched the current filters.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          {ordersQuery.isLoading ? (
            <RecordsSkeleton />
          ) : ordersQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load lab orders</AlertTitle>
              <AlertDescription>{(ordersQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : ordersQuery.data?.data.length ? (
            <>
              <div className="space-y-4">
                {ordersQuery.data.data.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {order.hasResult ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <ClipboardList className="h-5 w-5" />
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{order.patientName}</h3>
                          <Badge className={getStatusClassName(order.status)}>
                            {formatLabStatusLabel(order.status)}
                          </Badge>
                          {isResultReadyStatus(order.status) ? (
                            <Badge variant="secondary">Results Ready for Analysis</Badge>
                          ) : null}
                          {order.priority ? <Badge variant="outline">{order.priority}</Badge> : null}
                        </div>
                        <p className="font-medium text-primary">{order.testName}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>Order: {order.orderNumber || order.id}</span>
                          <span>Sample: {order.sampleId || "Pending assignment"}</span>
                          <span>Doctor: {order.orderingDoctorName || "Not available"}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>Ordered {formatDateTime(order.orderedAt)}</span>
                          <span>Completed {formatDateTime(order.completedAt)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                          <Link to={`/lab/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Details
                          </Link>
                        </Button>
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
                No lab orders matched the current filters.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default LabCompleted;
