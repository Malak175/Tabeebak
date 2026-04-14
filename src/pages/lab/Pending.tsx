import { useMemo, useState } from "react";
import { Clock, Eye, FlaskConical, Search } from "lucide-react";
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
import { useLabOrdersQuery, usePendingLabOrdersQuery } from "@/hooks/useLabWorkflow";
import { useLabProfileQuery } from "@/hooks/useLabProfile";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import { formatLabStatusLabel, isResultReadyStatus, normalizeLabOrderStatus } from "@/lib/labStatus";
import { formatDisplayDateTime } from "@/lib/date-time";

const formatDateTime = (value?: string | null) => formatDisplayDateTime(value);

const getStatusClassName = (status?: string | null) => {
  switch (normalizeLabOrderStatus(status)) {
    case "Completed":
    case "Result_Uploaded":
    case "Assigned_To_Doctor":
      return "bg-green-100 text-green-700 border-green-200";
    case "In_Progress":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Pending":
    case "Sample_Collection_Requested":
    case "Sample_Collected":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Cancelled":
    case "Rejected":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const OrdersSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, index) => (
      <Card key={index}>
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const LabPending = () => {
  const { user } = useAuth();
  const profileQuery = useLabProfileQuery(Boolean(user));
  const [activeTab, setActiveTab] = useState("orders");
  const [ordersPage, setOrdersPage] = useState(1);
  const [collectionsPage, setCollectionsPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");

  const enabled = Boolean(user);
  const userName = getDisplayName(profileQuery.data ?? user ?? {});

  const orderFilters = useMemo(
    () => ({
      page: ordersPage,
      limit: 6,
      search,
      status: status === "all" ? undefined : status,
      priority: priority === "all" ? undefined : priority,
      sortBy: "orderedAt",
      sortOrder: "desc" as const,
    }),
    [ordersPage, priority, search, status],
  );

  const collectionFilters = useMemo(
    () => ({
      page: collectionsPage,
      limit: 6,
      search,
      status: status === "all" ? ["Sample_Collection_Requested", "Sample_Collected"] : status,
      priority: priority === "all" ? undefined : priority,
      sortBy: "orderedAt",
      sortOrder: "desc" as const,
    }),
    [collectionsPage, priority, search, status],
  );

  const pendingOrdersQuery = usePendingLabOrdersQuery(orderFilters, enabled);
  const collectionOrdersQuery = useLabOrdersQuery(collectionFilters, enabled);

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
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Pending Lab Workflow</h1>
          <p className="text-muted-foreground">
            Focused view for active items that still need lab action or follow-up.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">
            {pendingOrdersQuery.data?.total ?? 0} pending orders
          </Badge>
          <Badge variant="outline">
            {collectionOrdersQuery.data?.total ?? 0} collection requests
          </Badge>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => {
                setOrdersPage(1);
                setCollectionsPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search patient, order, sample"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setOrdersPage(1);
              setCollectionsPage(1);
              setStatus(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Pending">Awaiting Review</SelectItem>
              <SelectItem value="Sample_Collection_Requested">Collection Requested</SelectItem>
              <SelectItem value="Sample_Collected">Sample Collected</SelectItem>
              <SelectItem value="In_Progress">In Progress</SelectItem>
              <SelectItem value="Result_Uploaded">Results Ready</SelectItem>
              <SelectItem value="Assigned_To_Doctor">Sent to Doctor</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={priority}
            onValueChange={(value) => {
              setOrdersPage(1);
              setCollectionsPage(1);
              setPriority(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="routine">Routine</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setOrdersPage(1);
              setCollectionsPage(1);
              setSearch("");
              setStatus("all");
              setPriority("all");
            }}
          >
            Clear filters
          </Button>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="space-y-2">
          <TabsList>
          <TabsTrigger value="orders">Active Orders</TabsTrigger>
          <TabsTrigger value="samples">Active Collections</TabsTrigger>
          </TabsList>
          <p className="text-sm text-muted-foreground">
            This view only shows items that still need lab action. For full history, use Requests or Completed.
          </p>
        </div>

        <TabsContent value="orders" className="space-y-6">
          {pendingOrdersQuery.isLoading ? (
            <OrdersSkeleton />
          ) : pendingOrdersQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load pending orders</AlertTitle>
              <AlertDescription>
                {(pendingOrdersQuery.error as Error).message}
              </AlertDescription>
            </Alert>
          ) : pendingOrdersQuery.data?.data.length ? (
            <>
              <div className="space-y-4">
                {pendingOrdersQuery.data.data.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Clock className="h-5 w-5" />
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
                          <span>Collected {formatDateTime(order.collectedAt)}</span>
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
                  Page {pendingOrdersQuery.data.page} of {pendingOrdersQuery.data.totalPages} with{" "}
                  {pendingOrdersQuery.data.total} pending orders
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!pendingOrdersQuery.data.hasPreviousPage}
                    onClick={() => setOrdersPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!pendingOrdersQuery.data.hasNextPage}
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
                No pending orders matched the current filters.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="samples" className="space-y-6">
          {collectionOrdersQuery.isLoading ? (
            <OrdersSkeleton />
          ) : collectionOrdersQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load sample collection requests</AlertTitle>
              <AlertDescription>
                {(collectionOrdersQuery.error as Error).message}
              </AlertDescription>
            </Alert>
          ) : collectionOrdersQuery.data?.data.length ? (
            <>
              <div className="space-y-4">
                {collectionOrdersQuery.data.data.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Clock className="h-5 w-5" />
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
                          <span>Doctor: {order.orderingDoctorName || "Not available"}</span>
                          <span>Patient phone: {order.patientPhone || "Not available"}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>Created {formatDateTime(order.orderedAt)}</span>
                          <span>Scheduled {formatDateTime(order.scheduledAt)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline">
                          <Link to={`/lab/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Order
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {collectionOrdersQuery.data.page} of {collectionOrdersQuery.data.totalPages} with{" "}
                  {collectionOrdersQuery.data.total} collection requests
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!collectionOrdersQuery.data.hasPreviousPage}
                    onClick={() => setCollectionsPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!collectionOrdersQuery.data.hasNextPage}
                    onClick={() => setCollectionsPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No sample collection requests matched the current filters.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default LabPending;
