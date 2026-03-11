import { Link, useParams } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { usePatientLabResultDetailsQuery } from "@/hooks/usePatientRecords";
import { patientNavItems } from "@/pages/patient/navigation";
import {
  AlertCircle,
  Download,
  FlaskConical,
  Minus,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";

const formatDate = (value?: string) => {
  if (!value) return "Date unavailable";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

const getStatusColor = (status?: string) => {
  switch ((status ?? "").toLowerCase()) {
    case "normal":
    case "completed":
      return "bg-green-100 text-green-700";
    case "critical":
      return "bg-red-100 text-red-700";
    case "high":
    case "abnormal":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getMeasurementIcon = (status?: string) => {
  switch ((status ?? "").toLowerCase()) {
    case "high":
    case "abnormal":
      return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    case "low":
      return <TrendingDown className="h-4 w-4 text-blue-600" />;
    default:
      return <Minus className="h-4 w-4 text-green-600" />;
  }
};

const PatientLabResultDetails = () => {
  const { user } = useAuth();
  const { resultId } = useParams();
  const labResultQuery = usePatientLabResultDetailsQuery(resultId);

  return (
    <DashboardLayout
      userRole="patient"
      userName={user?.name ?? "Patient"}
      navItems={patientNavItems}
      userIcon={User}
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Lab Result Details</h1>
          <p className="text-muted-foreground">
            Review the full result returned by the backend.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/patient/lab-results">Back to lab results</Link>
        </Button>
      </div>

      {!resultId ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid result</AlertTitle>
          <AlertDescription>The result identifier is missing.</AlertDescription>
        </Alert>
      ) : labResultQuery.isLoading ? (
        <Skeleton className="h-80 w-full" />
      ) : labResultQuery.isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lab result unavailable</AlertTitle>
          <AlertDescription>{labResultQuery.error.message}</AlertDescription>
        </Alert>
      ) : labResultQuery.data ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-3">
                <CardTitle className="text-xl">{labResultQuery.data.testName}</CardTitle>
                <Badge className={getStatusColor(labResultQuery.data.status)}>
                  {labResultQuery.data.status ?? "ready"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-muted/50 p-4">
                <h2 className="mb-2 font-medium">Result Date</h2>
                <p className="text-sm text-muted-foreground">
                  {formatDate(labResultQuery.data.resultDate)}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <h2 className="mb-2 font-medium">Lab</h2>
                <p className="text-sm text-muted-foreground">
                  {labResultQuery.data.labName ?? "Lab unavailable"}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <h2 className="mb-2 font-medium">Doctor</h2>
                <p className="text-sm text-muted-foreground">
                  {labResultQuery.data.doctorName ?? "Assigned doctor"}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4">
                <h2 className="mb-2 font-medium">Notes</h2>
                <p className="text-sm text-muted-foreground">
                  {labResultQuery.data.notes ?? "No result notes are available."}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-4 md:col-span-2">
                <h2 className="mb-2 font-medium">Summary</h2>
                <p className="text-sm text-muted-foreground">
                  {labResultQuery.data.summary ?? "No result summary is available."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Measurements</CardTitle>
              {labResultQuery.data.fileUrl && (
                <Button asChild variant="outline">
                  <a href={labResultQuery.data.fileUrl} rel="noreferrer" target="_blank">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </a>
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {labResultQuery.data.measurements.length ? (
                labResultQuery.data.measurements.map((measurement) => (
                  <div className="rounded-xl bg-muted/50 p-4" key={measurement.id}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FlaskConical className="h-4 w-4 text-primary" />
                        <h3 className="font-medium">{measurement.name}</h3>
                      </div>
                      {getMeasurementIcon(measurement.status)}
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <p className="text-sm text-muted-foreground">
                        Value:{" "}
                        {[measurement.value, measurement.unit]
                          .filter(Boolean)
                          .join(" ") || "Unavailable"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Range: {measurement.range ?? "Unavailable"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Status: {measurement.status ?? "Unavailable"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No measurements found</AlertTitle>
                  <AlertDescription>
                    The backend did not return detailed measurement rows for this result.
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

export default PatientLabResultDetails;
