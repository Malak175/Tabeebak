import { Link } from "react-router-dom";
import {
  Activity,
  Building2,
  CheckCircle,
  ChevronRight,
  Clock,
  FlaskConical,
  Microscope,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { labNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useLabBranchesQuery,
  useLabDashboardSummaryQuery,
  useLabProfileQuery,
  useLabServicesQuery,
} from "@/hooks/useLabProfile";
import { getDisplayName } from "@/lib/auth";

const statCards = (summary: ReturnType<typeof useLabDashboardSummaryQuery>["data"]) => [
  {
    label: "Pending Tests",
    value: summary?.pendingTestsCount ?? 0,
    icon: Clock,
    description: "Items still waiting on processing",
  },
  {
    label: "Completed Today",
    value: summary?.completedTestsToday ?? 0,
    icon: CheckCircle,
    description: "Results completed today",
  },
  {
    label: "Services",
    value: summary?.totalServicesCount ?? 0,
    icon: FlaskConical,
    description: "Catalog entries returned by the API",
  },
  {
    label: "Branches",
    value: summary?.totalBranchesCount ?? 0,
    icon: Building2,
    description: "Locations currently attached to the lab",
  },
];

const LabDashboard = () => {
  const summaryQuery = useLabDashboardSummaryQuery();
  const profileQuery = useLabProfileQuery();
  const branchesQuery = useLabBranchesQuery();
  const servicesQuery = useLabServicesQuery();
  const summary = summaryQuery.data;
  const profile = profileQuery.data;
  const labName = getDisplayName({
    displayName: profile?.displayName ?? summary?.displayName,
    name: summary?.legalName ?? profile?.legalName ?? summary?.displayName,
    email: profile?.email ?? summary?.email,
  });
  const subtitle = summary?.accreditation ?? profile?.accreditation ?? "Laboratory account";
  const activeServicesCount = servicesQuery.data?.filter((service) => service.isActive !== false).length ?? 0;
  const activeBranchesCount = branchesQuery.data?.filter((branch) => branch.isActive !== false).length ?? 0;

  return (
    <DashboardLayout
      userRole="laboratory"
      userName={labName}
      userSubtitle={subtitle}
      navItems={labNavItems}
      userIcon={FlaskConical}
    >
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Laboratory Dashboard</h1>
          <p className="text-muted-foreground">
            Live lab profile, branch, and services metrics are now coming from the laboratory APIs.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {subtitle && (
            <Badge variant="secondary" className="gap-1">
              <Microscope className="h-3 w-3" />
              {subtitle}
            </Badge>
          )}
          {summary?.profileCompletionPercentage != null && (
            <Badge variant="outline">
              Profile completion {summary.profileCompletionPercentage}%
            </Badge>
          )}
          {summary?.rating != null && (
            <Badge variant="outline">Rating {summary.rating.toFixed(1)}</Badge>
          )}
          {profile?.homeCollectionAvailable && (
            <Badge variant="outline" className="text-green-700">
              Home collection active
            </Badge>
          )}
        </div>
      </div>

      {summaryQuery.isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index}>
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-64 w-full lg:col-span-2" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      ) : summaryQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load lab dashboard summary</AlertTitle>
          <AlertDescription>
            {(summaryQuery.error as Error).message}
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => void summaryQuery.refetch()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards(summary).map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm font-medium">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.description}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>Operational Snapshot</CardTitle>
                  <CardDescription>
                    Summary cards are backed by `/api/v1/labs/me/dashboard-summary`, while the counts
                    below refresh from your lab branches and services.
                  </CardDescription>
                </div>
                <Link to="/lab/settings" className="text-sm text-primary hover:underline">
                  Manage lab
                </Link>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Building2 className="h-4 w-4" />
                    Branch coverage
                  </div>
                  <div className="text-2xl font-bold">{activeBranchesCount}</div>
                  <p className="text-sm text-muted-foreground">
                    Active branches out of {branchesQuery.data?.length ?? 0} total.
                  </p>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <FlaskConical className="h-4 w-4" />
                    Active catalog
                  </div>
                  <div className="text-2xl font-bold">{activeServicesCount}</div>
                  <p className="text-sm text-muted-foreground">
                    Active services out of {servicesQuery.data?.length ?? 0} total.
                  </p>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Activity className="h-4 w-4" />
                    Monthly throughput
                  </div>
                  <div className="text-2xl font-bold">{summary?.totalTestsThisMonth ?? 0}</div>
                  <p className="text-sm text-muted-foreground">Total tests recorded this month.</p>
                </div>
                <div className="rounded-xl border p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Clock className="h-4 w-4" />
                    Urgent queue
                  </div>
                  <div className="text-2xl font-bold">{summary?.urgentTestsCount ?? 0}</div>
                  <p className="text-sm text-muted-foreground">
                    Urgent tests currently reported for your lab.
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-secondary/10 to-primary/5">
                <CardHeader>
                  <CardTitle>Lab Identity</CardTitle>
                  <CardDescription>Snapshot from your lab profile.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-lg bg-background/70 p-3">
                    <div className="font-medium">Name</div>
                    <div className="text-muted-foreground">{labName}</div>
                  </div>
                  <div className="rounded-lg bg-background/70 p-3">
                    <div className="font-medium">Email</div>
                    <div className="text-muted-foreground">
                      {profile?.email ?? summary?.email ?? "Not provided"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-background/70 p-3">
                    <div className="font-medium">Phone</div>
                    <div className="text-muted-foreground">
                      {profile?.phone ?? summary?.phone ?? "Not provided"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-background/70 p-3">
                    <div className="font-medium">Address</div>
                    <div className="text-muted-foreground">
                      {summary?.addressSummary ?? "No address details returned yet"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                  <CardDescription>
                    Navigate directly to the integrated lab management areas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link
                    to="/lab/settings"
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40"
                  >
                    <span className="font-medium">Profile & branches</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/lab/settings"
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40"
                  >
                    <span className="font-medium">Services catalog</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/lab/pending"
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40"
                  >
                    <span className="font-medium">Pending tests</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link
                    to="/lab/completed"
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40"
                  >
                    <span className="font-medium">Completed tests</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default LabDashboard;
