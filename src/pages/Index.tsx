import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import ServicesSection from "@/components/home/ServicesSection";
import HeartDiseaseSection from "@/components/home/HeartDiseaseSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <HeartDiseaseSection />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;
