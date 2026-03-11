import {
  Calendar,
  ClipboardList,
  FlaskConical,
  Heart,
  HelpCircle,
  Home,
  Pill,
  Settings,
} from "lucide-react";

export const patientNavItems = [
  { title: "Dashboard", url: "/patient/dashboard", icon: Home },
  { title: "Appointments", url: "/patient/appointments", icon: Calendar },
  { title: "Prescriptions", url: "/patient/prescriptions", icon: Pill },
  { title: "Lab Orders", url: "/patient/lab-orders", icon: ClipboardList },
  { title: "Lab Results", url: "/patient/lab-results", icon: FlaskConical },
  { title: "Health Tips", url: "/patient/tips", icon: Heart },
  { title: "Settings", url: "/patient/settings", icon: Settings },
  { title: "Help", url: "/patient/help", icon: HelpCircle },
] as const;
