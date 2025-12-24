import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Heart, Users, Shield, Award, Target, Eye, Activity, AlertTriangle, Stethoscope } from "lucide-react";

const stats = [
  { value: "500+", label: "Expert Doctors" },
  { value: "50+", label: "Lab Partners" },
  { value: "10K+", label: "Happy Patients" },
  { value: "24/7", label: "Support" },
];

const values = [
  {
    icon: Heart,
    title: "Patient-Centric Care",
    description: "Your health and well-being are at the center of everything we do.",
  },
  {
    icon: Shield,
    title: "Trust & Security",
    description: "We protect your health data with the highest security standards.",
  },
  {
    icon: Award,
    title: "Quality Excellence",
    description: "We partner only with certified and experienced healthcare professionals.",
  },
  {
    icon: Users,
    title: "Accessibility",
    description: "Making quality healthcare accessible to everyone, everywhere.",
  },
];

const heartFacts = [
  {
    icon: Activity,
    title: "Leading Cause",
    description: "Heart disease remains one of the leading causes of death worldwide, but many cases are preventable.",
  },
  {
    icon: AlertTriangle,
    title: "Risk Factors",
    description: "High blood pressure, high cholesterol, smoking, obesity, and diabetes increase heart disease risk.",
  },
  {
    icon: Stethoscope,
    title: "Early Detection",
    description: "Regular health check-ups can detect heart problems early, improving treatment outcomes significantly.",
  },
];

const About = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-medical-light via-background to-teal-light">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">About Us</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6">
              Transforming Healthcare
              <span className="text-gradient block">One Connection at a Time</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              TABEEBAK is a comprehensive healthcare platform that bridges the gap between patients, 
              doctors, and laboratories. Our mission is to make quality healthcare accessible, 
              convenient, and transparent for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Heart Health Awareness Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Heart className="h-5 w-5" />
              <span className="font-semibold text-sm">Heart Health Awareness</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Heart Health <span className="text-primary">Matters</span>
            </h2>
            <p className="text-muted-foreground">
              At TABEEBAK, we're committed to raising awareness about heart disease and helping you take proactive steps toward a healthier heart.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {heartFacts.map((fact, index) => (
              <div 
                key={fact.title} 
                className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <fact.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{fact.title}</h3>
                <p className="text-muted-foreground text-sm">{fact.description}</p>
              </div>
            ))}
          </div>

          <div className="max-w-3xl mx-auto bg-card border border-primary/20 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-4 text-primary">Understanding Heart Disease</h3>
            <p className="text-muted-foreground mb-4">
              Heart disease refers to several types of conditions affecting the heart, including coronary artery disease, heart rhythm problems (arrhythmias), heart valve disease, and heart failure. It develops over time and can be influenced by lifestyle factors.
            </p>
            <p className="text-muted-foreground">
              The good news is that many forms of heart disease can be prevented or managed through healthy lifestyle choices like eating a balanced diet, exercising regularly, maintaining a healthy weight, not smoking, and managing stress. Regular check-ups with your doctor are essential for early detection and treatment.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-primary/5 rounded-3xl p-8 md:p-12 animate-fade-in hover:scale-[1.02] transition-transform duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="h-7 w-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To revolutionize healthcare delivery by creating a seamless digital platform 
                that connects patients with the best doctors and diagnostic services. We strive 
                to eliminate barriers to healthcare access and empower individuals to take 
                control of their health journey.
              </p>
            </div>
            <div className="bg-secondary/10 rounded-3xl p-8 md:p-12 animate-fade-in hover:scale-[1.02] transition-transform duration-300" style={{ animationDelay: '150ms' }}>
              <div className="w-14 h-14 bg-secondary/20 rounded-xl flex items-center justify-center mb-6">
                <Eye className="h-7 w-7 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become the most trusted healthcare platform in the region, where every 
                individual has access to quality medical care at their fingertips. We envision 
                a future where technology and compassion come together to create better 
                health outcomes for all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Values</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4">What Drives Us</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div 
                key={value.title} 
                className="bg-card p-8 rounded-2xl text-center hover:shadow-lg hover:-translate-y-2 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-4">How It All Started</h2>
            </div>
            <div className="prose prose-lg mx-auto text-muted-foreground">
              <p className="leading-relaxed mb-6">
                TABEEBAK was born from a simple yet powerful idea: healthcare should be accessible 
                to everyone, regardless of their location or circumstances. Our founders, having 
                experienced the challenges of navigating the healthcare system firsthand, set out 
                to create a solution.
              </p>
              <p className="leading-relaxed mb-6">
                What started as a small initiative to connect patients with local doctors has 
                grown into a comprehensive healthcare ecosystem. Today, we serve thousands of 
                patients, partner with hundreds of healthcare providers, and continue to innovate 
                in our pursuit of better health outcomes.
              </p>
              <p className="leading-relaxed">
                Our name, TABEEBAK, meaning "Your Doctor" in Arabic, reflects our core belief 
                that personalized, caring healthcare should be a right, not a privilege. Every 
                feature we build, every partnership we forge, is guided by this principle.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default About;
