import { useMemo, useState } from "react";
import { format, isValid, parseISO } from "date-fns";
import { CalendarClock, ClipboardCheck, Search, Stethoscope, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { doctorNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctorAppointmentRequestsQuery } from "@/hooks/useDoctorWorkflow";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import { DoctorAppointmentRequest } from "@/types/doctor-workflow.types";

const formatDateTime = (value?: string | null) => {
  if (!value) return "Not available";

  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;

  return format(parsed, "PPP p");
};

const getStatusClassName = (status?: string | null) => {
  switch ((status ?? "").toLowerCase()) {
    case "approved":
    case "confirmed":
      return "bg-green-100 text-green-700 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "rejected":
    case "cancelled":
    case "canceled":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const RequestCard = ({ request }: { request: DoctorAppointmentRequest }) => (
  <Card>
    <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ClipboardCheck className="h-5 w-5" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">{request.patientName}</h3>
          <Badge className={getStatusClassName(request.status)}>{request.status}</Badge>
          {request.consultationType ? <Badge variant="outline">{request.consultationType}</Badge> : null}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>Preferred: {formatDateTime(request.preferredTime)}</span>
          {request.scheduledAt ? <span>Scheduled: {formatDateTime(request.scheduledAt)}</span> : null}
          <span>
            {[request.patientAge ? `${request.patientAge} yrs` : null, request.patientGender]
              .filter(Boolean)
              .join(" - ") || "Patient details pending"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {request.latestSummary || "No request summary is available yet."}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link to={`/doctor/requests/${request.id}`}>View details</Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);

const RequestCardSkeleton = () => (
  <Card>
    <CardContent className="space-y-3 p-6">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-4 w-56" />
    </CardContent>
  </Card>
);

const DoctorRequestsPage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [consultationType, setConsultationType] = useState("all");
  const userName = getDisplayName(user ?? {});

  const filters = useMemo(
    () => ({
      page,
      limit: 6,
      search,
      status: status === "all" ? undefined : status,
      consultationType: consultationType === "all" ? undefined : consultationType,
      sortBy: "createdAt",
      sortOrder: "desc" as const,
    }),
    [consultationType, page, search, status],
  );

  const query = useDoctorAppointmentRequestsQuery(filters, Boolean(user));

  return (
    <DashboardLayout
      userRole="doctor"
      userName={userName}
      userSubtitle="Doctor account"
      navItems={doctorNavItems}
      userIcon={Stethoscope}
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Appointment Requests</h1>
          <p className="text-muted-foreground">
            Review incoming patient requests before they become scheduled care.
          </p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground">
          Inbox total: {query.data?.total ?? 0}
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
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Search patient or request"
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setPage(1);
              setStatus(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={consultationType}
            onValueChange={(value) => {
              setPage(1);
              setConsultationType(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Consultation type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="Clinic">Clinic</SelectItem>
              <SelectItem value="Video">Video</SelectItem>
              <SelectItem value="Phone">Phone</SelectItem>
              <SelectItem value="Home Visit">Home Visit</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setPage(1);
              setSearch("");
              setStatus("all");
              setConsultationType("all");
            }}
          >
            Clear filters
          </Button>
        </CardContent>
      </Card>

      {query.isLoading ? (
        <div className="space-y-4">
          <RequestCardSkeleton />
          <RequestCardSkeleton />
          <RequestCardSkeleton />
        </div>
      ) : query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load appointment requests</AlertTitle>
          <AlertDescription>{(query.error as Error).message}</AlertDescription>
        </Alert>
      ) : query.data?.data.length ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="mt-2 text-3xl font-bold">
                  {query.data.data.filter((item) => item.status.toLowerCase() === "pending").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="mt-2 text-3xl font-bold">
                  {query.data.data.filter((item) => item.status.toLowerCase() === "approved").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="mt-2 text-3xl font-bold">
                  {query.data.data.filter((item) => item.status.toLowerCase() === "rejected").length}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {query.data.data.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {query.data.page} of {query.data.totalPages} with {query.data.total} total requests
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={!query.data.hasPreviousPage}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!query.data.hasNextPage}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center text-muted-foreground">
            <UserRound className="h-10 w-10" />
            <p>No appointment requests matched your current filters.</p>
            <p className="text-sm">New patient requests will appear here as they arrive.</p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardContent className="flex items-center gap-3 p-4 text-sm text-muted-foreground">
          <CalendarClock className="h-4 w-4" />
          Approvals stay in the request inbox until you explicitly review them through the provider workflow.
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default DoctorRequestsPage;
