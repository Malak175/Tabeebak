import { UserRound, FlaskConical, CalendarCheck, FileText, Shield, Clock } from "lucide-react";

const services = [
  {
    icon: UserRound,
    title: "Expert Doctors",
    description: "Connect with certified specialists across all medical fields.",
  },
  {
    icon: FlaskConical,
    title: "Lab Services",
    description: "Access comprehensive diagnostic tests with accurate results.",
  },
  {
    icon: CalendarCheck,
    title: "Easy Booking",
    description: "Schedule appointments instantly at your convenience.",
  },
  {
    icon: FileText,
    title: "Digital Records",
    description: "Access your medical history and results anytime.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your health data is protected with industry-leading security.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description: "Round-the-clock assistance for all your healthcare needs.",
  },
];

const ServicesSection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Services</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4 text-foreground">
            Comprehensive Healthcare
          </h2>
          <p className="text-muted-foreground">
            Everything you need for your health journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group bg-card border border-border p-6 rounded-xl hover:border-primary/30 hover:shadow-md transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <service.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{service.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
