import { useDeferredValue, useMemo, useState } from "react";
import { Building2, MapPin, Navigation, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
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
import { buildStableKey } from "@/lib/reactKeys";
import { DiscoveryLocationParams } from "@/types/patient-booking.types";

const PatientLabsBrowsePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = getDisplayName(user ?? {});
  const [search, setSearch] = useState("");
  const [nearbyParams, setNearbyParams] = useState<DiscoveryLocationParams | null>(null);
  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim();
  const discoveryParams = useMemo(
    () => ({
      search: normalizedSearch || undefined,
    }),
    [normalizedSearch],
  );

  const labsQuery = useLabDirectoryQuery(discoveryParams);
  const nearQuery = useNearbyLabDirectoryQuery(
    nearbyParams
      ? {
          ...nearbyParams,
          search: discoveryParams.search,
        }
      : null,
  );
  const activeQuery = nearbyParams ? nearQuery : labsQuery;
  const labs = useMemo(() => activeQuery.data ?? [], [activeQuery.data]);

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

  const handleLabNavigation = (routeId?: string | null, fallbackLabId?: string | null) => {
    const targetId = routeId || fallbackLabId;

    if (!targetId) {
      toast.error("Lab details are unavailable because the provider ID is missing.");
      return;
    }

    navigate(`/patient/labs/${targetId}`);
  };

  return (
    <DashboardLayout userRole="patient" userName={userName} navItems={patientBookingNavItems} userIcon={Building2}>
      <section className="mb-6 rounded-3xl border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Lab Requests</p>
        <h1 className="mt-3 text-3xl font-bold">Browse labs and request a test</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Discover labs, compare services, and send a test request.
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
          <Button
            variant="ghost"
            onClick={() => {
              setSearch("");
              setNearbyParams(null);
            }}
          >
            Clear filters
          </Button>
        </div>
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
            {labs.map((lab, index) => (
              <Card
                key={buildStableKey(
                  [lab.id, lab.labId, lab.name, lab.address, lab.phone, index],
                  `lab-${index}`,
                )}
              >
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{lab.name}</h3>
                      {lab.description ? (
                        <p className="text-sm text-muted-foreground">{lab.description}</p>
                      ) : null}
                    </div>
                    {lab.distanceKm ? (
                      <Badge variant="outline">{lab.distanceKm.toFixed(1)} km away</Badge>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {lab.rating != null ? <span>{lab.rating.toFixed(1)} rating</span> : null}
                    {lab.accreditation ? <span>{lab.accreditation}</span> : null}
                    {lab.homeCollectionAvailable === true ? <span>Home collection supported</span> : null}
                    {lab.homeCollectionAvailable === false ? <span>Home collection not supported</span> : null}
                  </div>
                  {lab.address ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {lab.address}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Address not published yet.</p>
                  )}
                  {!lab.description ? (
                    <p className="text-sm text-muted-foreground">No lab description available yet.</p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => handleLabNavigation(lab.id, lab.labId)}>
                      Open details
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleLabNavigation(lab.id, lab.labId)}
                    >
                      Request lab test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyCard
            title="No labs matched your search"
            description={
              nearbyParams
                ? "Try a broader search term, a different tag, or clear Near me."
                : "Try a broader search term or clear the active filter."
            }
          />
        )}
      </SectionCard>
    </DashboardLayout>
  );
};

export default PatientLabsBrowsePage;
