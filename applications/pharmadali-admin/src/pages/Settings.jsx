import { useState } from "react";
import "../assets/css/settings.css";
import { SettingsListView } from "../components/Settings/SettingsList";
import { GeneralSettings } from "../components/Settings/GeneralSettings";
import { PasswordSettings } from "../components/Settings/PasswordSettings";
import { CategoryManagement } from "../components/Settings/CategoryManagement";
import DiscountSettings from "../components/Settings/DiscountSettings";
import HardwareAndReceipts from "../components/Settings/HardwareAndReceipts";
import Operations from "../components/Settings/Operations";
import ItemExchangeSettings from "../components/Settings/ItemExchangeSettings";
import BackupAndRestore from "../components/Settings/BackupAndRestore";

const settingsMap = {
  general: {
    component: GeneralSettings,
  },
  account: {
    component: PasswordSettings,
  },
  category: {
    component: CategoryManagement,
  },
  discount: {
    component: DiscountSettings,
  },
  hardware: {
    component: HardwareAndReceipts,
  },
  receipt: {
    component: HardwareAndReceipts,
  },
  devices: {
    component: HardwareAndReceipts,
  },
  operations: {
    component: Operations,
  },
  item_exchange: {
    component: ItemExchangeSettings,
  },
  exchange: {
    component: ItemExchangeSettings,
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
