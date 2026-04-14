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
    <div className="rounded-xl border border-dashed bg-background/60 px-4 py-3 text-sm">
      <div className="font-semibold">Laboratory Settings</div>
      <p className="text-muted-foreground">
        These sections configure your lab profile, branches, services, and branding details.
      </p>
    </div>
    <LabProfileSettingsSections />
  </AccountSettingsContent>
);

export default LabSettings;
