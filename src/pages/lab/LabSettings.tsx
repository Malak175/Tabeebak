import {
  CheckCircle,
  Clock,
  FlaskConical,
  HelpCircle,
  Home,
  Settings,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SharedAccountSettings from "@/components/settings/SharedAccountSettings";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { title: "Dashboard", url: "/lab/dashboard", icon: Home },
  { title: "Pending Tests", url: "/lab/pending", icon: Clock },
  { title: "Completed", url: "/lab/completed", icon: CheckCircle },
  { title: "Settings", url: "/lab/settings", icon: Settings },
  { title: "Help", url: "/lab/help", icon: HelpCircle },
];

const LabSettings = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout
      userRole="laboratory"
      userName={user?.name ?? "Laboratory"}
      userSubtitle={user?.role ?? "Lab"}
      navItems={navItems}
      userIcon={FlaskConical}
    >
      <div className="max-w-7xl">
        <SharedAccountSettings
          bioLabel="Description"
          pageDescription="Manage shared laboratory account details, notification preferences, and security."
          profileDescription="Update the laboratory details used by shared account and settings features."
          profileTitle="Laboratory Information"
          showBio
          variant="organization"
        />
      </div>
    </DashboardLayout>
  );
};

export default LabSettings;
