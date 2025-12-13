import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, FlaskConical, Clock, CheckCircle, ArrowRight } from "lucide-react";

const testCategories = [
  { name: "Blood Tests", count: 45 },
  { name: "Urine Tests", count: 12 },
  { name: "Imaging", count: 8 },
  { name: "Heart Tests", count: 15 },
  { name: "Diabetes", count: 10 },
  { name: "Thyroid", count: 6 },
];

const popularTests = [
  {
    id: 1,
    name: "Complete Blood Count (CBC)",
    description: "Comprehensive blood analysis measuring red cells, white cells, and platelets",
    price: "$35",
    duration: "4-6 hours",
    category: "Blood Tests",
  },
  {
    id: 2,
    name: "Lipid Profile",
    description: "Measures cholesterol levels and cardiovascular risk factors",
    price: "$45",
    duration: "12 hours (fasting)",
    category: "Heart Tests",
  },
  {
    id: 3,
    name: "Thyroid Function Test",
    description: "TSH, T3, T4 levels to assess thyroid health",
    price: "$55",
    duration: "24 hours",
    category: "Thyroid",
  },
  {
    id: 4,
    name: "HbA1c Test",
    description: "Average blood sugar levels over past 2-3 months",
    price: "$40",
    duration: "4-6 hours",
    category: "Diabetes",
  },
  {
    id: 5,
    name: "Liver Function Test",
    description: "Comprehensive liver health assessment",
    price: "$50",
    duration: "24 hours",
    category: "Blood Tests",
  },
  {
    id: 6,
    name: "Kidney Function Test",
    description: "Creatinine, BUN, and electrolyte levels",
    price: "$48",
    duration: "24 hours",
    category: "Blood Tests",
  },
];

const labPartners = [
  { name: "MedLab Diagnostics", tests: 150, rating: 4.9 },
  { name: "HealthFirst Labs", tests: 120, rating: 4.8 },
  { name: "Precision Pathology", tests: 200, rating: 4.7 },
];

const LabServices = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTests = popularTests.filter((test) =>
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-muted/30">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 gradient-teal text-secondary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-secondary-foreground/20 px-4 py-2 rounded-full mb-6">
              <FlaskConical className="h-4 w-4" />
              <span className="text-sm font-medium">Trusted Lab Partners</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Laboratory Services</h1>
            <p className="text-secondary-foreground/80 mb-8 text-lg">
              Book diagnostic tests from certified labs with accurate results and home sample collection
            </p>
            
            {/* Search Bar */}
            <div className="flex gap-4 bg-card p-2 rounded-xl shadow-lg max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for tests..."
                  className="pl-10 border-0 bg-transparent text-foreground"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="hero">Search</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8 text-center">Test Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {testCategories.map((category) => (
              <button
                key={category.name}
                className="p-4 bg-muted/50 rounded-xl hover:bg-primary/10 hover:border-primary border-2 border-transparent transition-all text-center group"
              >
                <div className="text-lg font-semibold group-hover:text-primary">{category.name}</div>
                <div className="text-sm text-muted-foreground">{category.count} tests</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tests */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Popular Tests</h2>
            <Button variant="ghost" className="text-primary">
              View All <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <Card key={test.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                        {test.category}
                      </span>
                      <CardTitle className="text-lg mt-2">{test.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">{test.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm mb-4">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Results in {test.duration}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-secondary">{test.price}</span>
                    </div>
                    <Button variant="teal" size="sm">
                      Book Test
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Lab Partners */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">Our Lab Partners</h2>
            <p className="text-muted-foreground">Certified and accredited diagnostic centers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {labPartners.map((lab) => (
              <Card key={lab.name} className="text-center">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FlaskConical className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{lab.name}</h3>
                  <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                    <span>{lab.tests}+ tests</span>
                    <span>⭐ {lab.rating}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    NABL Certified
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

export default LabServices;
