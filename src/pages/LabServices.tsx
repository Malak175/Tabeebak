import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  FlaskConical, 
  ArrowRight, 
  Droplet, 
  Heart, 
  Activity, 
  Pill, 
  Shield,
  Truck,
  Clock,
  Award
} from "lucide-react";
import TestCategoryCard from "@/components/lab/TestCategoryCard";
import TestCard from "@/components/lab/TestCard";
import LabPartnerCard from "@/components/lab/LabPartnerCard";

const testCategories = [
  { name: "Blood Tests", count: 45, icon: Droplet },
  { name: "Urine Tests", count: 12, icon: FlaskConical },
  { name: "Heart Tests", count: 15, icon: Heart },
  { name: "Diabetes", count: 10, icon: Activity },
  { name: "Thyroid", count: 6, icon: Pill },
];

const popularTests = [
  {
    id: 1,
    name: "Complete Blood Count (CBC)",
    description: "Comprehensive blood analysis measuring red cells, white cells, and platelets for overall health assessment",
    price: "$35",
    duration: "4-6 hours",
    category: "Blood Tests",
  },
  {
    id: 2,
    name: "Lipid Profile",
    description: "Measures cholesterol levels including HDL, LDL, and triglycerides for cardiovascular risk assessment",
    price: "$45",
    duration: "12 hours (fasting)",
    category: "Heart Tests",
  },
  {
    id: 3,
    name: "Thyroid Function Test",
    description: "Comprehensive TSH, T3, T4 levels to assess thyroid health and metabolic function",
    price: "$55",
    duration: "24 hours",
    category: "Thyroid",
  },
  {
    id: 4,
    name: "HbA1c Test",
    description: "Average blood sugar levels over past 2-3 months for diabetes monitoring and diagnosis",
    price: "$40",
    duration: "4-6 hours",
    category: "Diabetes",
  },
  {
    id: 5,
    name: "Liver Function Test",
    description: "Comprehensive liver health assessment including enzymes and bilirubin levels",
    price: "$50",
    duration: "24 hours",
    category: "Blood Tests",
  },
  {
    id: 6,
    name: "Kidney Function Test",
    description: "Creatinine, BUN, and electrolyte levels to evaluate kidney health and function",
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

const features = [
  { icon: Shield, title: "100% Accurate", description: "NABL certified labs" },
  { icon: Truck, title: "Home Collection", description: "Free sample pickup" },
  { icon: Clock, title: "Fast Results", description: "Reports in 24 hours" },
  { icon: Award, title: "Best Prices", description: "Up to 50% off" },
];

const LabServices = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredTests = popularTests.filter((test) => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !activeCategory || test.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <FlaskConical className="h-4 w-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">Trusted by 50,000+ Patients</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary-foreground leading-tight">
              Book Lab Tests with
              <span className="block text-white/90">Certified Partners</span>
            </h1>
            
            <p className="text-primary-foreground/80 mb-10 text-lg max-w-2xl mx-auto">
              Get accurate diagnostic tests from NABL certified labs with free home sample collection and fast digital reports
            </p>
            
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 bg-card p-3 rounded-2xl shadow-2xl max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for tests, packages..."
                  className="pl-12 h-12 border-0 bg-muted/50 text-foreground rounded-xl text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="py-8 bg-card border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{feature.title}</div>
                  <div className="text-sm text-muted-foreground">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3 text-foreground">Browse by Category</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Choose from a wide range of diagnostic tests and health packages
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {testCategories.map((category) => (
              <TestCategoryCard
                key={category.name}
                name={category.name}
                count={category.count}
                icon={category.icon}
                isActive={activeCategory === category.name}
                onClick={() => setActiveCategory(
                  activeCategory === category.name ? null : category.name
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tests */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2 text-foreground">Popular Tests</h2>
              <p className="text-muted-foreground">Most booked diagnostic tests by our patients</p>
            </div>
            <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              View All Tests <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <TestCard
                key={test.id}
                name={test.name}
                description={test.description}
                price={test.price}
                duration={test.duration}
                category={test.category}
              />
            ))}
          </div>

          {filteredTests.length === 0 && (
            <div className="text-center py-12">
              <FlaskConical className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No tests found matching your search</p>
              <Button 
                variant="link" 
                className="text-primary mt-2"
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory(null);
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Lab Partners */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3 text-foreground">Our Lab Partners</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We partner with NABL certified labs to ensure accurate and reliable test results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {labPartners.map((lab) => (
              <LabPartnerCard
                key={lab.name}
                name={lab.name}
                tests={lab.tests}
                rating={lab.rating}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl gradient-hero p-10 md:p-16 text-center">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Need Help Choosing the Right Test?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto text-lg">
                Our health experts are available 24/7 to guide you through the right diagnostic tests for your needs
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold shadow-lg">
                  Talk to Expert
                </Button>
                <Button size="lg" variant="outline" className="border-white/30 text-primary-foreground hover:bg-white/10">
                  View Health Packages
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default LabServices;
