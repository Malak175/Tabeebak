import { FormEvent, useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { ArrowLeft, Building2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import AvailableTimeSlotsPicker from "@/components/booking/AvailableTimeSlotsPicker";
import { EmptyCard, ErrorCard, LoadingCard, SectionCard } from "@/components/patient/BookingFlowSection";
import { patientBookingNavItems } from "@/components/patient/patientNavigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import {
  useCreateTestRequestMutation,
  useLabAvailableSlotsQuery,
  useLabBookingDetailQuery,
  useLabBranchesDetailQuery,
  useLabServicesDetailQuery,
} from "@/hooks/usePatientBooking";
import { getDisplayName } from "@/lib/auth";
import { buildStableKey } from "@/lib/reactKeys";
import { cn } from "@/lib/utils";

const PatientLabDetailsPage = () => {
  const { labId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = getDisplayName(user ?? {});
  const labQuery = useLabBookingDetailQuery(labId);
  const branchesQuery = useLabBranchesDetailQuery(labId);
  const servicesQuery = useLabServicesDetailQuery(labId);
  const createRequestMutation = useCreateTestRequestMutation();
  const slotRange = useMemo(() => {
    const today = new Date();
    return {
      startDate: format(today, "yyyy-MM-dd"),
      endDate: format(addDays(today, 14), "yyyy-MM-dd"),
    };
  }, []);
  const slotsQuery = useLabAvailableSlotsQuery(labId, labId ? slotRange : undefined);

  const [selectedSlotStart, setSelectedSlotStart] = useState("");
  const [branchId, setBranchId] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [homeCollection, setHomeCollection] = useState(false);

  const lab = labQuery.data;
  const services = useMemo(() => servicesQuery.data ?? [], [servicesQuery.data]);
  const branches = useMemo(() => branchesQuery.data ?? [], [branchesQuery.data]);
  const effectiveLabId = useMemo(() => {
    if (!lab) return "";
    return String(lab.labId ?? lab.id ?? "").trim();
  }, [lab]);
  const supportsHomeCollection = lab?.homeCollectionAvailable === true;

  const detailRows = useMemo(
    () =>
      [
        lab?.address ? { label: "Address", value: lab.address } : null,
        lab?.website ? { label: "Website", value: lab.website } : null,
        lab?.establishedYear != null ? { label: "Established", value: String(lab.establishedYear) } : null,
        lab?.licenseNumber ? { label: "License", value: lab.licenseNumber } : null,
        lab?.phone ? { label: "Phone", value: lab.phone } : null,
        lab?.email ? { label: "Email", value: lab.email } : null,
      ].filter((item): item is { label: string; value: string } => Boolean(item)),
    [lab],
  );

  useEffect(() => {
    setSelectedSlotStart("");
    setBranchId("");
    setServiceIds([]);
    setNote("");
    setHomeCollection(false);
  }, [labId]);

  useEffect(() => {
    if (!selectedSlotStart) return;
    const slots = slotsQuery.data?.slots ?? [];
    const stillAvailable = slots.some((slot) => slot.startAt === selectedSlotStart);
    if (!stillAvailable) {
      setSelectedSlotStart("");
    }
  }, [selectedSlotStart, slotsQuery.data?.slots]);

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    setServiceIds((current) =>
      checked
        ? current.includes(serviceId)
          ? current
          : [...current, serviceId]
        : current.filter((item) => item !== serviceId),
    );
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!effectiveLabId) {
      toast.error("Lab request cannot be submitted because the lab ID is missing.");
      return;
    }
    if (!selectedSlotStart) {
      toast.error("Select an available slot before submitting the request.");
      return;
    }
    if (servicesQuery.isLoading) {
      toast.error("Lab services are still loading. Please wait a moment.");
      return;
    }
    if (!services.length) {
      toast.error("This lab has no published services yet. You cannot submit a request.");
      return;
    }
    if (serviceIds.length === 0) {
      toast.error("Select at least one test or service to request.");
      return;
    }

    createRequestMutation.mutate(
      {
        labId: effectiveLabId,
        slotStart: selectedSlotStart,
        branchId: branchId || undefined,
        serviceIds,
        note: note.trim() || undefined,
        ...(supportsHomeCollection && homeCollection ? { homeCollection: true } : {}),
      },
      {
        onSuccess: (request) => {
          toast.success("Lab request submitted.");
          if (request.id) {
            navigate(`/patient/requests/lab/${request.id}`);
          } else {
            navigate("/patient/requests");
          }
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
          Review the lab profile and choose a time that works for you.
        </p>
      </div>

      {labQuery.isLoading ? (
        <LoadingCard lines={6} />
      ) : labQuery.isError ? (
        <ErrorCard title="Unable to load lab profile" message={(labQuery.error as Error).message} />
      ) : lab ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <SectionCard title={lab.name} description={lab.accreditation || undefined}>
              <div className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  {lab.description || "No lab description available yet."}
                </p>
                {detailRows.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {detailRows.map((item, index) => (
                      <div
                        key={buildStableKey([item.label, item.value, index], `lab-detail-${index}`)}
                        className="rounded-lg border p-4"
                      >
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No address or contact details have been published yet.
                  </p>
                )}
                <div className="space-y-1 text-sm text-muted-foreground">
                  {lab.homeCollectionAvailable === true ? <p>Home sample collection is available.</p> : null}
                  {lab.homeCollectionAvailable === false ? <p>Home sample collection is not available.</p> : null}
                  {lab.homeCollectionAvailable == null ? (
                    <p>Home collection availability has not been published yet.</p>
                  ) : null}
                  {servicesQuery.isLoading ? <p>Loading published services…</p> : null}
                  {!servicesQuery.isLoading && services.length === 0 ? (
                    <p>No published services yet.</p>
                  ) : null}
                  {!servicesQuery.isLoading && services.length > 0 ? (
                    <p>{services.length} test{services.length === 1 ? "" : "s"} available to book.</p>
                  ) : null}
                </div>
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Book an appointment" description="Choose a time and share a quick note.">
            <form onSubmit={handleSubmit} className="space-y-4">
              <AvailableTimeSlotsPicker
                slots={slotsQuery.data?.slots ?? []}
                selectedSlotStart={selectedSlotStart}
                onSelect={setSelectedSlotStart}
                isLoading={slotsQuery.isLoading}
                isError={slotsQuery.isError}
                errorMessage={(slotsQuery.error as Error | undefined)?.message}
              />

              <div className="space-y-2">
                <Label>Tests & services</Label>
                {servicesQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading services…</p>
                ) : servicesQuery.isError ? (
                  <p className="text-sm text-destructive">{(servicesQuery.error as Error).message}</p>
                ) : !services.length ? (
                  <p className="text-sm text-muted-foreground">No services are available to book yet.</p>
                ) : (
                  <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-3">
                    {services.map((service, index) => {
                      const checked = serviceIds.includes(service.id);
                      return (
                        <label
                          key={buildStableKey(
                            [service.id, service.name, service.category, index],
                            `lab-service-choice-${index}`,
                          )}
                          className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-muted/60",
                            checked && "bg-primary/5",
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(value) => handleServiceToggle(service.id, value === true)}
                            className="mt-0.5"
                          />
                          <span className="min-w-0 text-sm">
                            <span className="block font-medium">{service.name}</span>
                            {service.category || service.sampleType ? (
                              <span className="text-xs text-muted-foreground">
                                {[service.category, service.sampleType].filter(Boolean).join(" · ")}
                              </span>
                            ) : null}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {branches.length ? (
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch (optional)</Label>
                  <Select
                    value={branchId || "__none__"}
                    onValueChange={(value) => setBranchId(value === "__none__" ? "" : value)}
                  >
                    <SelectTrigger id="branch">
                      <SelectValue placeholder="Choose a branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No preference</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {supportsHomeCollection ? (
                <div className="flex items-start gap-3 rounded-lg border p-3">
                  <Checkbox
                    id="homeCollection"
                    checked={homeCollection}
                    onCheckedChange={(value) => setHomeCollection(value === true)}
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="homeCollection" className="text-sm font-medium">
                      Request home sample collection
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      The lab offers home visits for sample collection when available.
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor="note">Additional note (optional)</Label>
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
                  !effectiveLabId ||
                  !selectedSlotStart ||
                  servicesQuery.isLoading ||
                  !services.length ||
                  serviceIds.length === 0
                }
              >
                {createRequestMutation.isPending ? "Submitting..." : "Request appointment"}
              </Button>
              {!effectiveLabId ? (
                <p className="text-sm text-destructive">
                  This profile is missing the lab ID required for request submission.
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
