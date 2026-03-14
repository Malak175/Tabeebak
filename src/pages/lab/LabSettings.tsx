import {
  AccountSettingsContent,
  labNavItems,
  settingsIcons,
} from "@/components/settings/AccountSettingsContent";
import { LabProfileSettingsSections } from "@/components/settings/LabProfileSettingsSections";

const LabSettings = () => (
  <AccountSettingsContent
    dashboardRole="laboratory"
    title="Settings"
    description="Manage the laboratory account, live lab profile, branches, services catalog, and shared security preferences."
    navItems={labNavItems}
    layoutIcon={settingsIcons.laboratory}
  >
    <LabProfileSettingsSections />
  </AccountSettingsContent>
);

export default LabSettings;
