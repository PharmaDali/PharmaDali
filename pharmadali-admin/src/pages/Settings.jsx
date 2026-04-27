import { useState } from "react";
import "../assets/css/settings.css";
import { SettingsListView } from "./settings/SettingsList";
import { GeneralSettings } from "./settings/GeneralSettings";
import { AccountSettings } from "./settings/AccountSettings";
import { PlaceholderSettings } from "./settings/PlaceholderSettings";

const settingsMap = {
  general: { component: GeneralSettings },
  account: { component: AccountSettings },
  products: {
    component: PlaceholderSettings,
    props: {
      title: "Products and Pricing",
      description: "Configure product categories, items, and pricing rules.",
    },
  },
  pos: {
    component: PlaceholderSettings,
    props: {
      title: "POS and Transaction Settings",
      description: "Control payment methods and transaction behavior.",
    },
  },
  receipt: {
    component: PlaceholderSettings,
    props: {
      title: "Receipt and Printing",
      description: "Customize receipt format and printing options.",
    },
  },
  devices: {
    component: PlaceholderSettings,
    props: {
      title: "Devices",
      description: "Set up and manage connected hardware devices.",
    },
  },
  operations: {
    component: PlaceholderSettings,
    props: {
      title: "Operations",
      description: "Configure internal processes and system-generated reports.",
    },
  },
  mobile: {
    component: PlaceholderSettings,
    props: {
      title: "Mobile App Content",
      description: "Manage content displayed in the PharmaDali customer mobile application.",
    },
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
        <div className="p-4">
          <Component {...props} onNavigate={handleNavigate} />
        </div>
      );
    }
  }

  return (
    <div className="p-4">
      <SettingsListView onNavigate={handleNavigate} />
    </div>
  );
}

export default Settings;

