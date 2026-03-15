import { FormEvent, useState } from "react";
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

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!doctorId) return;

    createRequestMutation.mutate(
      {
        doctorId,
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
      ) : doctorQuery.data ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <SectionCard title={doctorQuery.data.name} description={doctorQuery.data.specialty || undefined}>
              <div className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  {doctorQuery.data.bio || "This doctor has not added a bio yet."}
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Clinic</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {doctorQuery.data.clinicName || "Not available"}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Location</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {doctorQuery.data.location || "Not available"}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Experience</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {doctorQuery.data.experienceYears ? `${doctorQuery.data.experienceYears} years` : "Not available"}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium">Consultation fee</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {doctorQuery.data.consultationFee
                        ? `${doctorQuery.data.consultationFee} ${doctorQuery.data.currency || ""}`.trim()
                        : "Not available"}
                    </p>
                  </div>
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

            <SectionCard title="Profile extras" description="Optional data published by the provider">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">Languages</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {doctorQuery.data.languages.join(", ") || "Not available"}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">Services</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {doctorQuery.data.servicesOffered.join(", ") || "Not available"}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">Education</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {doctorQuery.data.education.join(", ") || "Not available"}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium">Certifications</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {doctorQuery.data.certifications.join(", ") || "Not available"}
                  </p>
                </div>
              </div>
            </SectionCard>
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
              <Button type="submit" className="w-full" disabled={createRequestMutation.isPending}>
                {createRequestMutation.isPending ? "Submitting..." : "Submit appointment request"}
              </Button>
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
