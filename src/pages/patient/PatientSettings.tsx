import {
  AccountSettingsContent,
  patientNavItems,
  settingsIcons,
} from "@/components/settings/AccountSettingsContent";
import { PatientProfileSettingsSections } from "@/components/settings/PatientProfileSettingsSections";

const PatientSettings = () => (
  <AccountSettingsContent
    dashboardRole="patient"
    title="Settings"
    description="Manage your shared account profile, contact data, notifications, security, and patient-specific information."
    navItems={patientNavItems}
    layoutIcon={settingsIcons.patient}
  >
    <PatientProfileSettingsSections />
  </AccountSettingsContent>
);

export default PatientSettings;
