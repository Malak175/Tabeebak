import { Clock, Beaker } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TestCardProps {
  name: string;
  description: string;
  price: string;
  duration: string;
  category: string;
}

const TestCard = ({ name, description, price, duration, category }: TestCardProps) => {
  return (
    <div className="group relative bg-card rounded-2xl border border-border/50 p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative">
        {/* Category badge */}
        <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium mb-4">
          <Beaker className="h-3 w-3" />
          {category}
        </div>
        
        {/* Test name */}
        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        
        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {description}
        </p>
        
        {/* Duration */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Clock className="h-4 w-4 text-primary" />
          <span>Results in {duration}</span>
        </div>

        {/* Price and action */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div>
            <span className="text-xs text-muted-foreground">Starting from</span>
            <div className="text-2xl font-bold text-primary">{price}</div>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all">
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestCard;
