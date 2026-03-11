import {
  Calendar,
  Clock,
  HelpCircle,
  Home,
  Settings,
  Stethoscope,
  Users,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SharedAccountSettings from "@/components/settings/SharedAccountSettings";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { title: "Dashboard", url: "/doctor/dashboard", icon: Home },
  { title: "Appointments", url: "/doctor/appointments", icon: Calendar },
  { title: "Patients", url: "/doctor/patients", icon: Users },
  { title: "Schedule", url: "/doctor/schedule", icon: Clock },
  { title: "Settings", url: "/doctor/settings", icon: Settings },
  { title: "Help", url: "/doctor/help", icon: HelpCircle },
];

const DoctorSettings = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout
      userRole="doctor"
      userName={user?.name ?? "Doctor"}
      userSubtitle={user?.role ?? "Doctor"}
      navItems={navItems}
      userIcon={Stethoscope}
    >
      <div className="max-w-7xl">
        <SharedAccountSettings
          bioLabel="Professional Bio"
          pageDescription="Manage your shared account profile, communications, and security controls."
          profileDescription="Update the doctor account details used across role-based routing and settings."
          profileTitle="Professional Profile"
          showBio
          variant="individual"
        />
      </div>
    </DashboardLayout>
  );
};

export default DoctorSettings;
