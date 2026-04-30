import { settingsList } from "./constants";
import "../../assets/css/settings/common.css";

export const SettingsListView = ({ onNavigate }) => (
  <section className="dashboard-page">
    <header className="admin-page-header mb-3">
      <h4 className="fw-bold mb-0 admin-page-title">Settings</h4>
      <p className="admin-page-subtitle mb-0">Configurations related to the pharmacy applications.</p>
    </header>

    <div className="settings-list-container">
      {settingsList.map((setting) => (
        <div
          key={setting.id}
          className="settings-list-item"
          onClick={() => onNavigate(setting.id)}
        >
          <div className="settings-list-item-content">
            <h6 className="settings-list-item-label">{setting.label}</h6>
            <p className="settings-list-item-description">{setting.description}</p>
          </div>
          <span className="settings-list-item-arrow">&rsaquo;</span>
        </div>
      ))}
    </div>
  </section>
);
