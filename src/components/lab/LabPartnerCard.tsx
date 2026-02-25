import { FlaskConical, CheckCircle, Star, MapPin } from "lucide-react";

interface LabPartnerCardProps {
  name: string;
  tests: number;
  rating: number;
}

const LabPartnerCard = ({ name, tests, rating }: LabPartnerCardProps) => {
  return (
    <div className="group relative bg-card rounded-2xl border border-border/50 p-8 hover:shadow-xl hover:border-primary/30 transition-all duration-300 text-center overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative">
        {/* Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-105 transition-transform">
          <FlaskConical className="h-10 w-10 text-primary-foreground" />
        </div>
        
        {/* Name */}
        <h3 className="font-bold text-xl mb-3 text-foreground">{name}</h3>
        
        {/* Stats */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <FlaskConical className="h-4 w-4 text-primary" />
            <span>{tests}+ tests</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-accent fill-accent" />
            <span>{rating}</span>
          </div>
        </div>
        
        {/* Certifications */}
        <div className="flex flex-wrap justify-center gap-2">
          <div className="inline-flex items-center gap-1.5 bg-secondary/10 text-secondary px-3 py-1.5 rounded-full text-xs font-medium">
            <CheckCircle className="h-3.5 w-3.5" />
            NABL Certified
          </div>
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium">
            <MapPin className="h-3.5 w-3.5" />
            Home Collection
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabPartnerCard;
