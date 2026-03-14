import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Star, Calendar, Clock, Navigation } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDoctorsQuery, useNearbyDoctorsQuery } from "@/hooks/useDoctors";
import { useAuth } from "@/hooks/useAuth";
import { DoctorsNearParams } from "@/types/doctor.types";

interface DoctorsDirectoryProps {
  mode?: "public" | "patient";
}

const DoctorsDirectory = ({ mode = "public" }: DoctorsDirectoryProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [nearbyParams, setNearbyParams] = useState<DoctorsNearParams | null>(null);

  const doctorsQuery = useDoctorsQuery();
  const nearbyQuery = useNearbyDoctorsQuery(nearbyParams);
  const sourceDoctors = nearbyParams ? nearbyQuery.data ?? [] : doctorsQuery.data ?? [];
  const bookingHref = user?.role === "Patient" || mode === "patient" ? "/patient/help" : "/register";
  const bookingLabel = user?.role === "Patient" || mode === "patient" ? "Booking Help" : "Book Now";

  const specialties = useMemo(() => {
    const unique = Array.from(new Set(sourceDoctors.map((doctor) => doctor.specialty).filter(Boolean)));
    return ["All Specialties", ...unique];
  }, [sourceDoctors]);

  const filteredDoctors = useMemo(() => {
    return sourceDoctors.filter((doctor) => {
      const matchesSearch =
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialty = selectedSpecialty === "All Specialties" || doctor.specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [sourceDoctors, searchQuery, selectedSpecialty]);

  const loading = doctorsQuery.isLoading || nearbyQuery.isLoading;
  const error = (nearbyParams ? nearbyQuery.error : doctorsQuery.error) as Error | null;

  const handleUseNearby = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setNearbyParams({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        toast.success("Showing doctors near your location");
      },
      () => {
        toast.error("Unable to access your location.");
      },
    );
  };

  return (
    <>
      <section className="bg-card pb-12 pt-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">Find Your Doctor</h1>
            <p className="mb-8 text-muted-foreground">
              Search from our network of qualified healthcare professionals
            </p>

            <div className="flex flex-col gap-4 rounded-2xl bg-background p-4 shadow-lg sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search doctors or specialties..."
                  className="border-0 bg-muted/50 pl-10"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-full border-0 bg-muted/50 sm:w-48">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="lg" onClick={handleUseNearby} className="gap-2">
                <Navigation className="h-4 w-4" />
                Near Me
              </Button>
              {nearbyParams ? (
                <Button variant="ghost" size="lg" onClick={() => setNearbyParams(null)}>
                  Clear
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {error ? (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error.message}
            </div>
          ) : null}

          <div className="mb-8 flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredDoctors.length}</span> doctors
            </p>
          </div>

          {loading ? (
            <div className="py-14 text-center text-muted-foreground">Loading doctors...</div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                        {doctor.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{doctor.name}</h3>
                        <p className="text-sm font-medium text-primary">{doctor.specialty}</p>
                        <p className="text-sm text-muted-foreground">{doctor.experience ?? "N/A"} experience</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                        <span className="font-medium">{doctor.rating ?? 0}</span>
                        <span className="text-muted-foreground">({doctor.reviews ?? 0} reviews)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {doctor.location ?? "Location unavailable"}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className={doctor.available ? "text-green-600" : "text-red-500"}>
                          {doctor.available ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-primary">{doctor.price ?? "-"}</span>
                        <span className="text-sm text-muted-foreground"> / visit</span>
                      </div>
                      <Link to={bookingHref}>
                        <Button variant="hero" size="sm">
                          <Calendar className="h-4 w-4" />
                          {bookingLabel}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default DoctorsDirectory;
