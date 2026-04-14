import { useState } from "react";
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
import { useLabOrdersQuery } from "@/hooks/useLabWorkflow";
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

const STATUS_GROUPS = {
  needsReview: ["Pending"],
  collection: ["Sample_Collection_Requested", "Sample_Collected"],
  inProgress: ["In_Progress"],
  resultsReady: ["Result_Uploaded", "Assigned_To_Doctor"],
  completed: ["Completed"],
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

const LabRequestsPage = () => {
  const { user } = useAuth();
  const profileQuery = useLabProfileQuery(Boolean(user));
  const [activeTab, setActiveTab] = useState("all");
  const [allPage, setAllPage] = useState(1);
  const [needsReviewPage, setNeedsReviewPage] = useState(1);
  const [collectionPage, setCollectionPage] = useState(1);
  const [inProgressPage, setInProgressPage] = useState(1);
  const [resultsReadyPage, setResultsReadyPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");

  const enabled = Boolean(user);
  const userName = getDisplayName(profileQuery.data ?? user ?? {});

  const resolveStatusFilter = (group?: string[] | null) => {
    if (group && group.length) return group.length === 1 ? group[0] : group;
    if (status === "all") return undefined;
    return status;
  };

  const buildFilters = (page: number, group?: string[] | null) => ({
    page,
    limit: 6,
    search,
    status: resolveStatusFilter(group),
    priority: priority === "all" ? undefined : priority,
    sortBy: "orderedAt",
    sortOrder: "desc" as const,
  });

  const allOrdersQuery = useLabOrdersQuery(buildFilters(allPage), enabled);
  const needsReviewQuery = useLabOrdersQuery(buildFilters(needsReviewPage, STATUS_GROUPS.needsReview), enabled);
  const collectionQuery = useLabOrdersQuery(buildFilters(collectionPage, STATUS_GROUPS.collection), enabled);
  const inProgressQuery = useLabOrdersQuery(buildFilters(inProgressPage, STATUS_GROUPS.inProgress), enabled);
  const resultsReadyQuery = useLabOrdersQuery(buildFilters(resultsReadyPage, STATUS_GROUPS.resultsReady), enabled);
  const completedQuery = useLabOrdersQuery(buildFilters(completedPage, STATUS_GROUPS.completed), enabled);

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
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Patient Lab Requests</h1>
          <p className="text-muted-foreground">
            The inbox shows every request across statuses. Use the tabs to focus by workflow stage.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">{allOrdersQuery.data?.total ?? 0} total requests</Badge>
          <Badge variant="outline">{needsReviewQuery.data?.total ?? 0} needs review</Badge>
          <Badge variant="outline">{collectionQuery.data?.total ?? 0} collection</Badge>
          <Badge variant="outline">{inProgressQuery.data?.total ?? 0} in progress</Badge>
          <Badge variant="outline">{resultsReadyQuery.data?.total ?? 0} results ready</Badge>
          <Badge variant="outline">{completedQuery.data?.total ?? 0} completed</Badge>
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
                setAllPage(1);
                setNeedsReviewPage(1);
                setCollectionPage(1);
                setInProgressPage(1);
                setResultsReadyPage(1);
                setCompletedPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search patient, order, or test"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setAllPage(1);
              setNeedsReviewPage(1);
              setCollectionPage(1);
              setInProgressPage(1);
              setResultsReadyPage(1);
              setCompletedPage(1);
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
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={priority}
            onValueChange={(value) => {
              setAllPage(1);
              setNeedsReviewPage(1);
              setCollectionPage(1);
              setInProgressPage(1);
              setResultsReadyPage(1);
              setCompletedPage(1);
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
              setAllPage(1);
              setNeedsReviewPage(1);
              setCollectionPage(1);
              setInProgressPage(1);
              setResultsReadyPage(1);
              setCompletedPage(1);
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
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="needsReview">Needs Review</TabsTrigger>
            <TabsTrigger value="collection">Collection Requests</TabsTrigger>
            <TabsTrigger value="inProgress">Pending Tests</TabsTrigger>
            <TabsTrigger value="resultsReady">Results Ready</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-6">
          {allOrdersQuery.isLoading ? (
            <OrdersSkeleton />
          ) : allOrdersQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load lab requests</AlertTitle>
              <AlertDescription>{(allOrdersQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : allOrdersQuery.data?.data.length ? (
            <>
              <div className="space-y-4">
                {allOrdersQuery.data.data.map((order) => (
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

                      <Button asChild variant="outline">
                        <Link to={`/lab/requests/${order.id}`}>
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
                  Page {allOrdersQuery.data.page} of {allOrdersQuery.data.totalPages} with {allOrdersQuery.data.total} total requests
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!allOrdersQuery.data.hasPreviousPage}
                    onClick={() => setAllPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!allOrdersQuery.data.hasNextPage}
                    onClick={() => setAllPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No patient lab requests matched the current filters.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="needsReview" className="space-y-6">
          {needsReviewQuery.isLoading ? (
            <OrdersSkeleton />
          ) : needsReviewQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load pending requests</AlertTitle>
              <AlertDescription>{(needsReviewQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : needsReviewQuery.data?.data.length ? (
            <>
              <div className="space-y-4">
                {needsReviewQuery.data.data.map((order) => (
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
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span>Created {formatDateTime(order.orderedAt)}</span>
                          <span>Selected service: {order.serviceName || order.testName}</span>
                        </div>
                      </div>

                      <Button asChild variant="outline">
                        <Link to={`/lab/requests/${order.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Review
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {needsReviewQuery.data.page} of {needsReviewQuery.data.totalPages} with {needsReviewQuery.data.total} pending requests
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!needsReviewQuery.data.hasPreviousPage}
                    onClick={() => setNeedsReviewPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!needsReviewQuery.data.hasNextPage}
                    onClick={() => setNeedsReviewPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No pending lab requests matched the current filters.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="collection" className="space-y-6">
          {collectionQuery.isLoading ? (
            <OrdersSkeleton />
          ) : collectionQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load sample collection requests</AlertTitle>
              <AlertDescription>{(collectionQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : collectionQuery.data?.data.length ? (
            <>
              <div className="space-y-4">
                {collectionQuery.data.data.map((order) => (
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

                      <Button asChild variant="outline">
                        <Link to={`/lab/requests/${order.id}`}>
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
                  Page {collectionQuery.data.page} of {collectionQuery.data.totalPages} with {collectionQuery.data.total} collection requests
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!collectionQuery.data.hasPreviousPage}
                    onClick={() => setCollectionPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!collectionQuery.data.hasNextPage}
                    onClick={() => setCollectionPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No collection requests matched the current filters.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="inProgress" className="space-y-6">
          {inProgressQuery.isLoading ? (
            <OrdersSkeleton />
          ) : inProgressQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load pending tests</AlertTitle>
              <AlertDescription>{(inProgressQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : inProgressQuery.data?.data.length ? (
            <>
              <div className="space-y-4">
                {inProgressQuery.data.data.map((order) => (
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

                      <Button asChild variant="outline">
                        <Link to={`/lab/requests/${order.id}`}>
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
                  Page {inProgressQuery.data.page} of {inProgressQuery.data.totalPages} with {inProgressQuery.data.total} pending tests
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!inProgressQuery.data.hasPreviousPage}
                    onClick={() => setInProgressPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!inProgressQuery.data.hasNextPage}
                    onClick={() => setInProgressPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No pending tests matched the current filters.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resultsReady" className="space-y-6">
          {resultsReadyQuery.isLoading ? (
            <OrdersSkeleton />
          ) : resultsReadyQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load results-ready requests</AlertTitle>
              <AlertDescription>{(resultsReadyQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : resultsReadyQuery.data?.data.length ? (
            <>
              <div className="space-y-4">
                {resultsReadyQuery.data.data.map((order) => (
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

                      <Button asChild variant="outline">
                        <Link to={`/lab/requests/${order.id}`}>
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
                  Page {resultsReadyQuery.data.page} of {resultsReadyQuery.data.totalPages} with {resultsReadyQuery.data.total} results-ready requests
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
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No results-ready requests matched the current filters.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          {completedQuery.isLoading ? (
            <OrdersSkeleton />
          ) : completedQuery.isError ? (
            <Alert variant="destructive">
              <AlertTitle>Unable to load completed requests</AlertTitle>
              <AlertDescription>{(completedQuery.error as Error).message}</AlertDescription>
            </Alert>
          ) : completedQuery.data?.data.length ? (
            <>
              <div className="space-y-4">
                {completedQuery.data.data.map((order) => (
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
                          <span>Completed {formatDateTime(order.completedAt)}</span>
                        </div>
                      </div>

                      <Button asChild variant="outline">
                        <Link to={`/lab/requests/${order.id}`}>
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
                  Page {completedQuery.data.page} of {completedQuery.data.totalPages} with {completedQuery.data.total} completed requests
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={!completedQuery.data.hasPreviousPage}
                    onClick={() => setCompletedPage((current) => Math.max(1, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={!completedQuery.data.hasNextPage}
                    onClick={() => setCompletedPage((current) => current + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No completed requests matched the current filters.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default LabRequestsPage;
