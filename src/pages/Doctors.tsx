import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DoctorsDirectory from "@/components/doctors/DoctorsDirectory";

const Doctors = () => {
  return (
    <main className="min-h-screen bg-muted/30">
      <Navbar />
      <DoctorsDirectory />
      <Footer />
    </main>
  );
};

export default Doctors;
