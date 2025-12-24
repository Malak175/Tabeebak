import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="bg-primary rounded-2xl p-8 md:p-12 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="w-14 h-14 bg-primary-foreground/20 rounded-full flex items-center justify-center mx-auto">
              <Heart className="h-7 w-7 text-primary-foreground" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground">
              Ready to Take Control of Your Health?
            </h2>
            
            <p className="text-primary-foreground/80">
              Join thousands of patients who trust TABEEBAK for their healthcare needs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/register">
                <Button variant="white" size="lg" className="w-full sm:w-auto gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/doctors">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Browse Doctors
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
