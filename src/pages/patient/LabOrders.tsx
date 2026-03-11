import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
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
import { usePatientLabOrdersQuery } from "@/hooks/usePatientRecords";
import { patientNavItems } from "@/pages/patient/navigation";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
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
    case "completed":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-primary/10 text-primary";
  }
};

const PatientLabOrders = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(
    () => ({
      page: toPageNumber(searchParams.get("page")),
      limit: toPageNumber(searchParams.get("limit"), 10),
      search: searchParams.get("search") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      orderedFrom: searchParams.get("orderedFrom") ?? undefined,
      orderedTo: searchParams.get("orderedTo") ?? undefined,
    }),
    [searchParams],
  );
  const labOrdersQuery = usePatientLabOrdersQuery(filters);

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
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">Lab Orders</h1>
        <p className="text-muted-foreground">
          Track laboratory orders that have been requested for you.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Input
            placeholder="Search test"
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={searchParams.get("orderedFrom") ?? ""}
            onChange={(event) => updateSearchParam("orderedFrom", event.target.value)}
          />
          <Input
            type="date"
            value={searchParams.get("orderedTo") ?? ""}
            onChange={(event) => updateSearchParam("orderedTo", event.target.value)}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {labOrdersQuery.isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton className="h-32 w-full" key={index} />
          ))
        ) : labOrdersQuery.isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lab orders unavailable</AlertTitle>
            <AlertDescription>{labOrdersQuery.error.message}</AlertDescription>
          </Alert>
        ) : (labOrdersQuery.data?.items ?? []).length ? (
          labOrdersQuery.data?.items.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">{order.testName}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status ?? "ordered"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ordered on {formatDate(order.orderedAt)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Doctor: {order.orderedByDoctorName ?? "assigned doctor"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Lab: {order.labName ?? "Lab pending assignment"}
                    </p>
                    {order.scheduledAt && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Scheduled for {formatDate(order.scheduledAt)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No lab orders found</AlertTitle>
            <AlertDescription>
              Lab orders will appear here once they are created.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border bg-card p-4 md:flex-row md:items-center">
        <p className="text-sm text-muted-foreground">
          Showing page {labOrdersQuery.data?.page ?? 1} of {labOrdersQuery.data?.totalPages ?? 1}.
        </p>
        <div className="flex gap-2">
          <Button
            disabled={!labOrdersQuery.data?.hasPreviousPage}
            onClick={() =>
              updateSearchParam("page", String((labOrdersQuery.data?.page ?? 1) - 1))
            }
            variant="outline"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            disabled={!labOrdersQuery.data?.hasNextPage}
            onClick={() =>
              updateSearchParam("page", String((labOrdersQuery.data?.page ?? 1) + 1))
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

export default PatientLabOrders;
