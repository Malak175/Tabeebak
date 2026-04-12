import { ArrowLeft, ClipboardList, Pill, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { patientNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatientPrescriptionDetailsQuery } from "@/hooks/usePatientProfile";
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

const DetailRow = ({ label, value }: { label: string; value?: string | null | number }) => (
  <div className="rounded-lg border p-4">
    <p className="mb-1 text-sm font-medium">{label}</p>
    <p className="text-sm text-muted-foreground">
      {value === null || value === undefined || value === "" ? "Not available" : String(value)}
    </p>
  </div>
);

const PatientPrescriptionDetails = () => {
  const { prescriptionId } = useParams();
  const { user } = useAuth();
  const query = usePatientPrescriptionDetailsQuery(prescriptionId, Boolean(user));
  const userName = getDisplayName(user ?? {});

  return (
    <DashboardLayout
      userRole="patient"
      userName={userName}
      navItems={patientNavItems}
      userIcon={User}
    >
      <div className="mb-6">
        <Button asChild variant="ghost" className="-ml-4 mb-2">
          <Link to="/patient/prescriptions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to prescriptions
          </Link>
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">Prescription Details</h1>
        <p className="text-muted-foreground">
          This page shows details for a single prescription.
        </p>
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
      ) : query.data ? (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Pill className="h-5 w-5" />
                </div>
                <CardTitle>{query.data.medicationName}</CardTitle>
                <Badge className={getStatusClassName(query.data.status)}>{query.data.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <DetailRow label="Dosage" value={query.data.dosage} />
              <DetailRow label="Frequency" value={query.data.frequency} />
              <DetailRow label="Duration" value={query.data.duration} />
              <DetailRow label="Quantity" value={query.data.quantity} />
              <DetailRow label="Instructions" value={query.data.instructions} />
              <DetailRow label="Diagnosis" value={query.data.diagnosis} />
              <DetailRow label="Notes" value={query.data.notes} />
              <DetailRow label="Remaining Refills" value={query.data.refillsRemaining} />
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
                <DetailRow label="Prescription ID" value={query.data.id} />
                <DetailRow label="Reference" value={query.data.prescriptionNumber} />
                <DetailRow label="Prescribed By" value={query.data.prescriberName} />
                <DetailRow label="Prescribed At" value={formatDate(query.data.prescribedAt)} />
                <DetailRow label="Expires At" value={formatDate(query.data.expiresAt)} />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
};

export default PatientPrescriptionDetails;
