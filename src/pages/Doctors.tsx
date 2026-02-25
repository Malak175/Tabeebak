import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Star, Calendar, Clock } from "lucide-react";

const specialties = [
  "All Specialties",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Orthopedic",
  "Pediatrician",
  "Psychiatrist",
  "General Physician",
];

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    experience: "15 years",
    rating: 4.9,
    reviews: 124,
    location: "Medical Center, Downtown",
    available: true,
    price: "$150",
    image: "SJ",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Neurologist",
    experience: "12 years",
    rating: 4.8,
    reviews: 98,
    location: "Health Hub, Westside",
    available: true,
    price: "$180",
    image: "MC",
  },
  {
    id: 3,
    name: "Dr. Emily Williams",
    specialty: "Dermatologist",
    experience: "10 years",
    rating: 4.7,
    reviews: 156,
    location: "Skin Care Clinic, Midtown",
    available: false,
    price: "$120",
    image: "EW",
  },
  {
    id: 4,
    name: "Dr. Ahmed Hassan",
    specialty: "Orthopedic",
    experience: "18 years",
    rating: 4.9,
    reviews: 203,
    location: "Bone & Joint Center",
    available: true,
    price: "$200",
    image: "AH",
  },
  {
    id: 5,
    name: "Dr. Lisa Park",
    specialty: "Pediatrician",
    experience: "8 years",
    rating: 4.8,
    reviews: 87,
    location: "Children's Health Center",
    available: true,
    price: "$100",
    image: "LP",
  },
  {
    id: 6,
    name: "Dr. James Wilson",
    specialty: "General Physician",
    experience: "20 years",
    rating: 4.6,
    reviews: 312,
    location: "Community Health Clinic",
    available: true,
    price: "$80",
    image: "JW",
  },
];

const Doctors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties");

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "All Specialties" || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

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
              <Button variant="hero" size="lg">
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredDoctors.length}</span> doctors
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {doctor.image}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{doctor.name}</h3>
                      <p className="text-primary text-sm font-medium">{doctor.specialty}</p>
                      <p className="text-muted-foreground text-sm">{doctor.experience} experience</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{doctor.rating}</span>
                      <span className="text-muted-foreground">({doctor.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {doctor.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className={doctor.available ? "text-green-600" : "text-red-500"}>
                        {doctor.available ? "Available Today" : "Next Available: Tomorrow"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary">{doctor.price}</span>
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
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Doctors;
