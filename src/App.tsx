import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Register from "./pages/Register";
import Doctors from "./pages/Doctors";
import LabServices from "./pages/LabServices";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PatientDashboard from "./pages/patient/Dashboard";
import PatientAppointments from "./pages/patient/Appointments";
import PatientLabResults from "./pages/patient/LabResults";
import PatientHealthTips from "./pages/patient/HealthTips";
import PatientSettings from "./pages/patient/PatientSettings";
import PatientHelp from "./pages/patient/Help";
import DoctorDashboard from "./pages/doctor/Dashboard";
import DoctorAppointments from "./pages/doctor/Appointments";
import DoctorPatients from "./pages/doctor/Patients";
import DoctorSchedule from "./pages/doctor/Schedule";
import DoctorSettings from "./pages/doctor/DoctorSettings";
import DoctorHelp from "./pages/doctor/Help";
import LabDashboard from "./pages/lab/Dashboard";
import LabPending from "./pages/lab/Pending";
import LabCompleted from "./pages/lab/Completed";
import LabSettings from "./pages/lab/LabSettings";
import LabHelp from "./pages/lab/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/lab-services" element={<LabServices />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Patient Routes */}
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/appointments" element={<PatientAppointments />} />
            <Route path="/patient/lab-results" element={<PatientLabResults />} />
            <Route path="/patient/tips" element={<PatientHealthTips />} />
            <Route path="/patient/settings" element={<PatientSettings />} />
            <Route path="/patient/help" element={<PatientHelp />} />
            
            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route path="/doctor/schedule" element={<DoctorSchedule />} />
            <Route path="/doctor/settings" element={<DoctorSettings />} />
            <Route path="/doctor/help" element={<DoctorHelp />} />
            
            {/* Laboratory Routes */}
            <Route path="/lab/dashboard" element={<LabDashboard />} />
            <Route path="/lab/pending" element={<LabPending />} />
            <Route path="/lab/completed" element={<LabCompleted />} />
            <Route path="/lab/settings" element={<LabSettings />} />
            <Route path="/lab/help" element={<LabHelp />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
