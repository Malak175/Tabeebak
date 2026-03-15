import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, User } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  AvailabilityPanel,
  EmptyCard,
  ErrorCard,
  LoadingCard,
  SectionCard,
} from "@/components/patient/BookingFlowSection";
import { patientBookingNavItems } from "@/components/patient/patientNavigation";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import {
  useCreateAppointmentRequestMutation,
  useDoctorBookingAvailabilityQuery,
  useDoctorBookingDetailQuery,
} from "@/hooks/usePatientBooking";
import { getDisplayName } from "@/lib/auth";

const PatientDoctorDetailsPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = getDisplayName(user ?? {});
  const doctorQuery = useDoctorBookingDetailQuery(doctorId);
  const availabilityQuery = useDoctorBookingAvailabilityQuery(doctorId);
  const createRequestMutation = useCreateAppointmentRequestMutation();

  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [visitType, setVisitType] = useState("in-person");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const doctor = doctorQuery.data;
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
  const extras = useMemo(
    () =>
      [
        doctor?.languages.length ? { label: "Languages", value: doctor.languages.join(", ") } : null,
        doctor?.servicesOffered.length
          ? { label: "Services", value: doctor.servicesOffered.join(", ") }
          : null,
        doctor?.education.length ? { label: "Education", value: doctor.education.join(", ") } : null,
        doctor?.certifications.length
          ? { label: "Certifications", value: doctor.certifications.join(", ") }
          : null,
      ].filter((item): item is { label: string; value: string } => Boolean(item)),
    [doctor],
  );

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!doctor?.doctorId) {
      toast.error("Doctor request cannot be submitted because the backend doctor_id is missing.");
      return;
    }

    createRequestMutation.mutate(
      {
        doctorId: doctor.doctorId,
        preferredDate,
        preferredTime,
        visitType,
        reason,
        note: note || undefined,
      },
      {
        onSuccess: (request) => {
          toast.success("Appointment request submitted.");
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
          Review profile and availability, then send a request that the doctor can approve or reject.
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
                    {detailRows.map((item) => (
                      <div key={item.label} className="rounded-lg border p-4">
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

            <SectionCard
              title="Availability"
              description="Rendered from the doctor availability endpoint"
              actions={<CalendarDays className="h-5 w-5 text-primary" />}
            >
              {availabilityQuery.isLoading ? (
                <LoadingCard lines={4} />
              ) : availabilityQuery.isError ? (
                <ErrorCard
                  title="Unable to load availability"
                  message={(availabilityQuery.error as Error).message}
                />
              ) : (
                <AvailabilityPanel availability={availabilityQuery.data} />
              )}
            </SectionCard>

            {extras.length ? (
              <SectionCard title="Profile extras" description="Optional data published by the provider">
                <div className="grid gap-4 md:grid-cols-2">
                  {extras.map((item) => (
                    <div key={item.label} className="rounded-lg border p-4">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>
            ) : (
              <SectionCard title="Profile extras" description="Optional data published by the provider">
                <p className="text-sm text-muted-foreground">
                  No additional profile details have been published yet.
                </p>
              </SectionCard>
            )}
          </div>

          <SectionCard title="Send appointment request" description="Patient-only mutation against /api/v1/appointment-requests">
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
                <Label htmlFor="visitType">Visit type</Label>
                <Input
                  id="visitType"
                  value={visitType}
                  onChange={(event) => setVisitType(event.target.value)}
                  placeholder="in-person or video"
                />
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
                disabled={createRequestMutation.isPending || !doctor.doctorId}
              >
                {createRequestMutation.isPending ? "Submitting..." : "Submit appointment request"}
              </Button>
              {!doctor.doctorId ? (
                <p className="text-sm text-destructive">
                  This profile is missing the backend doctor ID required for request submission.
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
