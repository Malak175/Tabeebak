import { User } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DoctorsDirectory from "@/components/doctors/DoctorsDirectory";
import { patientNavItems } from "@/components/settings/AccountSettingsContent";
import { useAuth } from "@/hooks/useAuth";
import { getDisplayName } from "@/lib/auth";

const PatientDoctors = () => {
  const { user } = useAuth();
  const userName = getDisplayName(user ?? {});

  return (
    <DashboardLayout userRole="patient" userName={userName} navItems={patientNavItems} userIcon={User}>
      <DoctorsDirectory mode="patient" />
    </DashboardLayout>
  );
};

export default PatientDoctors;
