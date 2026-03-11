import { Link, useParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { usePatientPrescriptionDetailsQuery } from "@/hooks/usePatientRecords";
import { patientNavItems } from "@/pages/patient/navigation";
import { AlertCircle, Pill, User } from "lucide-react";

const formatDate = (value?: string) => {
  if (!value) return "Date unavailable";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

const getStatusColor = (status?: string) => {
  switch ((status ?? "").toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-700";
    case "completed":
      return "bg-muted text-muted-foreground";
    case "expired":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-primary/10 text-primary";
  }
};

const PatientPrescriptionDetails = () => {
  const { user } = useAuth();
  const { prescriptionId } = useParams();
  const prescriptionQuery = usePatientPrescriptionDetailsQuery(prescriptionId);

  return (
    <DashboardLayout
      userRole="patient"
      userName={user?.name ?? "Patient"}
      navItems={patientNavItems}
      userIcon={User}
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Prescription Details</h1>
          <p className="text-muted-foreground">
            Review medication instructions and prescription metadata.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/patient/prescriptions">Back to prescriptions</Link>
        </Button>
      </div>

      {!prescriptionId ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid prescription</AlertTitle>
          <AlertDescription>The prescription identifier is missing.</AlertDescription>
        </Alert>
      ) : prescriptionQuery.isLoading ? (
        <Skeleton className="h-80 w-full" />
      ) : prescriptionQuery.isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Prescription unavailable</AlertTitle>
          <AlertDescription>{prescriptionQuery.error.message}</AlertDescription>
        </Alert>
      ) : prescriptionQuery.data ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="text-xl">
                  {prescriptionQuery.data.medications[0]?.name ?? "Prescription"}
                </CardTitle>
                <Badge className={getStatusColor(prescriptionQuery.data.status)}>
                  {prescriptionQuery.data.status ?? "issued"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-muted/50 p-4">
                <h2 className="mb-2 font-medium">Prescribed On</h2>
                <p className="text-sm text-muted-foreground">
                  {formatDate(prescriptionQuery.data.prescribedAt)}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <h2 className="mb-2 font-medium">Prescribed By</h2>
                <p className="text-sm text-muted-foreground">
                  {prescriptionQuery.data.doctorName ?? "Assigned doctor"}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4 md:col-span-2">
                <h2 className="mb-2 font-medium">Diagnosis</h2>
                <p className="text-sm text-muted-foreground">
                  {prescriptionQuery.data.diagnosis ?? "No diagnosis was provided."}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4 md:col-span-2">
                <h2 className="mb-2 font-medium">Notes</h2>
                <p className="text-sm text-muted-foreground">
                  {prescriptionQuery.data.notes ??
                    "No additional prescription notes are available."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {prescriptionQuery.data.medications.length ? (
                prescriptionQuery.data.medications.map((medication) => (
                  <div className="rounded-xl bg-muted/50 p-4" key={medication.id}>
                    <div className="mb-2 flex items-center gap-2">
                      <Pill className="h-4 w-4 text-primary" />
                      <h3 className="font-medium">{medication.name}</h3>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <p className="text-sm text-muted-foreground">
                        Dosage: {medication.dosage ?? "Not provided"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Frequency: {medication.frequency ?? "Not provided"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Duration: {medication.duration ?? "Not provided"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Instructions: {medication.instructions ?? "Not provided"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No medication lines found</AlertTitle>
                  <AlertDescription>
                    This prescription did not return medication items.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </DashboardLayout>
  );
};

export default PatientPrescriptionDetails;
