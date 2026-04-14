import { useMemo, useState } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { Bell, CheckCheck, Laptop, RefreshCcw, Shield, Smartphone } from "lucide-react";
import { toast } from "sonner";
import {
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  useNotificationsQuery,
  useRevokeSessionMutation,
  useSessionsQuery,
} from "@/hooks/useMyAccount";
import { useAuth } from "@/hooks/useAuth";
import { NotificationItem, SessionItem } from "@/types/me.types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDisplayDateTime } from "@/lib/date-time";

const NOTIFICATION_PAGE_SIZE = 6;

const formatTimestamp = (value?: string | null) => {
  if (!value) return "Not available";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return `${formatDisplayDateTime(value)} (${formatDistanceToNowStrict(parsed, { addSuffix: true })})`;
};

const getNotificationVariant = (notification: NotificationItem) => {
  if (!notification.isRead) {
    return "border-primary/30 bg-primary/5";
  }

  return "border-border";
};

const getNotificationTypeLabel = (value?: string | null) => {
  if (!value) return "Update";

  return value
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
};

const getDeviceIcon = (session: SessionItem) => {
  const fingerprint = `${session.deviceType ?? ""} ${session.deviceName}`.toLowerCase();

  if (fingerprint.includes("mobile") || fingerprint.includes("phone") || fingerprint.includes("android") || fingerprint.includes("ios")) {
    return Smartphone;
  }

  return Laptop;
};

const NotificationsSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-24 w-full" />
  </div>
);

const SessionsSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-28 w-full" />
    <Skeleton className="h-28 w-full" />
  </div>
);

