import { useMemo, useState } from "react";
import { Clock, Eye, FlaskConical, Search } from "lucide-react";
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
  const location = useLocation();
  const { user } = useAuth();
  const profileQuery = useLabProfileQuery(Boolean(user));
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("all");

  const enabled = Boolean(user);
  const userName = getDisplayName(profileQuery.data ?? user ?? {});
  const inboxStatuses = getLabStatusesForBucket("inbox");

  const filters = useMemo(
    () => ({
      page,
      limit: 8,
      search,
      status: inboxStatuses[0],
      priority: priority === "all" ? undefined : priority,
      sortBy: "orderedAt",
      sortOrder: "desc" as const,
    }),
    [inboxStatuses, page, priority, search],
  );

  const inboxQuery = useLabOrdersQuery(filters, enabled);

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
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Inbox</h1>
          <p className="text-muted-foreground">
            New lab requests waiting for a review decision.
          </p>
        </div>
        <Badge variant="outline">{inboxQuery.data?.total ?? 0} pending requests</Badge>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Inbox filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search patient, order, or test"
            />
          </div>
          <Select
            value={priority}
            onValueChange={(value) => {
              setPage(1);
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
              setPage(1);
              setSearch("");
              setPriority("all");
            }}
          >
            Clear filters
          </Button>
        </CardContent>
      </Card>

      {inboxQuery.isLoading ? (
        <OrdersSkeleton />
      ) : inboxQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load inbox requests</AlertTitle>
          <AlertDescription>{(inboxQuery.error as Error).message}</AlertDescription>
        </Alert>
      ) : inboxQuery.data?.data.length ? (
        <div className="space-y-6">
          <div className="space-y-4">
            {inboxQuery.data.data.map((order) => (
              <Card key={order.id}>
                <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Clock className="h-5 w-5" />
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
                      <span>Patient phone: {order.patientPhone || "Not available"}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>Created {formatDateTime(order.orderedAt)}</span>
                      <span>Preferred {formatDateTime(order.scheduledAt)}</span>
                    </div>
                  </div>

                  <Button asChild variant="outline">
                    <Link
                      to={`/lab/requests/${order.id}`}
                      state={{ fromPath: `${location.pathname}${location.search}`, fromLabel: "Inbox" }}
                    >
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
              Page {inboxQuery.data.page} of {inboxQuery.data.totalPages} with {inboxQuery.data.total} inbox requests
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!inboxQuery.data.hasPreviousPage}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!inboxQuery.data.hasNextPage}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Inbox is clear. New pending requests will appear here.
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default LabRequestsPage;

