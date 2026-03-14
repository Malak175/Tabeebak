import {
  AccountSettingsContent,
  doctorNavItems,
  settingsIcons,
} from "@/components/settings/AccountSettingsContent";

const DoctorSettings = () => (
  <AccountSettingsContent
    dashboardRole="doctor"
    title="Settings"
    description="Manage your shared account profile, contact data, notifications, and security."
    navItems={doctorNavItems}
    layoutIcon={settingsIcons.doctor}
  />
);

export default DoctorSettings;
