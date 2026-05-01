import { useState } from "react";
import "../assets/css/settings.css";
import { SettingsListView } from "./settings/SettingsList";
import { PlaceholderSettings } from "./settings/PlaceholderSettings";
import { GeneralSettings } from "./settings/GeneralSettings";
import { AccountSettings } from "./settings/AccountSettings";
import { ProductsPricing } from "./settings/ProductsPricing";
import { ProductConfiguration } from "./settings/ProductConfiguration";
import { PricingRules } from "./settings/PricingRules";
import ReceiptAndPrinting from "./settings/ReceiptAndPrinting";
import Devices from "./settings/Devices";
import Operations from "./settings/Operations";
import MobileAppContent from "./settings/MobileAppContent";

const settingsMap = {
  general: {
    component: GeneralSettings,
  },
  account: {
    component: AccountSettings,
  },
  products: {
    component: ProductsPricing,
  },
  "product-config": {
    component: ProductConfiguration,
  },
  "pricing-rules": {
    component: PricingRules,
  },

  receipt: {
    component: ReceiptAndPrinting,
  },
  devices: {
    component: Devices,
  },
  operations: {
    component: Operations,
  },
  mobile: {
    component: MobileAppContent,
  },
  export: {
    component: PlaceholderSettings,
    props: {
      title: "Export Data",
      description: "Export your system data into downloadable files.",
    },
  },
  backup: {
    component: PlaceholderSettings,
    props: {
      title: "Backup and Restore",
      description: "Handle data backup, recovery, and system restoration.",
    },
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
      return (
        <>
          <Component {...props} onNavigate={handleNavigate} />
        </>
      );
    }
  }

  return (
    <>
      <SettingsListView onNavigate={handleNavigate} />
    </>
  );
}

export default Settings;

