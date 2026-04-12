import { ArrowLeft, ClipboardList, Pill, Stethoscope } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { doctorNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctorPrescriptionDetailsQuery } from "@/hooks/useDoctorWorkflow";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import { formatDisplayDate } from "@/lib/date-time";

const formatDate = (value?: string | null) => formatDisplayDate(value);

const getStatusClassName = (status?: string | null) => {
  switch ((status ?? "").toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-700 border-green-200";
    case "expired":
      return "bg-red-100 text-red-700 border-red-200";
    case "completed":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-lg border p-4">
    <p className="mb-1 text-sm font-medium">{label}</p>
    <p className="text-sm text-muted-foreground">{String(value)}</p>
  </div>
);

const DoctorPrescriptionDetails = () => {
  const { prescriptionId } = useParams();
  const { user } = useAuth();
  const query = useDoctorPrescriptionDetailsQuery(prescriptionId, Boolean(user));
  const userName = getDisplayName(user ?? {});

  const appointmentId = query.data?.appointmentId ?? null;
  const details = query.data;

  const medicationRows = details
    ? [
        details.dosage ? { label: "Dosage", value: details.dosage } : null,
        details.frequency ? { label: "Frequency", value: details.frequency } : null,
        details.duration ? { label: "Duration", value: details.duration } : null,
        details.quantity ? { label: "Quantity", value: details.quantity } : null,
        details.instructions ? { label: "Instructions", value: details.instructions } : null,
        details.diagnosis ? { label: "Diagnosis", value: details.diagnosis } : null,
        details.notes ? { label: "Notes", value: details.notes } : null,
        details.refillsRemaining != null
          ? { label: "Remaining Refills", value: details.refillsRemaining }
          : null,
      ].filter(Boolean)
    : [];

  const summaryRows = details
    ? [
        { label: "Prescription ID", value: details.id },
        details.prescriptionNumber ? { label: "Reference", value: details.prescriptionNumber } : null,
        details.patientName ? { label: "Patient", value: details.patientName } : null,
        details.patientId ? { label: "Patient ID", value: details.patientId } : null,
        details.prescribedAt ? { label: "Prescribed At", value: formatDate(details.prescribedAt) } : null,
        details.expiresAt ? { label: "Expires At", value: formatDate(details.expiresAt) } : null,
      ].filter(Boolean)
    : [];

  return (
    <DashboardLayout
      userRole="doctor"
      userName={userName}
      userSubtitle="Doctor account"
      navItems={doctorNavItems}
      userIcon={Stethoscope}
    >
      <div className="mb-6">
        <Button asChild variant="ghost" className="-ml-4 mb-2">
          <Link to="/doctor/prescriptions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to prescriptions
          </Link>
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">Prescription Details</h1>
        <p className="text-muted-foreground">Review prescription details for this patient.</p>
      </div>

      {query.isLoading ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load prescription details</AlertTitle>
          <AlertDescription>{(query.error as Error).message}</AlertDescription>
        </Alert>
      ) : details ? (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Pill className="h-5 w-5" />
                </div>
                <CardTitle>{details.medicationName}</CardTitle>
                <Badge className={getStatusClassName(details.status)}>{details.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {medicationRows.length ? (
                medicationRows.map((row) => (
                  <DetailRow key={row.label} label={row.label} value={row.value} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No medication details were returned for this prescription.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="h-5 w-5" />
                  Prescription Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {summaryRows.map((row) => (
                  <DetailRow key={row.label} label={row.label} value={row.value} />
                ))}
              </CardContent>
            </Card>

            {appointmentId ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Linked Appointment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DetailRow label="Appointment ID" value={appointmentId} />
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/doctor/appointments/${appointmentId}`}>Open appointment</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Prescription details were not returned for this record.
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default DoctorPrescriptionDetails;