const NotificationsPanel = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");

  const filters = useMemo(
    () => ({
      page,
      limit: NOTIFICATION_PAGE_SIZE,
      search,
      type: type === "all" ? undefined : type,
      isRead: status === "all" ? undefined : status === "read",
      sortBy: "createdAt",
      sortOrder: "desc" as const,
    }),
    [page, search, status, type],
  );

  const notificationsQuery = useNotificationsQuery(filters, Boolean(user));
  const markReadMutation = useMarkNotificationAsReadMutation();
  const markAllMutation = useMarkAllNotificationsAsReadMutation();

  const notifications = notificationsQuery.data?.data ?? [];
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const handleMarkRead = (notificationId: string) => {
    markReadMutation.mutate(notificationId, {
      onSuccess: (response) => toast.success(response.message),
      onError: (error: Error) => toast.error(error.message),
    });
  };

  const handleMarkAllRead = () => {
    markAllMutation.mutate(undefined, {
      onSuccess: (response) => toast.success(response.message),
      onError: (error: Error) => toast.error(error.message),
    });
  };

  return (
    <Card>
      <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Live account notifications with read-state actions.
          </CardDescription>
        </div>
        <Button
          variant="outline"
          onClick={handleMarkAllRead}
          disabled={markAllMutation.isPending || !notificationsQuery.data?.total}
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          {markAllMutation.isPending ? "Marking..." : "Mark all as read"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Input
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search notifications"
            className="md:col-span-2"
          />
          <Select
            value={status}
            onValueChange={(value) => {
              setPage(1);
              setStatus(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Read status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={type}
            onValueChange={(value) => {
              setPage(1);
              setType(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Notification type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="appointment">Appointment</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {notificationsQuery.isLoading ? (
          <NotificationsSkeleton />
        ) : notificationsQuery.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load notifications</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>{(notificationsQuery.error as Error).message}</p>
              <Button variant="outline" size="sm" onClick={() => void notificationsQuery.refetch()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
              <p>
                Showing page {notificationsQuery.data.page} of {notificationsQuery.data.totalPages} with{" "}
                {notificationsQuery.data.total} total notifications.
              </p>
              <p>{unreadCount} unread on this page.</p>
            </div>

            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl border p-4 transition-colors ${getNotificationVariant(notification)}`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{notification.title}</p>
                      <Badge variant={notification.isRead ? "secondary" : "default"}>
                        {notification.isRead ? "Read" : "Unread"}
                      </Badge>
                      <Badge variant="outline">{getNotificationTypeLabel(notification.type)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      Received {formatTimestamp(notification.createdAt)}
                    </p>
                    {notification.readAt ? (
                      <p className="text-xs text-muted-foreground">
                        Read {formatTimestamp(notification.readAt)}
                      </p>
                    ) : null}
                    {notification.actionUrl ? (
                      <a
                        href={notification.actionUrl}
                        target={notification.actionUrl.startsWith("http") ? "_blank" : undefined}
                        rel={notification.actionUrl.startsWith("http") ? "noreferrer" : undefined}
                        className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        Open related item
                      </a>
                    ) : null}
                  </div>

                  <Button
                    variant="outline"
                    disabled={
                      notification.isRead ||
                      (markReadMutation.isPending && markReadMutation.variables === notification.id)
                    }
                    onClick={() => handleMarkRead(notification.id)}
                  >
                    {markReadMutation.isPending && markReadMutation.variables === notification.id
                      ? "Updating..."
                      : notification.isRead
                      ? "Already read"
                      : "Mark as read"}
                  </Button>
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Page {notificationsQuery.data.page} of {notificationsQuery.data.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={!notificationsQuery.data.hasPreviousPage}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={!notificationsQuery.data.hasNextPage}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <Bell className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No notifications matched your current filters.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try changing the search term or read-status filter.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const SessionsPanel = () => {
  const { user } = useAuth();
  const sessionsQuery = useSessionsQuery(Boolean(user));
  const revokeSessionMutation = useRevokeSessionMutation();

  const sessions = useMemo(
    () =>
      [...(sessionsQuery.data ?? [])].sort((left, right) => {
        if (left.isCurrent === right.isCurrent) return 0;
        return left.isCurrent ? -1 : 1;
      }),
    [sessionsQuery.data],
  );

  const handleRevokeSession = (sessionId: string) => {
    revokeSessionMutation.mutate(sessionId, {
      onSuccess: (response) => toast.success(response.message),
      onError: (error: Error) => toast.error(error.message),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Active Sessions
        </CardTitle>
          <CardDescription>
            View active devices and revoke sessions directly.
          </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessionsQuery.isLoading ? (
          <SessionsSkeleton />
        ) : sessionsQuery.isError ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load sessions</AlertTitle>
            <AlertDescription className="space-y-3">
              <p>{(sessionsQuery.error as Error).message}</p>
              <Button variant="outline" size="sm" onClick={() => void sessionsQuery.refetch()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        ) : sessions.length > 0 ? (
          sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session);

            return (
              <div key={session.id} className="rounded-xl border p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <DeviceIcon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{session.deviceName}</p>
                        {session.isCurrent ? <Badge>Current session</Badge> : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {[session.browser, session.operatingSystem, session.deviceType]
                          .filter(Boolean)
                          .join(" | ") || "Device details not available"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.location || "Unknown location"}
                        {session.ipAddress ? ` | ${session.ipAddress}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last active {formatTimestamp(session.lastActiveAt)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Started {formatTimestamp(session.createdAt)}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    disabled={
                      session.isCurrent ||
                      (revokeSessionMutation.isPending && revokeSessionMutation.variables === session.id)
                    }
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    {revokeSessionMutation.isPending && revokeSessionMutation.variables === session.id
                      ? "Revoking..."
                      : session.isCurrent
                      ? "Current session"
                      : "Revoke session"}
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <Shield className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">No active sessions were returned.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Once device sessions are available, they will appear here.
            </p>
          </div>
        )}

        <Button variant="ghost" size="sm" onClick={() => void sessionsQuery.refetch()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Refresh sessions
        </Button>
      </CardContent>
    </Card>
  );
};

export const AccountActivitySections = () => (
  <Tabs defaultValue="notifications" className="space-y-6">
    <TabsList>
      <TabsTrigger value="notifications">Notifications</TabsTrigger>
      <TabsTrigger value="sessions">Sessions</TabsTrigger>
    </TabsList>

    <TabsContent value="notifications" className="space-y-6">
      <NotificationsPanel />
    </TabsContent>

    <TabsContent value="sessions" className="space-y-6">
      <SessionsPanel />
    </TabsContent>
  </Tabs>
);
