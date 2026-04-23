import { useMemo, useState } from "react";
import { Archive, Eye, FileText, FlaskConical, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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
import { useLabOrdersQuery } from "@/hooks/useLabWorkflow";
import { useLabProfileQuery } from "@/hooks/useLabProfile";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import {
  formatLabStatusLabel,
  getLabStatusBadgeClassName,
  getLabStatusesForBucket,
} from "@/lib/labStatus";
import { formatDisplayDateTime } from "@/lib/date-time";

const formatDateTime = (value?: string | null) => formatDisplayDateTime(value);

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
  const location = useLocation();
  const { user } = useAuth();
  const profileQuery = useLabProfileQuery(Boolean(user));
  const [activeTab, setActiveTab] = useState("resultsReady");
  const [resultsReadyPage, setResultsReadyPage] = useState(1);
  const [archivePage, setArchivePage] = useState(1);
  const [search, setSearch] = useState("");
  const [archiveStatus, setArchiveStatus] = useState("all");

  const enabled = Boolean(user);
  const userName = getDisplayName(profileQuery.data ?? user ?? {});
  const resultsReadyStatuses = getLabStatusesForBucket("resultsReady");
  const archiveStatuses = getLabStatusesForBucket("archive");

  const resultsReadyFilters = useMemo(
    () => ({
      page: resultsReadyPage,
      limit: 8,
      search,
      status: resultsReadyStatuses[0],
      sortBy: "orderedAt",
      sortOrder: "desc" as const,
    }),
    [resultsReadyPage, resultsReadyStatuses, search],
  );

  const archiveFilters = useMemo(
    () => ({
      page: archivePage,
      limit: 8,
      search,
      status: archiveStatus === "all" ? archiveStatuses : archiveStatus,
      sortBy: "completedAt",
      sortOrder: "desc" as const,
    }),
    [archivePage, archiveStatuses, archiveStatus, search],
  );

  const resultsReadyQuery = useLabOrdersQuery(resultsReadyFilters, enabled);
  const archiveQuery = useLabOrdersQuery(archiveFilters, enabled);

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
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Results Ready & Archive</h1>
          <p className="text-muted-foreground">
            Finalized work stages: uploaded results and archived outcomes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">{resultsReadyQuery.data?.total ?? 0} results ready</Badge>
          <Badge variant="outline">{archiveQuery.data?.total ?? 0} archived</Badge>
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
                setResultsReadyPage(1);
                setArchivePage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search patient, order, or test"
            />
          </div>
          <Select
            value={archiveStatus}
            onValueChange={(value) => {
              setArchivePage(1);
              setArchiveStatus(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Archive status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All archive statuses</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setResultsReadyPage(1);
              setArchivePage(1);
              setSearch("");
              setArchiveStatus("all");
            }}
          >
            Clear filters
          </Button>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="resultsReady">Results Ready</TabsTrigger>
          <TabsTrigger value="archive">Archive</TabsTrigger>
        </TabsList>

        <TabsContent value="resultsReady" className="space-y-6">
          {resultsReadyQuery.isLoading ? (
            <RecordsSkeleton />
          ) : resultsReadyQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load results-ready orders</AlertTitle>
              <AlertDescription>{(resultsReadyQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : resultsReadyQuery.data?.data.length ? (
            <div className="space-y-6">
              <div className="space-y-4">
                {resultsReadyQuery.data.data.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                        <FileText className="h-5 w-5" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{order.patientName}</h3>
                          <Badge className={getLabStatusBadgeClassName(order.status)}>
                            {formatLabStatusLabel(order.status)}
                          </Badge>
                          {order.priority ? <Badge variant="outline">{order.priority}</Badge> : null}
                        </div>
                        <p className="font-medium text-primary">{order.testName}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>Order: {order.orderNumber || order.id}</span>
                          <span>Doctor: {order.orderingDoctorName || "Not available"}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>Ordered {formatDateTime(order.orderedAt)}</span>
                          <span>Uploaded {formatDateTime(order.completedAt)}</span>
                        </div>
                      </div>

                      <Button asChild variant="outline">
                        <Link
                          to={`/lab/orders/${order.id}`}
                          state={{ fromPath: `${location.pathname}${location.search}`, fromLabel: "Results Ready" }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Open
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {resultsReadyQuery.data.page} of {resultsReadyQuery.data.totalPages} with {resultsReadyQuery.data.total} results-ready orders
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!resultsReadyQuery.data.hasPreviousPage}
                    onClick={() => setResultsReadyPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!resultsReadyQuery.data.hasNextPage}
                    onClick={() => setResultsReadyPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No orders are currently waiting in Results Ready.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="archive" className="space-y-6">
          {archiveQuery.isLoading ? (
            <RecordsSkeleton />
          ) : archiveQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load archived orders</AlertTitle>
              <AlertDescription>{(archiveQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : archiveQuery.data?.data.length ? (
            <div className="space-y-6">
              <div className="space-y-4">
                {archiveQuery.data.data.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/40 text-muted-foreground">
                        <Archive className="h-5 w-5" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{order.patientName}</h3>
                          <Badge className={getLabStatusBadgeClassName(order.status)}>
                            {formatLabStatusLabel(order.status)}
                          </Badge>
                          {order.priority ? <Badge variant="outline">{order.priority}</Badge> : null}
                        </div>
                        <p className="font-medium text-primary">{order.testName}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>Order: {order.orderNumber || order.id}</span>
                          <span>Doctor: {order.orderingDoctorName || "Not available"}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>Ordered {formatDateTime(order.orderedAt)}</span>
                          <span>Closed {formatDateTime(order.completedAt)}</span>
                        </div>
                      </div>

                      <Button asChild variant="outline">
                        <Link
                          to={`/lab/orders/${order.id}`}
                          state={{ fromPath: `${location.pathname}${location.search}`, fromLabel: "Archive" }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Details
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {archiveQuery.data.page} of {archiveQuery.data.totalPages} with {archiveQuery.data.total} archived orders
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!archiveQuery.data.hasPreviousPage}
                    onClick={() => setArchivePage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!archiveQuery.data.hasNextPage}
                    onClick={() => setArchivePage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No archived orders matched the current filters.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default LabCompleted;
