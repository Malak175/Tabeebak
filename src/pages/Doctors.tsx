import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, Calendar, Clock, Navigation } from "lucide-react";
import { useDoctorsQuery, useNearbyDoctorsQuery } from "@/hooks/useDoctors";
import { toast } from "sonner";
import { DoctorsNearParams } from "@/types/doctor.types";

const Doctors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");
  const [nearbyParams, setNearbyParams] = useState<DoctorsNearParams | null>(null);

  const doctorsQuery = useDoctorsQuery();
  const nearbyQuery = useNearbyDoctorsQuery(nearbyParams);

  const sourceDoctors = nearbyParams ? nearbyQuery.data ?? [] : doctorsQuery.data ?? [];

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
    <main className="min-h-screen bg-muted/30">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Your Doctor</h1>
            <p className="text-muted-foreground mb-8">
              Search from our network of qualified healthcare professionals
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-4 bg-background p-4 rounded-2xl shadow-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search doctors or specialties..."
                  className="pl-10 border-0 bg-muted/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-full sm:w-48 border-0 bg-muted/50">
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
              {nearbyParams && (
                <Button variant="ghost" size="lg" onClick={() => setNearbyParams(null)}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {error && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error.message}
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredDoctors.length}</span> doctors
            </p>
          </div>

          {loading ? (
            <div className="text-center py-14 text-muted-foreground">Loading doctors...</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {doctor.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{doctor.name}</h3>
                        <p className="text-primary text-sm font-medium">{doctor.specialty}</p>
                        <p className="text-muted-foreground text-sm">{doctor.experience ?? "N/A"} experience</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
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
                        <span className="text-muted-foreground text-sm"> / visit</span>
                      </div>
                      <Link to={`/doctors/${doctor.id}`}>
                        <Button variant="hero" size="sm">
                          <Calendar className="h-4 w-4" />
                          Book Now
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

      <Footer />
    </main>
  );
};

export default Doctors;
