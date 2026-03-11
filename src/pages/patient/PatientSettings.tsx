import {
  User,
} from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PatientProfileSettings from "@/components/patient/PatientProfileSettings";
import SharedAccountSettings from "@/components/settings/SharedAccountSettings";
import { useAuth } from "@/hooks/useAuth";
import { patientNavItems } from "@/pages/patient/navigation";

const PatientSettings = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout
      userRole="patient"
      userName={user?.name ?? "Patient"}
      navItems={patientNavItems}
      userIcon={User}
    >
      <div className="max-w-7xl space-y-10">
        <SharedAccountSettings
          bioLabel="Bio"
          pageDescription="Manage your account preferences, profile details, and privacy settings."
          profileDescription="Update the shared account details shown across your patient experience."
          profileTitle="Profile Information"
          showDemographics
          variant="individual"
        />
        <PatientProfileSettings />
      </div>
    </DashboardLayout>
  );
};

export default PatientSettings;
