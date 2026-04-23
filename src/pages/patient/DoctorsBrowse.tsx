import { useDeferredValue, useMemo, useState } from "react";
import { MapPin, Navigation, Search, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import {
  useDoctorDirectoryQuery,
  useNearbyDoctorDirectoryQuery,
} from "@/hooks/usePatientBooking";
import { getDisplayName } from "@/lib/auth";
import { buildStableKey } from "@/lib/reactKeys";
import { DiscoveryLocationParams } from "@/types/patient-booking.types";

const PatientDoctorsBrowsePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const userName = getDisplayName(user ?? {});
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("all");
  const [nearbyParams, setNearbyParams] = useState<DiscoveryLocationParams | null>(null);
  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim();
  const selectedSpecialty = specialty === "all" ? undefined : specialty;
  const discoveryParams = useMemo(
    () => ({
      search: normalizedSearch || undefined,
      specialty: selectedSpecialty,
    }),
    [normalizedSearch, selectedSpecialty],
  );

  const doctorsQuery = useDoctorDirectoryQuery(discoveryParams);
  const nearQuery = useNearbyDoctorDirectoryQuery(
    nearbyParams
      ? {
          ...nearbyParams,
          search: discoveryParams.search,
          specialty: discoveryParams.specialty,
        }
      : null,
  );
  const activeQuery = nearbyParams ? nearQuery : doctorsQuery;
  const doctors = useMemo(() => activeQuery.data ?? [], [activeQuery.data]);
  const directoryDoctors = useMemo(() => doctorsQuery.data ?? [], [doctorsQuery.data]);
  const aiState = location.state as {
    source?: string;
    sourceTestRequestId?: string;
    resultId?: string;
    requestId?: string;
    riskLevel?: string;
  } | null;
  const aiRedirected = aiState?.source === "ai_prediction";

  const specialties = useMemo(
    () =>
      Array.from(
        new Set(
          directoryDoctors
            .map((doctor) => doctor.specialty)
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    [directoryDoctors],
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

  const handleDoctorNavigation = (routeId?: string | null, fallbackDoctorId?: string | null) => {
    const targetId = routeId || fallbackDoctorId;

    if (!targetId) {
      toast.error("Doctor details are unavailable because the provider ID is missing.");
      return;
    }

    navigate(`/patient/doctors/${targetId}`, {
      state: aiState?.source === "ai_prediction" ? aiState : null,
    });
  };

  return (
    <DashboardLayout userRole="patient" userName={userName} navItems={patientBookingNavItems} userIcon={User}>
      {aiRedirected ? (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You were redirected here after a high-risk AI analysis. Please consider booking a doctor consultation.
        </div>
      ) : null}
      <section className="mb-6 rounded-3xl border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Find a doctor</p>
        <h1 className="mt-3 text-3xl font-bold">Browse doctors and request an appointment</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Review profiles, availability, and request an appointment with the right provider.
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
          <Select value={specialty} onValueChange={setSpecialty}>
            <SelectTrigger className="w-full lg:w-56">
              <SelectValue placeholder="All specialties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All specialties</SelectItem>
              {specialties.map((specialtyOption) => (
                <SelectItem key={specialtyOption} value={specialtyOption}>
                  {specialtyOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleNearMe} className="gap-2">
            <Navigation className="h-4 w-4" />
            Near me
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("");
              setSpecialty("all");
              setNearbyParams(null);
            }}
          >
            Clear filters
          </Button>
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
            {doctors.map((doctor, index) => (
              <Card
                key={buildStableKey(
                  [doctor.id, doctor.doctorId, doctor.name, doctor.specialty, doctor.location, index],
                  `doctor-${index}`,
                )}
                className="border-border/70"
              >
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{doctor.name}</h3>
                      {doctor.specialty ? <p className="text-sm text-primary">{doctor.specialty}</p> : null}
                    </div>
                    {doctor.distanceKm ? (
                      <Badge variant="outline">{doctor.distanceKm.toFixed(1)} km away</Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{doctor.bio || "No bio available yet."}</p>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {doctor.experienceYears != null ? <span>{doctor.experienceYears} years experience</span> : null}
                    {doctor.consultationFee != null ? (
                      <span>{`${doctor.consultationFee} ${doctor.currency || ""}`.trim()}</span>
                    ) : null}
                    {doctor.rating != null ? <span>{doctor.rating.toFixed(1)} rating</span> : null}
                    {doctor.reviewCount != null ? <span>{doctor.reviewCount} reviews</span> : null}
                  </div>
                  {doctor.location || doctor.clinicName ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {doctor.location || doctor.clinicName}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Location not published yet.</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => handleDoctorNavigation(doctor.id, doctor.doctorId)}>
                      View details
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDoctorNavigation(doctor.id, doctor.doctorId)}
                    >
                      Request appointment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyCard
            title="No doctors matched your search"
            description={
              nearbyParams
                ? "Try a broader search term, a different specialty, or clear Near me."
                : "Try a broader search term or clear the specialty filter."
            }
          />
        )}
      </SectionCard>
    </DashboardLayout>
  );
};

export default PatientDoctorsBrowsePage;
