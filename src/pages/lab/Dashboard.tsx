import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Building2,
  CheckCircle,
  Clock,
  FlaskConical,
  MapPin,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { labNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLabStatusLabel } from "@/lib/labStatus";
import {
  useLabDashboardSummaryQuery,
  useLabProfileQuery,
} from "@/hooks/useLabProfile";
import { getDisplayName } from "@/lib/auth";

const formatDateLabel = (value?: string | null) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString();
};

const LabDashboard = () => {
  const summaryQuery = useLabDashboardSummaryQuery();
  const profileQuery = useLabProfileQuery();
  const summary = summaryQuery.data;
  const profile = profileQuery.data;
  const profileAddress = [
    profile?.addressLine1,
    profile?.addressLine2,
    profile?.city,
    profile?.state,
    profile?.country,
  ]
    .filter(Boolean)
    .join(", ");
  const fallbackAddress = profileAddress.trim() ? profileAddress : null;
  const labName = getDisplayName({
    displayName: summary?.displayName ?? profile?.displayName,
    name: summary?.legalName ?? profile?.legalName ?? summary?.displayName,
    email: summary?.email ?? profile?.email,
  });
  const subtitle = summary?.accreditation ?? profile?.accreditation ?? "Laboratory account";
  const activeServicesCount = summary?.activeServicesCount ?? 0;
  const activeBranchesCount = summary?.activeBranchesCount ?? 0;
  const totalServicesCount = summary?.totalServicesCount ?? 0;
  const totalBranchesCount = summary?.totalBranchesCount ?? 0;
  const pendingTestsCount = summary?.pendingTestsCount ?? 0;
  const completedTestsToday = summary?.completedTestsToday ?? 0;
  const urgentTestsCount = summary?.urgentTestsCount ?? 0;
  const totalTestsThisMonth = summary?.totalTestsThisMonth ?? 0;
  const homeCollectionAvailable = summary?.homeCollectionAvailable ?? profile?.homeCollectionAvailable;
  const completionPercent =
    summary?.profileCompletionPercentage != null
      ? Math.round(summary.profileCompletionPercentage)
      : null;
  const accreditationLabel =
    summary?.accreditationLabel ??
    summary?.accreditation ??
    profile?.accreditation ??
    "No accreditation added yet";
  const recentOrders = summary?.recentOrdersPreview?.items ?? [];
  const hasRecentOrders = recentOrders.length > 0;
  const profileHealthFlags = [
    !summary?.phone && "Phone number missing",
    !summary?.addressSummary && "Address missing",
    !summary?.accreditation && "Accreditation missing",
    totalServicesCount === 0 && "No services listed",
    totalBranchesCount === 0 && "No branches listed",
  ].filter(Boolean) as string[];
  const primaryKpis = [
    {
      label: "Pending Tests",
      value: pendingTestsCount,
      icon: Clock,
      helper: "Awaiting Inbox decision",
    },
    {
      label: "Completed Today",
      value: completedTestsToday,
      icon: CheckCircle,
      helper: "Moved to Archive today",
    },
    {
      label: "Urgent Queue",
      value: urgentTestsCount,
      icon: AlertTriangle,
      helper: "Urgent items across workflow",
    },
    {
      label: "Monthly Throughput",
      value: totalTestsThisMonth,
      icon: Activity,
      helper: "Orders closed this month",
    },
  ];
  const secondaryKpis = [
    {
      label: "Total Services",
      value: totalServicesCount,
      icon: FlaskConical,
      helper: "Catalog entries",
    },
    {
      label: "Active Catalog",
      value: activeServicesCount,
      icon: BadgeCheck,
      helper: "Active services",
    },
    {
      label: "Total Branches",
      value: totalBranchesCount,
      icon: Building2,
      helper: "Branch locations",
    },
    {
      label: "Active Branches",
      value: activeBranchesCount,
      icon: MapPin,
      helper: "Currently active",
    },
  ];

  return (
    <DashboardLayout
      userRole="laboratory"
      userName={labName}
      userSubtitle={subtitle}
      navItems={labNavItems}
      userIcon={FlaskConical}
    >
      {summaryQuery.isLoading ? (
        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-80" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-28" />
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={`primary-${index}`}>
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={`secondary-${index}`}>
                <CardContent className="space-y-3 p-4">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-4 w-28" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-72 w-full lg:col-span-2" />
            <Skeleton className="h-72 w-full" />
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
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-background">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle className="text-2xl md:text-3xl">Welcome back, {labName}</CardTitle>
                <CardDescription className="mt-2">
                  A focused snapshot of Inbox, Active Work, Results Ready, and Archive.
                </CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link to="/lab/settings">Manage Lab</Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-2">
              {subtitle && <Badge variant="secondary">{subtitle}</Badge>}
              {completionPercent != null && (
                <Badge variant={completionPercent === 100 ? "secondary" : "outline"}>
                  {completionPercent}% profile complete
                </Badge>
              )}
              {homeCollectionAvailable && (
                <Badge variant="outline" className="text-green-700">
                  Home collection active
                </Badge>
              )}
              {summary?.rating != null && (
                <Badge variant="outline">Rating {summary.rating.toFixed(1)}</Badge>
              )}
            </CardContent>
          </Card>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Primary KPIs</h2>
              <span className="text-sm text-muted-foreground">Operational highlights</span>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {primaryKpis.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm font-medium">{stat.label}</div>
                    <div className="text-xs text-muted-foreground">{stat.helper}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Secondary KPIs</h2>
              <span className="text-sm text-muted-foreground">Catalog & coverage</span>
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {secondaryKpis.map((stat) => (
                <Card key={stat.label}>
                  <CardContent className="p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/20">
                      <stat.icon className="h-5 w-5 text-secondary" />
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm font-medium">{stat.label}</div>
                    <div className="text-xs text-muted-foreground">{stat.helper}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>Workflow Snapshot</CardTitle>
                  <CardDescription>Latest orders across the official workflow.</CardDescription>
                </div>
                <Link to="/lab/requests" className="text-sm text-primary hover:underline">
                  Open Inbox
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {!hasRecentOrders ? (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    No recent lab orders yet. New requests will appear here as they arrive.
                  </div>
                ) : (
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-muted-foreground">
                      <span>Order</span>
                      <span>Patient</span>
                      <span>Test</span>
                      <span>Status</span>
                      <span>Date</span>
                    </div>
                    {recentOrders.map((order, index) => {
                      const orderLabel =
                        order.orderDisplayId ??
                        (order.requestId ? `#${order.requestId}` : null) ??
                        "Not available";
                      const testLabel = order.testName ?? "Not specified";
                      const statusLabel = formatLabStatusLabel(order.status);
                      const patientLabel = order.patientName ?? "Not available";

                      return (
                        <div
                          key={order.id ?? order.referenceNumber ?? `${order.patientName}-${index}`}
                          className="grid grid-cols-5 gap-2 rounded-lg border p-3"
                        >
                          <span className="font-medium">{orderLabel}</span>
                          <span>{patientLabel}</span>
                          <span>{testLabel}</span>
                          <span>{statusLabel}</span>
                          <span>{formatDateLabel(order.requestedAt)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-secondary/10 to-primary/5">
                <CardHeader>
                  <CardTitle>Lab Identity</CardTitle>
                  <CardDescription>Profile and accreditation details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-lg bg-background/70 p-3">
                    <div className="font-medium">Name</div>
                    <div className="text-muted-foreground">{labName}</div>
                  </div>
                  <div className="rounded-lg bg-background/70 p-3">
                    <div className="font-medium">Email</div>
                    <div className="text-muted-foreground">
                      {summary?.email ?? profile?.email ?? "Not provided"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-background/70 p-3">
                    <div className="font-medium">Phone</div>
                    <div className="text-muted-foreground">
                      {summary?.phone ?? profile?.phone ?? "Not provided"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-background/70 p-3">
                    <div className="font-medium">Address</div>
                    <div className="text-muted-foreground">
                      {summary?.addressSummary ?? fallbackAddress ?? "No address details returned yet"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-background/70 p-3">
                    <div className="font-medium">Accreditation</div>
                    <div className="text-muted-foreground">
                      {accreditationLabel}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Health</CardTitle>
                  <CardDescription>Setup completeness and readiness.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {completionPercent != null ? (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Completion</span>
                        <span className="font-medium">{completionPercent}%</span>
                      </div>
                      <Progress value={completionPercent} />
                    </>
                  ) : (
                    <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                      Completion data is not available yet.
                    </div>
                  )}
                  {profileHealthFlags.length === 0 ? (
                    <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                      Your lab profile is fully set up.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Missing setup items</div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {profileHealthFlags.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/lab/settings">Review Profile</Link>
                  </Button>
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

