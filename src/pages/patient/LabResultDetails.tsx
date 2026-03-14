import { format, isValid, parseISO } from "date-fns";
import { ArrowLeft, Download, FlaskConical, User } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { patientNavItems } from "@/components/settings/AccountSettingsContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePatientLabResultDetailsQuery } from "@/hooks/usePatientProfile";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";

const formatDate = (value?: string | null) => {
  if (!value) return "Not available";

  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;

  return format(parsed, "PPP");
};

const getStatusClassName = (status?: string | null) => {
  switch ((status ?? "").toLowerCase()) {
    case "completed":
    case "final":
    case "ready":
      return "bg-green-100 text-green-700 border-green-200";
    case "pending":
    case "processing":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const DetailRow = ({ label, value }: { label: string; value?: string | null }) => (
  <div className="rounded-lg border p-4">
    <p className="mb-1 text-sm font-medium">{label}</p>
    <p className="text-sm text-muted-foreground">{value || "Not available"}</p>
  </div>
);

const PatientLabResultDetails = () => {
  const { resultId } = useParams();
  const { user } = useAuth();
  const query = usePatientLabResultDetailsQuery(resultId, Boolean(user));
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
          <Link to="/patient/lab-results">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to lab records
          </Link>
        </Button>
        <h1 className="text-2xl font-bold md:text-3xl">Lab Result Details</h1>
        <p className="text-muted-foreground">
          Result details are loaded per record from the patient lab results detail endpoint.
        </p>
      </div>

      {query.isLoading ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-28 w-full" />
          </CardContent>
        </Card>
      ) : query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load lab result details</AlertTitle>
          <AlertDescription>{(query.error as Error).message}</AlertDescription>
        </Alert>
      ) : query.data ? (
        <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FlaskConical className="h-5 w-5" />
                  </div>
                  <CardTitle>{query.data.testName}</CardTitle>
                  <Badge className={getStatusClassName(query.data.status)}>{query.data.status}</Badge>
                  {query.data.isAbnormal ? <Badge variant="destructive">Abnormal</Badge> : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <DetailRow label="Category" value={query.data.category} />
                  <DetailRow label="Laboratory" value={query.data.laboratoryName} />
                  <DetailRow label="Ordering Doctor" value={query.data.orderingDoctorName} />
                  <DetailRow label="Reported At" value={formatDate(query.data.reportedAt)} />
                  <DetailRow label="Collected At" value={formatDate(query.data.collectedAt)} />
                  <DetailRow label="Interpretation" value={query.data.interpretation} />
                  <DetailRow label="Conclusion" value={query.data.conclusion} />
                  <DetailRow label="Notes" value={query.data.notes} />
                </div>

                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Measurement</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {query.data.measurements.length ? (
                        query.data.measurements.map((measurement, index) => (
                          <TableRow key={`${measurement.name}-${index}`}>
                            <TableCell>{measurement.name}</TableCell>
                            <TableCell>
                              {[measurement.value, measurement.unit].filter(Boolean).join(" ")}
                            </TableCell>
                            <TableCell>{measurement.referenceRange || "Not provided"}</TableCell>
                            <TableCell>{measurement.status || "Normal"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No measurement breakdown was returned for this result.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Result Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DetailRow label="Result ID" value={query.data.id} />
                <DetailRow label="Reference" value={query.data.resultNumber} />
                <DetailRow label="Ordered At" value={formatDate(query.data.orderedAt)} />
                {query.data.reportUrl ? (
                  <Button asChild className="w-full" variant="outline">
                    <a href={query.data.reportUrl} target="_blank" rel="noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Open Full Report
                    </a>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  );
};

export default PatientLabResultDetails;
