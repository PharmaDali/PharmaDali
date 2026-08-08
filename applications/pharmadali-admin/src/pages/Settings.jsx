import { useState } from "react";
import "../assets/css/settings.css";
import { SettingsListView } from "./settings/SettingsList";
import { GeneralSettings } from "./settings/GeneralSettings";
import { AccountSettings } from "./settings/AccountSettings";
import { CategoryManagement } from "./settings/CategoryManagement";
import HardwareAndReceipts from "./settings/HardwareAndReceipts";
import Operations from "./settings/Operations";
import BackupAndRestore from "./settings/BackupAndRestore";

const settingsMap = {
  general: {
    component: GeneralSettings,
  },
  account: {
    component: AccountSettings,
  },
  category: {
    component: CategoryManagement,
  },
  hardware: {
    component: HardwareAndReceipts,
  },
  // Alias mappings for legacy routes
  receipt: {
    component: HardwareAndReceipts,
  },
  devices: {
    component: HardwareAndReceipts,
  },
  operations: {
    component: Operations,
  },
  backup: {
    component: BackupAndRestore,
  },
};

function Settings() {
  const [view, setView] = useState("settings");

  const handleNavigate = (target) => setView(target);

  if (view !== "settings") {
    const settingConfig = settingsMap[view];
    if (settingConfig) {
      const Component = settingConfig.component;
      const props = settingConfig.props || {};
      return <Component {...props} onNavigate={handleNavigate} />;
    }
  }

  return <SettingsListView onNavigate={handleNavigate} />;
}

export default Settings;
