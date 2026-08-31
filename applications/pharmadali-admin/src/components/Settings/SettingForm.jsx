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
}) => {
  const mobileButtons = showEditSave && onEditChange && (
    <div className="settings-button-group d-flex d-lg-none justify-content-between mt-4">
      {!isEditing ? (
        <button
          type="button"
          className="btn btn-sm px-4 rounded-3 fw-semibold"
          style={{ backgroundColor: "#e0f2fe", color: "#4dbff0", border: "none" }}
          onClick={() => onEditChange(true)}
        >
          Edit
        </button>
      ) : (
        <>
          <button
            type="button"
            className="btn btn-sm px-4 rounded-3 fw-semibold"
            style={{ backgroundColor: "#f1f5f9", color: "#64748b", border: "none" }}
            onClick={() => {
              onEditChange(false);
              if (onCancel) onCancel();
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-sm px-4 rounded-3 fw-semibold text-white"
            onClick={onSave}
            style={{ backgroundColor: "#4dbff0", border: "none" }}
          >
            Save Changes
          </button>
        </>
      )}
    </div>
  );

  return (
    <>
      <Breadcrumb crumbs={breadcrumbs} onNavigate={onNavigate} />

      <header className="settings-detail-header">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div>
            <h5 className="fw-bold settings-detail-title">{title}</h5>
            <p className="settings-detail-subtitle">{description}</p>
          </div>
          {showEditSave && onEditChange && (
            <div className="settings-button-group d-none d-lg-flex gap-2">
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
                    style={{ backgroundColor: "#4dbff0", borderColor: "#4dbff0" }}
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {noContainer ? (
        <>
          {children}
          {mobileButtons}
        </>
      ) : (
        <div className="settings-form-container">
          {children}
          {mobileButtons}
        </div>
      )}
    </>
  );
};

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
