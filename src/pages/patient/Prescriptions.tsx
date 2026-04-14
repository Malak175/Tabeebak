import { useMemo, useState } from "react";
import { ClipboardList, Pill, User } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { patientNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientPrescriptionsQuery } from "@/hooks/usePatientProfile";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import { formatDisplayDate } from "@/lib/date-time";

const formatDate = (value?: string | null) => formatDisplayDate(value);

const PrescriptionCardSkeleton = () => (
  <Card>
    <CardContent className="space-y-3 p-6">
      <Skeleton className="h-5 w-48" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-40" />
    </CardContent>
  </Card>
);

const PatientPrescriptions = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filters = useMemo(
    () => ({
      page,
      limit: 8,
      search,
      sortBy: "prescribedAt",
      sortOrder: "desc" as const,
    }),
    [page, search],
  );

  const query = usePatientPrescriptionsQuery(filters, Boolean(user));
  const userName = getDisplayName(user ?? {});
  const groupedPrescriptions = useMemo(() => {
    const items = query.data?.data ?? [];
    const groups = new Map<
      string,
      {
        key: string;
        title: string;
        subtitle?: string;
        appointmentId?: string | null;
        items: typeof items;
      }
    >();

    items.forEach((prescription) => {
      const groupKey =
        prescription.appointmentId ||
        prescription.appointmentNumber ||
        prescription.appointmentScheduledAt ||
        "unlinked";
      if (!groups.has(groupKey)) {
        const title = prescription.appointmentScheduledAt
          ? `Appointment ${formatDate(prescription.appointmentScheduledAt)}`
          : prescription.appointmentNumber
            ? `Appointment ${prescription.appointmentNumber}`
            : prescription.appointmentId
              ? `Appointment ${prescription.appointmentId}`
              : "Unlinked prescriptions";
        const subtitle =
          groupKey === "unlinked"
            ? "Appointment context not available"
            : prescription.appointmentStatus
              ? `Status: ${prescription.appointmentStatus}`
              : undefined;
        groups.set(groupKey, {
          key: groupKey,
          title,
          subtitle,
          appointmentId: prescription.appointmentId ?? null,
          items: [],
        });
      }
      groups.get(groupKey)?.items.push(prescription);
    });

    return Array.from(groups.values());
  }, [query.data?.data]);

  return (
    <DashboardLayout
      userRole="patient"
      userName={userName}
      navItems={patientNavItems}
      userIcon={User}
    >
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold md:text-3xl">Prescriptions</h1>
        <p className="text-muted-foreground">Prescriptions are grouped by appointment when possible.</p>
      </div>

      <div className="mb-6">
        <Input
          value={search}
          onChange={(event) => {
            setPage(1);
            setSearch(event.target.value);
          }}
          placeholder="Search medication"
        />
      </div>

      {query.isLoading ? (
        <div className="space-y-4">
          <PrescriptionCardSkeleton />
          <PrescriptionCardSkeleton />
          <PrescriptionCardSkeleton />
        </div>
      ) : query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load prescriptions</AlertTitle>
          <AlertDescription>{(query.error as Error).message}</AlertDescription>
        </Alert>
      ) : query.data?.data.length ? (
        <div className="space-y-6">
          <div className="space-y-6">
            {groupedPrescriptions.map((group) => (
              <div key={group.key} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold">{group.title}</p>
                    {group.subtitle ? (
                      <p className="text-xs text-muted-foreground">{group.subtitle}</p>
                    ) : null}
                  </div>
                  {group.appointmentId ? (
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/patient/appointments/${group.appointmentId}`}>View appointment</Link>
                    </Button>
                  ) : null}
                </div>
                <div className="grid gap-4">
                  {group.items.map((prescription, index) => {
                    const resolvedId = prescription.id?.trim();
                    const detailsRoute = resolvedId ? `/patient/prescriptions/${resolvedId}` : "";
                    const cardKey =
                      resolvedId ||
                      prescription.prescriptionNumber ||
                      `${prescription.medicationName}-${index}`;

                    return (
                      <Card key={cardKey}>
                        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Pill className="h-5 w-5" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold">{prescription.medicationName}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {[prescription.dosage, prescription.frequency].filter(Boolean).join(" - ") ||
                                "Dosage details not provided"}
                            </p>
                            {prescription.prescriberName || prescription.prescribedAt ? (
                              <p className="text-sm text-muted-foreground">
                                {prescription.prescriberName
                                  ? `Prescribed by ${prescription.prescriberName}`
                                  : "Prescriber not listed"}{" "}
                                {prescription.prescribedAt ? `on ${formatDate(prescription.prescribedAt)}` : ""}
                              </p>
                            ) : null}
                            {prescription.appointmentId ||
                            prescription.appointmentNumber ||
                            prescription.appointmentScheduledAt ? (
                              <p className="text-sm text-muted-foreground">
                                From appointment{" "}
                                {prescription.appointmentScheduledAt
                                  ? formatDate(prescription.appointmentScheduledAt)
                                  : prescription.appointmentNumber || "reference pending"}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {resolvedId ? (
                              <Button asChild variant="outline">
                                <Link to={detailsRoute}>View details</Link>
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">Details unavailable</span>
                            )}
                            {prescription.appointmentId ? (
                              <Button asChild variant="outline">
                                <Link to={`/patient/appointments/${prescription.appointmentId}`}>View appointment</Link>
                              </Button>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-muted-foreground">
              Page {query.data.page} of {query.data.totalPages} with {query.data.total} total prescriptions
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
            <ClipboardList className="h-10 w-10" />
            <p>No prescriptions yet. They appear after appointments when your doctor issues them.</p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default PatientPrescriptions;


