import { useMemo, useState } from "react";
import { MapPin, Navigation, Search, User } from "lucide-react";
import { Link } from "react-router-dom";
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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  useDoctorDirectoryQuery,
  useNearbyDoctorDirectoryQuery,
} from "@/hooks/usePatientBooking";
import { getDisplayName } from "@/lib/auth";
import { DiscoveryLocationParams } from "@/types/patient-booking.types";

const PatientDoctorsBrowsePage = () => {
  const { user } = useAuth();
  const userName = getDisplayName(user ?? {});
  const [search, setSearch] = useState("");
  const [nearbyParams, setNearbyParams] = useState<DiscoveryLocationParams | null>(null);

  const doctorsQuery = useDoctorDirectoryQuery(search ? { search } : undefined);
  const nearQuery = useNearbyDoctorDirectoryQuery(nearbyParams);
  const activeQuery = nearbyParams ? nearQuery : doctorsQuery;
  const doctors = useMemo(() => activeQuery.data ?? [], [activeQuery.data]);

  const specialties = useMemo(
    () => Array.from(new Set(doctors.map((doctor) => doctor.specialty).filter(Boolean))),
    [doctors],
  );

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not available in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNearbyParams({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        toast.success("Showing doctors near your location.");
      },
      () => toast.error("We couldn't access your location."),
    );
  };

  return (
    <DashboardLayout userRole="patient" userName={userName} navItems={patientBookingNavItems} userIcon={User}>
      <section className="mb-6 rounded-3xl border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Doctor Requests</p>
        <h1 className="mt-3 text-3xl font-bold">Browse doctors and send a request</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Provider discovery is backend-backed through the public doctor endpoints. Open a profile to review details, availability, and submit an appointment request.
        </p>
        <div className="mt-6 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              placeholder="Search by doctor name or specialty"
            />
          </div>
          <Button variant="outline" onClick={handleNearMe} className="gap-2">
            <Navigation className="h-4 w-4" />
            Near me
          </Button>
          {nearbyParams ? (
            <Button variant="ghost" onClick={() => setNearbyParams(null)}>
              Clear nearby
            </Button>
          ) : null}
        </div>
        {specialties.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {specialties.map((specialty) => (
              <Badge key={specialty} variant="secondary">
                {specialty}
              </Badge>
            ))}
          </div>
        ) : null}
      </section>

      <SectionCard
        title={nearbyParams ? "Nearby doctors" : "Doctor directory"}
        description={`${doctors.length} provider${doctors.length === 1 ? "" : "s"} loaded`}
      >
        {activeQuery.isLoading ? (
          <div className="space-y-4">
            <LoadingCard />
            <LoadingCard />
          </div>
        ) : activeQuery.isError ? (
          <ErrorCard title="Unable to load doctors" message={(activeQuery.error as Error).message} />
        ) : doctors.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {doctors.map((doctor) => (
              <Card key={doctor.id} className="border-border/70">
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{doctor.name}</h3>
                      <p className="text-sm text-primary">{doctor.specialty || "Specialty not listed"}</p>
                    </div>
                    {doctor.distanceKm ? (
                      <Badge variant="outline">{doctor.distanceKm.toFixed(1)} km away</Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{doctor.bio || "No bio provided yet."}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{doctor.experienceYears ? `${doctor.experienceYears} years experience` : "Experience pending"}</span>
                    <span>{doctor.consultationFee ? `${doctor.consultationFee} ${doctor.currency || ""}`.trim() : "Fee on profile"}</span>
                    <span>{doctor.rating ? `${doctor.rating.toFixed(1)} rating` : "No rating yet"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {doctor.location || doctor.clinicName || "Location pending"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild>
                      <Link to={`/patient/doctors/${doctor.id}`}>Open details</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to={`/patient/doctors/${doctor.id}`}>Request appointment</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyCard
            title="No doctors matched your search"
            description="Try a broader search term or switch off the nearby filter."
          />
        )}
      </SectionCard>
    </DashboardLayout>
  );
};

export default PatientDoctorsBrowsePage;
