import { settingsList } from "./constants";

export const SettingsListView = ({ onNavigate }) => (
  <section className="dashboard-page">
    <header className="admin-page-header mb-4">
      <h4 className="fw-bold mb-1 admin-page-title">Settings</h4>
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
