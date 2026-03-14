import {
  AccountSettingsContent,
  patientNavItems,
  settingsIcons,
} from "@/components/settings/AccountSettingsContent";

const PatientSettings = () => (
  <AccountSettingsContent
    dashboardRole="patient"
    title="Settings"
    description="Manage your account, profile, notifications, and security preferences."
    navItems={patientNavItems}
    layoutIcon={settingsIcons.patient}
  />
);

export default PatientSettings;
