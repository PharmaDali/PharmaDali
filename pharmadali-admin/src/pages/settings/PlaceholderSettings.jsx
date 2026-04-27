import { Breadcrumb } from "./Breadcrumb";

export const PlaceholderSettings = ({ title, description, onNavigate }) => (
  <>
    <Breadcrumb
      crumbs={[
        { label: "Settings", view: "settings" },
        { label: title, view: "settings" },
      ]}
      onNavigate={onNavigate}
    />

    <header className="settings-detail-header">
      <div>
        <h5 className="fw-bold settings-detail-title">{title}</h5>
        <p className="settings-detail-subtitle">{description}</p>
      </div>
    </header>

    <div className="settings-placeholder">
      <p className="text-muted">This settings section is coming soon.</p>
    </div>
  </>
);
