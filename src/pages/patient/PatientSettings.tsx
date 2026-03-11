import {
  Calendar,
  FlaskConical,
  Heart,
  HelpCircle,
  Home,
  Settings,
  User,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SharedAccountSettings from "@/components/settings/SharedAccountSettings";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { title: "Dashboard", url: "/patient/dashboard", icon: Home },
  { title: "Appointments", url: "/patient/appointments", icon: Calendar },
  { title: "Lab Results", url: "/patient/lab-results", icon: FlaskConical },
  { title: "Health Tips", url: "/patient/tips", icon: Heart },
  { title: "Settings", url: "/patient/settings", icon: Settings },
  { title: "Help", url: "/patient/help", icon: HelpCircle },
];

const PatientSettings = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout
      userRole="patient"
      userName={user?.name ?? "Patient"}
      navItems={navItems}
      userIcon={User}
    >
      <div className="max-w-7xl">
        <SharedAccountSettings
          bioLabel="Bio"
          pageDescription="Manage your account preferences, profile details, and privacy settings."
          profileDescription="Update the shared account details shown across your patient experience."
          profileTitle="Profile Information"
          showDemographics
          variant="individual"
        />
      </div>
    </DashboardLayout>
  );
};

export default PatientSettings;
