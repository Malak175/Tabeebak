import {
  BookOpen,
  Calendar,
  ClipboardList,
  Clock,
  FlaskConical,
  Heart,
  HelpCircle,
  Home,
  Settings,
} from "lucide-react";

export const patientBookingNavItems = [
  { title: "Dashboard", url: "/patient/dashboard", icon: Home },
  { title: "Book", url: "/patient/book", icon: BookOpen },
  { title: "Requests", url: "/patient/requests", icon: Clock },
  { title: "Appointments", url: "/patient/appointments", icon: Calendar },
  { title: "Prescriptions", url: "/patient/prescriptions", icon: ClipboardList },
  { title: "Lab Results", url: "/patient/lab-results", icon: FlaskConical },
  { title: "Health Tips", url: "/patient/tips", icon: Heart },
  { title: "Settings", url: "/patient/settings", icon: Settings },
  { title: "Help", url: "/patient/help", icon: HelpCircle },
] as const;
