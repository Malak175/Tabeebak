import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, Building2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  EmptyCard,
  ErrorCard,
  LoadingCard,
  SectionCard,
} from "@/components/patient/BookingFlowSection";
import { patientBookingNavItems } from "@/components/patient/patientNavigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import {
  useCreateTestRequestMutation,
  useLabBookingDetailQuery,
  useLabBranchesDetailQuery,
  useLabServicesDetailQuery,
} from "@/hooks/usePatientBooking";
import { getDisplayName } from "@/lib/auth";

const PatientLabDetailsPage = () => {
  const { labId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = getDisplayName(user ?? {});
  const labQuery = useLabBookingDetailQuery(labId);
  const branchesQuery = useLabBranchesDetailQuery(labId);
  const servicesQuery = useLabServicesDetailQuery(labId);
  const createRequestMutation = useCreateTestRequestMutation();

  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [branchId, setBranchId] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [homeCollection, setHomeCollection] = useState(false);

  const services = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data]);
  const branches = useMemo(() => branchesQuery.data ?? [], [branchesQuery.data]);

  const branchSummary = useMemo(
    () => branches.find((branch) => branch.id === branchId),
    [branchId, branches],
  );

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    setServiceIds((current) =>
      checked ? [...current, serviceId] : current.filter((item) => item !== serviceId),
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!labId) return;

    createRequestMutation.mutate(
      {
        labId,
        preferredDate,
        preferredTime,
        branchId: branchId || undefined,
        serviceIds,
        note: note || undefined,
        homeCollection,
      },
      {
        onSuccess: (request) => {
          toast.success("Lab request submitted.");
          navigate(`/patient/requests/lab/${request.id}`);
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  return (
    <DashboardLayout userRole="patient" userName={userName} navItems={patientBookingNavItems} userIcon={Building2}>
      <div className="mb-6">
        <Button asChild variant="ghost" className="-ml-4 mb-3">
          <Link to="/patient/labs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to labs
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Lab details</h1>
        <p className="mt-2 text-muted-foreground">
          Compare branches and services, then send a backend-backed test request.
        </p>
      </div>

      {labQuery.isLoading ? (
        <LoadingCard lines={6} />
      ) : labQuery.isError ? (
        <ErrorCard title="Unable to load lab profile" message={(labQuery.error as Error).message} />
      ) : labQuery.data ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <SectionCard title={labQuery.data.name} description={labQuery.data.accreditation || undefined}>
              <div className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  {labQuery.data.description || "This lab has not added a description yet."}
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Address</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {labQuery.data.address || "Not available"}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Home collection</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {labQuery.data.homeCollectionAvailable ? "Supported" : "Not listed"}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Website</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {labQuery.data.website || "Not available"}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Established</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {labQuery.data.establishedYear || "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Branches" description="Rendered from /api/v1/labs/:labId/branches">
              {branchesQuery.isLoading ? (
                <LoadingCard lines={4} />
              ) : branchesQuery.isError ? (
                <ErrorCard title="Unable to load branches" message={(branchesQuery.error as Error).message} />
              ) : branches.length ? (
                <div className="space-y-3">
                  {branches.map((branch) => (
                    <div key={branch.id} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{branch.name}</p>
                        {branch.isMainBranch ? <Badge>Main branch</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{branch.address || "Address pending"}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {branch.operatingHours || "Hours not published"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyCard title="No branches available" description="The lab has not published branches yet." />
              )}
            </SectionCard>

            <SectionCard title="Services" description="Rendered from /api/v1/labs/:labId/services">
              {servicesQuery.isLoading ? (
                <LoadingCard lines={4} />
              ) : servicesQuery.isError ? (
                <ErrorCard title="Unable to load services" message={(servicesQuery.error as Error).message} />
              ) : services.length ? (
                <div className="space-y-3">
                  {services.map((service) => (
                    <div key={service.id} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{service.name}</p>
                        <Badge variant="outline">
                          {service.price ? `${service.price} ${service.currency || ""}`.trim() : "Price pending"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {service.description || service.category || "No description"}
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {service.turnaroundTime || "Turnaround time pending"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyCard title="No services available" description="The lab has not published services yet." />
              )}
            </SectionCard>
          </div>

          <SectionCard title="Send lab request" description="Patient-only mutation against /api/v1/test-requests">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preferredDate">Preferred date</Label>
                <Input
                  id="preferredDate"
                  type="date"
                  value={preferredDate}
                  onChange={(event) => setPreferredDate(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredTime">Preferred time</Label>
                <Input
                  id="preferredTime"
                  type="time"
                  value={preferredTime}
                  onChange={(event) => setPreferredTime(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branchId">Preferred branch</Label>
                <Input
                  id="branchId"
                  value={branchSummary?.name || ""}
                  onChange={() => undefined}
                  placeholder="Select below"
                  readOnly
                />
                <div className="max-h-44 space-y-2 overflow-auto rounded-lg border p-3">
                  {branches.map((branch) => (
                    <label key={branch.id} className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted/50">
                      <input
                        type="radio"
                        name="branch"
                        className="mt-1"
                        checked={branchId === branch.id}
                        onChange={() => setBranchId(branch.id)}
                      />
                      <span className="text-sm">
                        <span className="block font-medium">{branch.name}</span>
                        <span className="text-muted-foreground">{branch.address || "Address pending"}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Select services</Label>
                <div className="max-h-56 space-y-2 overflow-auto rounded-lg border p-3">
                  {services.map((service) => (
                    <label key={service.id} className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted/50">
                      <Checkbox
                        checked={serviceIds.includes(service.id)}
                        onCheckedChange={(checked) => handleServiceToggle(service.id, Boolean(checked))}
                      />
                      <span className="text-sm">
                        <span className="block font-medium">{service.name}</span>
                        <span className="text-muted-foreground">
                          {service.turnaroundTime || "Turnaround pending"}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-start gap-3 rounded-lg border p-4">
                <Checkbox checked={homeCollection} onCheckedChange={(checked) => setHomeCollection(Boolean(checked))} />
                <span className="text-sm">
                  <span className="block font-medium">Request home collection</span>
                  <span className="text-muted-foreground">
                    Select this if the lab supports sample collection at home.
                  </span>
                </span>
              </label>
              <div className="space-y-2">
                <Label htmlFor="note">Extra note</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={createRequestMutation.isPending || serviceIds.length === 0}
              >
                {createRequestMutation.isPending ? "Submitting..." : "Submit lab request"}
              </Button>
            </form>
          </SectionCard>
        </div>
      ) : (
        <EmptyCard title="Lab not found" description="This provider profile is unavailable." />
      )}
    </DashboardLayout>
  );
};

export default PatientLabDetailsPage;
