import {
  AccountSettingsContent,
  labNavItems,
  settingsIcons,
} from "@/components/settings/AccountSettingsContent";

const LabSettings = () => (
  <AccountSettingsContent
    dashboardRole="laboratory"
    title="Settings"
    description="Manage the laboratory account bootstrap profile and shared security preferences."
    navItems={labNavItems}
    layoutIcon={settingsIcons.laboratory}
  />
);

export default LabSettings;
