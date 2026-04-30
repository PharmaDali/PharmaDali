import { Breadcrumb } from "./Breadcrumb";
import "../../assets/css/settings/common.css";

export const SettingForm = ({ title, description, isEditing, onEditChange, onSave, children, breadcrumbs, onNavigate }) => (
  <>
    <Breadcrumb crumbs={breadcrumbs} onNavigate={onNavigate} />

    <header className="settings-detail-header">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h5 className="fw-bold settings-detail-title">{title}</h5>
          <p className="settings-detail-subtitle">{description}</p>
        </div>
        <div className="settings-button-group">
          <button className="btn btn-outline-primary btn-sm" onClick={() => onEditChange(true)}>
            Edit
          </button>
          <button className="btn btn-primary btn-sm" onClick={onSave} disabled={!isEditing}>
            Save Changes
          </button>
        </div>
      </div>
    </header>

    <div className="settings-form-container">{children}</div>
  </>
);

export const FormGroup = ({ label, children, isCheckbox = false }) => (
  <div className="settings-form-group">
    {isCheckbox ? (
      <label className="settings-form-label d-flex align-items-center gap-2">
        {children}
        <span>{label}</span>
      </label>
    ) : (
      <>
        <label className="settings-form-label">{label}</label>
        {children}
      </>
    )}
  </div>
);

export const FormDisplay = ({ children }) => <div className="settings-form-display">{children}</div>;
