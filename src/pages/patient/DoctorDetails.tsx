import { FormEvent, useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { ArrowLeft, User } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import AvailableTimeSlotsPicker from "@/components/booking/AvailableTimeSlotsPicker";
import { EmptyCard, ErrorCard, LoadingCard, SectionCard } from "@/components/patient/BookingFlowSection";
import { DoctorRecentReviewsSection } from "@/components/reviews/DoctorRecentReviewsSection";
import { patientBookingNavItems } from "@/components/patient/patientNavigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import {
  useCreateAppointmentRequestMutation,
  useDoctorAvailableSlotsQuery,
  useDoctorBookingDetailQuery,
} from "@/hooks/usePatientBooking";
import { getDisplayName } from "@/lib/auth";
import { buildStableKey } from "@/lib/reactKeys";

const PatientDoctorDetailsPage = () => {
  const { doctorId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = getDisplayName(user ?? {});
  const doctorQuery = useDoctorBookingDetailQuery(doctorId);
  const slotRange = useMemo(() => {
    const today = new Date();
    return {
      startDate: format(today, "yyyy-MM-dd"),
      endDate: format(addDays(today, 14), "yyyy-MM-dd"),
    };
  }, []);
  const slotsQuery = useDoctorAvailableSlotsQuery(doctorId, doctorId ? slotRange : undefined);
  const createRequestMutation = useCreateAppointmentRequestMutation();

  const [selectedSlotStart, setSelectedSlotStart] = useState("");
  const [visitType, setVisitType] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const doctor = doctorQuery.data;
  const aiBookingState = (location.state as {
    source?: string;
    sourceTestRequestId?: string;
    resultId?: string;
  } | null) ?? null;
  const detailRows = useMemo(
    () =>
      [
        doctor?.clinicName ? { label: "Clinic", value: doctor.clinicName } : null,
        doctor?.location ? { label: "Location", value: doctor.location } : null,
        doctor?.experienceYears != null
          ? { label: "Experience", value: `${doctor.experienceYears} years` }
          : null,
        doctor?.consultationFee != null
          ? {
              label: "Consultation fee",
              value: `${doctor.consultationFee} ${doctor.currency || ""}`.trim(),
            }
          : null,
        doctor?.phone ? { label: "Phone", value: doctor.phone } : null,
        doctor?.email ? { label: "Email", value: doctor.email } : null,
      ].filter((item): item is { label: string; value: string } => Boolean(item)),
    [doctor],
  );
  const consultationTypes = useMemo(
    () => doctor?.servicesOffered.filter((item): item is string => Boolean(item?.trim())) ?? [],
    [doctor],
  );
  const normalizeVisitTypeLabel = (value: string) => {
    const key = value.trim().toLowerCase().replace(/\s+/g, "_");
    if (["in_person", "in-person", "in person", "clinic"].includes(key)) return "Clinic";
    if (["video", "video_call", "virtual", "online"].includes(key)) return "Video";
    if (["phone", "phone_call", "call"].includes(key)) return "Phone";
    if (["home_visit", "home-visit", "home visit"].includes(key)) return "Home Visit";
    return value;
  };
  const normalizeVisitTypeValue = (value: string) => {
    const key = value.trim().toLowerCase().replace(/\s+/g, "_");
    if (["in_person", "in-person", "in person", "clinic"].includes(key)) return "IN_PERSON";
    if (["video", "video_call", "virtual", "online"].includes(key)) return "VIDEO";
    if (["phone", "phone_call", "call"].includes(key)) return "PHONE";
    if (["home_visit", "home-visit", "home visit"].includes(key)) return "HOME_VISIT";
    return value;
  };
  const visitTypeOptions = useMemo(() => {
    const options = new Map<string, string>();
    consultationTypes.forEach((type) => {
      const value = normalizeVisitTypeValue(type);
      options.set(value, normalizeVisitTypeLabel(type));
    });
    if (visitType && !options.has(visitType)) {
      options.set(visitType, normalizeVisitTypeLabel(visitType));
    }
    return Array.from(options, ([value, label]) => ({ value, label }));
  }, [consultationTypes, visitType]);

  useEffect(() => {
    const optionValues = visitTypeOptions.map((option) => option.value);
    if (!visitType || !optionValues.includes(visitType)) {
      setVisitType(optionValues[0] ?? "");
    }
  }, [visitType, visitTypeOptions]);

  useEffect(() => {
    if (!selectedSlotStart) return;
    const slots = slotsQuery.data?.slots ?? [];
    const stillAvailable = slots.some((slot) => slot.startAt === selectedSlotStart);
    if (!stillAvailable) {
      setSelectedSlotStart("");
    }
  }, [selectedSlotStart, slotsQuery.data?.slots]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!doctor?.doctorId) {
      toast.error("Doctor request cannot be submitted because the doctor ID is missing.");
      return;
    }
    if (!selectedSlotStart) {
      toast.error("Select an available slot before submitting the request.");
      return;
    }

    const sourceTestRequestId = aiBookingState?.sourceTestRequestId ?? undefined;
    createRequestMutation.mutate(
      {
        doctorId: doctor.doctorId,
        slotStart: selectedSlotStart,
        visitType,
        reason,
        note: note || undefined,
        sourceTestRequestId,
      },
      {
        onSuccess: (request) => {
          toast.success("Appointment request submitted.");
          if (aiBookingState?.source === "ai_prediction" && aiBookingState.resultId) {
            navigate(`/patient/lab-results/${aiBookingState.resultId}`, {
              state: {
                source: "follow_up_booking",
                followUpRequestId: request.id,
                followUpCreatedAt: Date.now(),
              },
            });
            return;
          }

          navigate(`/patient/requests/doctor/${request.id}`);
        },
        onError: (error: Error) => toast.error(error.message),
      },
    );
  };

  return (
    <DashboardLayout userRole="patient" userName={userName} navItems={patientBookingNavItems} userIcon={User}>
      <div className="mb-6">
        <Button asChild variant="ghost" className="-ml-4 mb-3">
          <Link to="/patient/doctors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to doctors
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Doctor details</h1>
        <p className="mt-2 text-muted-foreground">
          Review the doctor profile and choose a time that works for you.
        </p>
      </div>

      {doctorQuery.isLoading ? (
        <LoadingCard lines={6} />
      ) : doctorQuery.isError ? (
        <ErrorCard title="Unable to load doctor profile" message={(doctorQuery.error as Error).message} />
      ) : doctor ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <SectionCard title={doctor.name} description={doctor.specialty || undefined}>
              <div className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  {doctor.bio || "No bio available yet."}
                </p>
                {detailRows.length ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {detailRows.map((item, index) => (
                      <div
                        key={buildStableKey([item.label, item.value, index], `doctor-detail-${index}`)}
                        className="rounded-lg border p-4"
                      >
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No clinic, fee, or contact details have been published yet.
                  </p>
                )}
                <div className="space-y-1 text-sm text-muted-foreground">
                  {doctor.consultationFee == null ? <p>Consultation fee not published yet.</p> : null}
                  {!doctor.clinicName ? <p>Clinic information not published yet.</p> : null}
                  {doctor.experienceYears == null ? <p>Experience not published yet.</p> : null}
                </div>
              </div>
            </SectionCard>

            {doctor.recentReviews?.length ? (
              <SectionCard title="Patient reviews" description="Recent feedback from completed visits.">
                <DoctorRecentReviewsSection reviews={doctor.recentReviews} />
              </SectionCard>
            ) : null}
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
                <Label htmlFor="visitType">Visit type</Label>
                <Select
                  value={visitType}
                  onValueChange={setVisitType}
                  disabled={!visitTypeOptions.length}
                >
                  <SelectTrigger id="visitType">
                    <SelectValue
                      placeholder={
                        visitTypeOptions.length ? "Choose a visit type" : "Visit types not available"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {visitTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for visit</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  rows={4}
                  required
                />
              </div>
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
                disabled={createRequestMutation.isPending || !doctor.doctorId || !selectedSlotStart}
              >
                {createRequestMutation.isPending ? "Submitting..." : "Request appointment"}
              </Button>
              {!doctor.doctorId ? (
                <p className="text-sm text-destructive">
                  This profile is missing the doctor ID required for request submission.
                </p>
              ) : null}
            </form>
          </SectionCard>
        </div>
      ) : (
        <EmptyCard title="Doctor not found" description="This provider profile is unavailable." />
      )}
    </DashboardLayout>
  );
};

export default PatientDoctorDetailsPage;
