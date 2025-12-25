import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Heart } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] flex items-center pt-20 overflow-hidden">
      {/* Diagonal Red Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-primary clip-diagonal" />
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-background/5 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-primary-foreground">
              Your Health,
              <span className="block">Our Priority</span>
            </h1>
            
            <p className="text-lg text-primary-foreground/90 max-w-md leading-relaxed">
              Connect with expert doctors, book appointments instantly, and access quality healthcare services all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/doctors">
                <Button variant="white" size="lg" className="w-full sm:w-auto gap-2">
                  <Search className="h-4 w-4" />
                  Find a Doctor
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Calendar className="h-4 w-4" />
                  Book Appointment
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Card - Simple and Clean */}
          <div className="hidden lg:block animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md ml-auto hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-primary animate-pulse" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">TABEEBAK</h3>
                  <p className="text-sm text-muted-foreground">Healthcare Platform</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { value: "500+", label: "Expert Doctors" },
                  { value: "50+", label: "Lab Partners" },
                  { value: "10K+", label: "Happy Patients" },
                ].map((stat, index) => (
                  <div 
                    key={stat.label} 
                    className="flex items-center justify-between py-3 border-b border-border last:border-0 animate-fade-in"
                    style={{ animationDelay: `${300 + index * 100}ms` }}
                  >
                    <span className="text-muted-foreground">{stat.label}</span>
                    <span className="text-xl font-bold text-primary">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="grid grid-cols-3 gap-4 mt-12 lg:hidden">
          {[
            { value: "500+", label: "Doctors" },
            { value: "50+", label: "Labs" },
            { value: "10K+", label: "Patients" },
          ].map((stat, index) => (
            <div 
              key={stat.label} 
              className="text-center bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-2xl font-bold text-primary-foreground">{stat.value}</div>
              <div className="text-sm text-primary-foreground/80">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
