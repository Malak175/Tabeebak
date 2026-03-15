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
  const profileRows = useMemo(
    () =>
      [
        labQuery.data?.address ? { label: "Address", value: labQuery.data.address } : null,
        labQuery.data?.website ? { label: "Website", value: labQuery.data.website } : null,
        labQuery.data?.establishedYear != null
          ? { label: "Established", value: String(labQuery.data.establishedYear) }
          : null,
        labQuery.data?.licenseNumber ? { label: "License", value: labQuery.data.licenseNumber } : null,
        labQuery.data?.phone ? { label: "Phone", value: labQuery.data.phone } : null,
        labQuery.data?.email ? { label: "Email", value: labQuery.data.email } : null,
      ].filter((item): item is { label: string; value: string } => Boolean(item)),
    [labQuery.data],
  );

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    setServiceIds((current) =>
      checked ? [...current, serviceId] : current.filter((item) => item !== serviceId),
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!labQuery.data?.labId) {
      toast.error("Lab request cannot be submitted because the backend lab_id is missing.");
      return;
    }

    createRequestMutation.mutate(
      {
        labId: labQuery.data.labId,
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
                  {labQuery.data.description || "No lab description available yet."}
                </p>
                {profileRows.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {profileRows.map((item) => (
                      <div key={item.label} className="rounded-lg border p-4">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No additional lab profile details have been published yet.
                  </p>
                )}
                <div className="space-y-1 text-sm text-muted-foreground">
                  {labQuery.data.homeCollectionAvailable === true ? <p>Home collection is supported.</p> : null}
                  {labQuery.data.homeCollectionAvailable === false ? <p>Home collection is not supported.</p> : null}
                  {labQuery.data.homeCollectionAvailable == null ? <p>Home collection availability has not been published yet.</p> : null}
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
                      {branch.address ? <p className="mt-1 text-sm text-muted-foreground">{branch.address}</p> : null}
                      {branch.operatingHours ? (
                        <p className="mt-2 text-sm text-muted-foreground">{branch.operatingHours}</p>
                      ) : (
                        <p className="mt-2 text-sm text-muted-foreground">Operating hours not published yet.</p>
                      )}
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
                        {service.price != null ? (
                          <Badge variant="outline">{`${service.price} ${service.currency || ""}`.trim()}</Badge>
                        ) : null}
                      </div>
                      {service.description ? (
                        <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
                      ) : null}
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {service.category ? <span>{service.category}</span> : null}
                        {service.sampleType ? <span>{service.sampleType}</span> : null}
                        {service.turnaroundTime ? <span>{service.turnaroundTime}</span> : null}
                      </div>
                      {!service.description && !service.category && !service.sampleType && !service.turnaroundTime && service.price == null ? (
                        <p className="mt-2 text-sm text-muted-foreground">No extra service details published yet.</p>
                      ) : null}
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
                <Label>Preferred branch</Label>
                {branches.length ? (
                  <>
                    {branchSummary ? (
                      <p className="text-sm text-muted-foreground">Selected: {branchSummary.name}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Choose a branch if you have a preferred location.</p>
                    )}
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
                            {branch.address ? (
                              <span className="text-muted-foreground">{branch.address}</span>
                            ) : null}
                          </span>
                        </label>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No branches have been published yet.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Select services</Label>
                {services.length ? (
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
                            {service.turnaroundTime || service.category || "No extra service details published yet."}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No services are available yet, so a lab request cannot be submitted from this page.
                  </p>
                )}
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
                disabled={
                  createRequestMutation.isPending ||
                  services.length === 0 ||
                  serviceIds.length === 0 ||
                  !labQuery.data.labId
                }
              >
                {createRequestMutation.isPending ? "Submitting..." : "Submit lab request"}
              </Button>
              {!labQuery.data.labId ? (
                <p className="text-sm text-destructive">
                  This profile is missing the backend lab ID required for request submission.
                </p>
              ) : null}
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
