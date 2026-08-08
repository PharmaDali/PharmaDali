import { Breadcrumb } from "./Breadcrumb";
import "../../assets/css/settings/common.css";

export const SettingForm = ({
  title,
  description,
  isEditing,
  onEditChange,
  onSave,
  onCancel,
  children,
  breadcrumbs,
  onNavigate,
  showEditSave = true,
  noContainer = false,
}) => (
  <>
    <Breadcrumb crumbs={breadcrumbs} onNavigate={onNavigate} />

    <header className="settings-detail-header">
      <div className="d-flex justify-content-between align-items-start gap-3">
        <div>
          <h5 className="fw-bold settings-detail-title">{title}</h5>
          <p className="settings-detail-subtitle">{description}</p>
        </div>
        {showEditSave && onEditChange && (
          <div className="settings-button-group d-flex gap-2">
            {!isEditing ? (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm px-3 rounded-2"
                onClick={() => onEditChange(true)}
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm px-3 rounded-2"
                  onClick={() => {
                    onEditChange(false);
                    if (onCancel) onCancel();
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm px-3 rounded-2"
                  onClick={onSave}
                  style={{ backgroundColor: "#2aabe2", borderColor: "#2aabe2" }}
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>

    {noContainer ? children : <div className="settings-form-container">{children}</div>}
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
