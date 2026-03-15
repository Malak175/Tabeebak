import { useMemo, useState } from "react";
import { Building2, MapPin, Navigation, Search } from "lucide-react";
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
import { useLabDirectoryQuery, useNearbyLabDirectoryQuery } from "@/hooks/usePatientBooking";
import { getDisplayName } from "@/lib/auth";
import { DiscoveryLocationParams } from "@/types/patient-booking.types";

const PatientLabsBrowsePage = () => {
  const { user } = useAuth();
  const userName = getDisplayName(user ?? {});
  const [search, setSearch] = useState("");
  const [nearbyParams, setNearbyParams] = useState<DiscoveryLocationParams | null>(null);

  const labsQuery = useLabDirectoryQuery(search ? { search } : undefined);
  const nearQuery = useNearbyLabDirectoryQuery(nearbyParams);
  const activeQuery = nearbyParams ? nearQuery : labsQuery;
  const labs = useMemo(() => activeQuery.data ?? [], [activeQuery.data]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          labs
            .map((lab) => lab.accreditation)
            .filter((value): value is string => Boolean(value)),
        ),
      ),
    [labs],
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
        toast.success("Showing labs near your location.");
      },
      () => toast.error("We couldn't access your location."),
    );
  };

  return (
    <DashboardLayout userRole="patient" userName={userName} navItems={patientBookingNavItems} userIcon={Building2}>
      <section className="mb-6 rounded-3xl border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Lab Requests</p>
        <h1 className="mt-3 text-3xl font-bold">Browse labs and request a test</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Discovery, branches, and services all come from live backend endpoints. Open a lab to choose services and send a test request.
        </p>
        <div className="mt-6 flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              placeholder="Search labs"
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
        {categories.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category} variant="secondary">
                {category}
              </Badge>
            ))}
          </div>
        ) : null}
      </section>

      <SectionCard
        title={nearbyParams ? "Nearby labs" : "Lab directory"}
        description={`${labs.length} provider${labs.length === 1 ? "" : "s"} loaded`}
      >
        {activeQuery.isLoading ? (
          <div className="space-y-4">
            <LoadingCard />
            <LoadingCard />
          </div>
        ) : activeQuery.isError ? (
          <ErrorCard title="Unable to load labs" message={(activeQuery.error as Error).message} />
        ) : labs.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {labs.map((lab) => (
              <Card key={lab.id}>
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{lab.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {lab.description || "No description published yet."}
                      </p>
                    </div>
                    {lab.distanceKm ? (
                      <Badge variant="outline">{lab.distanceKm.toFixed(1)} km away</Badge>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{lab.rating ? `${lab.rating.toFixed(1)} rating` : "No rating yet"}</span>
                    <span>{lab.accreditation || "Accreditation pending"}</span>
                    <span>{lab.homeCollectionAvailable ? "Home collection supported" : "In-branch testing"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {lab.address || "Address pending"}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild>
                      <Link to={`/patient/labs/${lab.id}`}>Open details</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to={`/patient/labs/${lab.id}`}>Request lab test</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyCard
            title="No labs matched your search"
            description="Try a broader search term or switch off the nearby filter."
          />
        )}
      </SectionCard>
    </DashboardLayout>
  );
};

export default PatientLabsBrowsePage;
