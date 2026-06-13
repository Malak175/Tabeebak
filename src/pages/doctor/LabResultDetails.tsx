import { ArrowLeft, FlaskConical } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { doctorNavItems } from "@/components/settings/AccountSettingsContent";
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
import { useDoctorLabResultDetailsQuery } from "@/hooks/useDoctorWorkflow";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";
import { formatDisplayDateTime } from "@/lib/date-time";
import {
  formatLabResultDocumentStatusLabel,
  getDoctorLabWorkflowBadgeClassName,
  getDoctorLabWorkflowLabel,
  resolveLabResultTitle,
} from "@/lib/labResultDisplay";

const formatDate = (value?: string | null) => formatDisplayDateTime(value);

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value?.trim()) return null;

  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
};

const DoctorLabResultDetails = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const query = useDoctorLabResultDetailsQuery(resultId, Boolean(user));
  const userName = getDisplayName(user ?? {});
  const result = query.data;
  const title = result
    ? resolveLabResultTitle({
        testName: result.testName,
        fileName: result.fileName,
      })
    : null;
  const patientSummaryPath = result?.patientId ? `/doctor/patients/${result.patientId}` : "/doctor/patients";

  return (
    <DashboardLayout
      userRole="doctor"
      userName={userName}
      userSubtitle="Doctor account"
      navItems={doctorNavItems}
      userIcon={FlaskConical}
    >
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Lab Result Details</h1>
          <p className="text-muted-foreground">Review the uploaded lab result and open the full report.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button asChild variant="secondary">
            <Link to={patientSummaryPath}>Patient summary</Link>
          </Button>
        </div>
      </div>

      {query.isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : query.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Unable to load lab result</AlertTitle>
          <AlertDescription>
            {(query.error as Error).message}
            <Button variant="outline" size="sm" className="mt-3" onClick={() => void query.refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : result && title ? (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl">{title}</CardTitle>
                {result.patientName ? (
                  <p className="mt-1 text-sm text-muted-foreground">{result.patientName}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={getDoctorLabWorkflowBadgeClassName({
                    orderStatus: result.orderStatus,
                    resultStatus: result.resultStatus ?? result.status,
                  })}
                >
                  {getDoctorLabWorkflowLabel({
                    orderStatus: result.orderStatus,
                    resultStatus: result.resultStatus ?? result.status,
                  })}
                </Badge>
                {result.resultStatus ? (
                  <Badge variant="outline">
                    {formatLabResultDocumentStatusLabel(result.resultStatus)}
                  </Badge>
                ) : null}
                {result.reportUrl ? (
                  <Button asChild size="sm" variant="outline">
                    <a href={result.reportUrl} target="_blank" rel="noreferrer">
                      Open report
                    </a>
                  </Button>
                ) : null}
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Result summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailItem label="Laboratory" value={result.laboratoryName} />
                <DetailItem label="Ordering clinician" value={result.orderingDoctorName} />
                <DetailItem label="Order ID" value={result.orderId} />
                <DetailItem label="Result ID" value={result.id} />
                <DetailItem label="Reported at" value={formatDate(result.reportedAt)} />
                <DetailItem label="Collected at" value={formatDate(result.collectedAt)} />
                <DetailItem label="Ordered at" value={formatDate(result.orderedAt)} />
                {result.fileName ? <DetailItem label="Report file" value={result.fileName} /> : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clinical notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <DetailItem label="Summary" value={result.summary} />
                <DetailItem label="Conclusion" value={result.conclusion} />
                <DetailItem label="Notes" value={result.notes} />
                {!result.summary && !result.conclusion && !result.notes ? (
                  <p className="text-sm text-muted-foreground">No structured notes were attached to this result.</p>
                ) : null}
              </CardContent>
            </Card>
          </div>

          {result.measurements?.length ? (
            <Card>
              <CardHeader>
                <CardTitle>Measurements</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Flag</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.measurements.map((measurement) => (
                      <TableRow key={measurement.name}>
                        <TableCell className="font-medium">{measurement.name}</TableCell>
                        <TableCell>{measurement.value || "—"}</TableCell>
                        <TableCell>{measurement.unit || "—"}</TableCell>
                        <TableCell>{measurement.referenceRange || "—"}</TableCell>
                        <TableCell>{measurement.status || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Lab result was not returned for this record.
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default DoctorLabResultDetails;
