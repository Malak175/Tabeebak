import { Link } from "react-router-dom";
import {
  Activity,
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
        <div className="space-y-8">
          <Card className="border border-primary/15 bg-gradient-to-br from-primary/8 via-primary/3 to-transparent shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between pb-4">
              <div className="flex-1">
                <CardTitle className="text-3xl md:text-4xl font-bold tracking-tight">Welcome back, {labName}</CardTitle>
                <CardDescription className="mt-3 text-base">
                  A focused snapshot of Inbox, Active Work, Results Ready, and Archive.
                </CardDescription>
              </div>
              <Button asChild variant="default" className="mt-2 md:mt-0">
                <Link to="/lab/settings">Manage Lab</Link>
              </Button>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3 pt-2">
              {subtitle && <Badge variant="secondary" className="text-xs font-medium px-3 py-1">{subtitle}</Badge>}
              {completionPercent != null && (
                <Badge variant={completionPercent === 100 ? "secondary" : "outline"} className="text-xs font-medium px-3 py-1">
                  {completionPercent}% profile complete
                </Badge>
              )}
              {homeCollectionAvailable && (
                <Badge variant="outline" className="text-green-700 text-xs font-medium px-3 py-1">
                  Home collection active
                </Badge>
              )}
              {summary?.rating != null && (
                <Badge variant="outline" className="text-xs font-medium px-3 py-1">Rating {summary.rating.toFixed(1)}</Badge>
              )}
            </CardContent>
          </Card>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Primary KPIs</h2>
                <p className="text-sm text-muted-foreground mt-1">Operational highlights</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
              {primaryKpis.map((stat) => (
                <Card key={stat.label} className="border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/10 group-hover:from-primary/20 group-hover:to-primary/15 transition-colors duration-300 border border-primary/20">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                    <div className="text-sm font-semibold text-foreground mt-2">{stat.label}</div>
                    <div className="text-xs text-muted-foreground mt-2 leading-relaxed">{stat.helper}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold tracking-tight">Secondary KPIs</h2>
                <p className="text-sm text-muted-foreground mt-1">Catalog & coverage</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
              {secondaryKpis.map((stat) => (
                <Card key={stat.label} className="border border-border/50 shadow-sm hover:shadow-md hover:border-secondary/30 transition-all duration-300 group">
                  <CardContent className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-secondary/15 to-secondary/10 group-hover:from-secondary/20 group-hover:to-secondary/15 transition-colors duration-300 border border-secondary/20">
                      <stat.icon className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                    <div className="text-sm font-semibold text-foreground mt-2">{stat.label}</div>
                    <div className="text-xs text-muted-foreground mt-2 leading-relaxed">{stat.helper}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <Card className="lg:col-span-2 border border-border/50 shadow-sm">
              <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-5">
                <div>
                  <CardTitle className="text-xl font-bold">Workflow Snapshot</CardTitle>
                  <CardDescription className="mt-1">Latest orders across the official workflow.</CardDescription>
                </div>
                <Link to="/lab/requests" className="text-sm font-semibold text-primary hover:text-primary/80 hover:underline transition-colors whitespace-nowrap">
                  Open Inbox →
                </Link>
              </CardHeader>
              <CardContent className="space-y-4">
                {!hasRecentOrders ? (
                  <div className="rounded-lg border border-dashed border-border/50 bg-muted/30 p-6 text-sm text-muted-foreground text-center">
                    No recent lab orders yet. New requests will appear here as they arrive.
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-5 gap-2 px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <span>Order</span>
                      <span>Patient</span>
                      <span>Test</span>
                      <span>Status</span>
                      <span>Date</span>
                    </div>
                    <div className="space-y-2">
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
                            className="grid grid-cols-5 gap-2 rounded-lg border border-border/30 bg-muted/20 px-4 py-3 hover:bg-muted/40 hover:border-border/50 transition-all duration-200 group"
                          >
                            <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{orderLabel}</span>
                            <span className="text-foreground/80">{patientLabel}</span>
                            <span className="text-foreground/80">{testLabel}</span>
                            <span className="font-medium">{statusLabel}</span>
                            <span className="text-muted-foreground">{formatDateLabel(order.requestedAt)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card className="border border-border/50 bg-gradient-to-br from-secondary/8 via-transparent to-primary/5 shadow-sm">
                <CardHeader className="pb-5">
                  <CardTitle className="text-xl font-bold">Lab Identity</CardTitle>
                  <CardDescription className="mt-1">Profile and accreditation details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/40 p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
                    <div className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground mb-1">Name</div>
                    <div className="text-base font-medium text-foreground">{labName}</div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/40 p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
                    <div className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground mb-1">Email</div>
                    <div className="text-sm text-foreground break-all">
                      {summary?.email ?? profile?.email ?? "Not provided"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/40 p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
                    <div className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground mb-1">Phone</div>
                    <div className="text-sm text-foreground">
                      {summary?.phone ?? profile?.phone ?? "Not provided"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/40 p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
                    <div className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground mb-1">Address</div>
                    <div className="text-sm text-foreground">
                      {summary?.addressSummary ?? fallbackAddress ?? "No address details returned yet"}
                    </div>
                  </div>
                  <div className="rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 border border-border/40 p-4 shadow-xs hover:shadow-sm transition-shadow duration-200">
                    <div className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground mb-1">Accreditation</div>
                    <div className="text-sm text-foreground">
                      {accreditationLabel}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border/50 shadow-sm">
                <CardHeader className="pb-5">
                  <CardTitle className="text-xl font-bold">Profile Health</CardTitle>
                  <CardDescription className="mt-1">Setup completeness and readiness.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {completionPercent != null ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Completion Status</span>
                        <span className="font-bold text-lg text-primary">{completionPercent}%</span>
                      </div>
                      <div className="rounded-lg overflow-hidden bg-muted/20 p-1">
                        <Progress value={completionPercent} className="h-2" />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg bg-muted/40 border border-border/40 p-4 text-sm text-muted-foreground">
                      Completion data is not available yet.
                    </div>
                  )}
                  {profileHealthFlags.length === 0 ? (
                    <div className="rounded-lg bg-green-50 border border-green-200/50 dark:bg-green-950/20 dark:border-green-900/50 p-4 text-sm text-green-700 dark:text-green-400 font-medium">
                      ✓ Your lab profile is fully set up.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-sm font-bold">Missing setup items</div>
                      <ul className="space-y-2 text-sm">
                        {profileHealthFlags.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-muted-foreground">
                            <span className="text-amber-500 font-bold mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button asChild variant="default" className="w-full font-semibold">
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

