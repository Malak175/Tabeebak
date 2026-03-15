import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import Doctors from "./pages/Doctors";
import LabServices from "./pages/LabServices";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PatientBookingEntryPage from "./pages/patient/Booking";
import PatientDashboard from "./pages/patient/Dashboard";
import PatientDoctorDetailsPage from "./pages/patient/DoctorDetails";
import PatientDoctorsBrowsePage from "./pages/patient/DoctorsBrowse";
import PatientLabDetailsPage from "./pages/patient/LabDetails";
import PatientLabsBrowsePage from "./pages/patient/LabsBrowse";
import PatientAppointments from "./pages/patient/Appointments";
import PatientAppointmentDetails from "./pages/patient/AppointmentDetails";
import PatientLabResults from "./pages/patient/LabResults";
import PatientLabResultDetails from "./pages/patient/LabResultDetails";
import PatientPrescriptions from "./pages/patient/Prescriptions";
import PatientPrescriptionDetails from "./pages/patient/PrescriptionDetails";
import PatientRequestDetailsPage from "./pages/patient/RequestDetails";
import PatientRequestsPage from "./pages/patient/Requests";
import PatientHealthTips from "./pages/patient/HealthTips";
import PatientSettings from "./pages/patient/PatientSettings";
import PatientHelp from "./pages/patient/Help";
import DoctorDashboard from "./pages/doctor/Dashboard";
import DoctorAppointments from "./pages/doctor/Appointments";
import DoctorAppointmentDetails from "./pages/doctor/AppointmentDetails";
import DoctorPatients from "./pages/doctor/Patients";
import DoctorPatientSummary from "./pages/doctor/PatientSummary";
import DoctorPrescriptions from "./pages/doctor/Prescriptions";
import DoctorReviews from "./pages/doctor/Reviews";
import DoctorSchedule from "./pages/doctor/Schedule";
import DoctorSettings from "./pages/doctor/DoctorSettings";
import DoctorHelp from "./pages/doctor/Help";
import LabDashboard from "./pages/lab/Dashboard";
import LabPending from "./pages/lab/Pending";
import LabCompleted from "./pages/lab/Completed";
import LabOrderDetailsPage from "./pages/lab/OrderDetails";
import LabSettings from "./pages/lab/LabSettings";
import LabHelp from "./pages/lab/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/register" element={<Register />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/lab-services" element={<LabServices />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Patient Routes */}
              <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={["Patient"]}><PatientDashboard /></ProtectedRoute>} />
              <Route path="/patient/book" element={<ProtectedRoute allowedRoles={["Patient"]}><PatientBookingEntryPage /></ProtectedRoute>} />
              <Route path="/patient/doctors" element={<ProtectedRoute allowedRoles={["Patient"]}><PatientDoctorsBrowsePage /></ProtectedRoute>} />
              <Route path="/patient/doctors/:doctorId" element={<ProtectedRoute allowedRoles={["Patient"]}><PatientDoctorDetailsPage /></ProtectedRoute>} />
              <Route path="/patient/labs" element={<ProtectedRoute allowedRoles={["Patient"]}><PatientLabsBrowsePage /></ProtectedRoute>} />
              <Route path="/patient/labs/:labId" element={<ProtectedRoute allowedRoles={["Patient"]}><PatientLabDetailsPage /></ProtectedRoute>} />
              <Route path="/patient/requests" element={<ProtectedRoute allowedRoles={["Patient"]}><PatientRequestsPage /></ProtectedRoute>} />
              <Route path="/patient/requests/:requestType/:requestId" element={<ProtectedRoute allowedRoles={["Patient"]}><PatientRequestDetailsPage /></ProtectedRoute>} />
              <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={["Patient"]}><PatientAppointments /></ProtectedRoute>} />
              <Route path="/patient/appointments/:appointmentId" element={<ProtectedRoute allowedRoles={["Patient"]}><PatientAppointmentDetails /></ProtectedRoute>} />
              <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRoles={["Patient"]}><PatientPrescriptions /></ProtectedRoute>} />
              <Route path="/patient/prescriptions/:prescriptionId" element={<ProtectedRoute allowedRoles={["Patient"]}><PatientPrescriptionDetails /></ProtectedRoute>} />
              <Route path="/patient/lab-results" element={<ProtectedRoute allowedRoles={["Patient"]}><PatientLabResults /></ProtectedRoute>} />
              <Route path="/patient/lab-results/:resultId" element={<ProtectedRoute allowedRoles={["Patient"]}><PatientLabResultDetails /></ProtectedRoute>} />
              <Route path="/patient/tips" element={<ProtectedRoute allowedRoles={["Patient"]}><PatientHealthTips /></ProtectedRoute>} />
              <Route path="/patient/settings" element={<ProtectedRoute allowedRoles={["Patient"]}><PatientSettings /></ProtectedRoute>} />
              <Route path="/patient/help" element={<ProtectedRoute allowedRoles={["Patient"]}><PatientHelp /></ProtectedRoute>} />
              
              {/* Doctor Routes */}
              <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={["Doctor"]}><DoctorDashboard /></ProtectedRoute>} />
              <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={["Doctor"]}><DoctorAppointments /></ProtectedRoute>} />
              <Route path="/doctor/appointments/:appointmentId" element={<ProtectedRoute allowedRoles={["Doctor"]}><DoctorAppointmentDetails /></ProtectedRoute>} />
              <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={["Doctor"]}><DoctorPatients /></ProtectedRoute>} />
              <Route path="/doctor/patients/:patientId" element={<ProtectedRoute allowedRoles={["Doctor"]}><DoctorPatientSummary /></ProtectedRoute>} />
              <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRoles={["Doctor"]}><DoctorPrescriptions /></ProtectedRoute>} />
              <Route path="/doctor/reviews" element={<ProtectedRoute allowedRoles={["Doctor"]}><DoctorReviews /></ProtectedRoute>} />
              <Route path="/doctor/schedule" element={<ProtectedRoute allowedRoles={["Doctor"]}><DoctorSchedule /></ProtectedRoute>} />
              <Route path="/doctor/settings" element={<ProtectedRoute allowedRoles={["Doctor"]}><DoctorSettings /></ProtectedRoute>} />
              <Route path="/doctor/help" element={<ProtectedRoute allowedRoles={["Doctor"]}><DoctorHelp /></ProtectedRoute>} />
              
              {/* Laboratory Routes */}
              <Route path="/lab/dashboard" element={<ProtectedRoute allowedRoles={["Lab"]}><LabDashboard /></ProtectedRoute>} />
              <Route path="/lab/pending" element={<ProtectedRoute allowedRoles={["Lab"]}><LabPending /></ProtectedRoute>} />
              <Route path="/lab/completed" element={<ProtectedRoute allowedRoles={["Lab"]}><LabCompleted /></ProtectedRoute>} />
              <Route path="/lab/orders/:orderId" element={<ProtectedRoute allowedRoles={["Lab"]}><LabOrderDetailsPage /></ProtectedRoute>} />
              <Route path="/lab/settings" element={<ProtectedRoute allowedRoles={["Lab"]}><LabSettings /></ProtectedRoute>} />
              <Route path="/lab/help" element={<ProtectedRoute allowedRoles={["Lab"]}><LabHelp /></ProtectedRoute>} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
