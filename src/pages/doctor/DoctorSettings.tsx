import {
  AccountSettingsContent,
  doctorNavItems,
  settingsIcons,
} from "@/components/settings/AccountSettingsContent";
import { DoctorProfileSettingsSections } from "@/components/settings/DoctorProfileSettingsSections";

const DoctorSettings = () => (
  <AccountSettingsContent
    dashboardRole="doctor"
    title="Settings"
    description="Manage your shared account profile, contact data, notifications, and security."
    navItems={doctorNavItems}
    layoutIcon={settingsIcons.doctor}
  >
    <DoctorProfileSettingsSections />
  </AccountSettingsContent>
);

export default DoctorSettings;
