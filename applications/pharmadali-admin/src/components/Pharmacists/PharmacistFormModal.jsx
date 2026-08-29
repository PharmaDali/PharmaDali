import React, { useRef } from "react";

export function PharmacistFormModal({
  isOpen,
  onClose,
  editingId,
  formData,
  handleInputChange,
  handleSave,
  isSaving,
  fieldErrors,
  formError,
}) {
  const birthdateRef = useRef(null);

  if (!isOpen) return null;

  return (
    <div className="pharmacists-modal-overlay" onClick={onClose}>
      <div className="pharmacists-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pharmacists-modal-header">
          <h5 className="pharmacists-modal-title">
            {editingId ? "Edit pharmacist information" : "Add new pharmacist"}
          </h5>
          <button
            type="button"
            className="pharmacists-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSave} className="pharmacists-modal-form" noValidate>
          {formError && (
            <div className="pharmacists-error-banner" role="alert">
              <i className="fa-solid fa-circle-exclamation" aria-hidden="true" />
              <div className="pharmacists-error-banner-content">
                <div className="pharmacists-error-banner-title">{formError}</div>
              </div>
            </div>
          )}

          <div className="pharmacists-form-row">
            <div className="pharmacists-form-group">
              <label className="pharmacists-form-label">First name *</label>
              <input
                type="text"
                className={`form-control pharmacists-form-input ${fieldErrors.firstName ? "is-invalid" : ""}`}
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter first name"
              />
              {fieldErrors.firstName && (
                <span className="pharmacists-field-error">
                  <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "11px" }} />
                  {fieldErrors.firstName}
                </span>
              )}
            </div>
            <div className="pharmacists-form-group">
              <label className="pharmacists-form-label">Last name *</label>
              <input
                type="text"
                className={`form-control pharmacists-form-input ${fieldErrors.lastName ? "is-invalid" : ""}`}
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter last name"
              />
              {fieldErrors.lastName && (
                <span className="pharmacists-field-error">
                  <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "11px" }} />
                  {fieldErrors.lastName}
                </span>
              )}
            </div>
          </div>

          {!editingId && (
            <div className="pharmacists-form-row pharmacists-form-row-single">
              <div className="pharmacists-form-group">
                <label className="pharmacists-form-label">Email *</label>
                <input
                  type="email"
                  className={`form-control pharmacists-form-input ${fieldErrors.email ? "is-invalid" : ""}`}
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
                {fieldErrors.email && (
                  <span className="pharmacists-field-error">
                    <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "11px" }} />
                    {fieldErrors.email}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="pharmacists-form-row">
            <div className="pharmacists-form-group">
              <label className="pharmacists-form-label">Mobile number *</label>
              <input
                type="tel"
                className={`form-control pharmacists-form-input ${fieldErrors.mobile ? "is-invalid" : ""}`}
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="Enter mobile number"
              />
              {fieldErrors.mobile && (
                <span className="pharmacists-field-error">
                  <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "11px" }} />
                  {fieldErrors.mobile}
                </span>
              )}
            </div>
            <div className="pharmacists-form-group">
              <label className="pharmacists-form-label">Birthdate *</label>
              <div style={{ position: "relative" }}>
                <input
                  ref={birthdateRef}
                  type="date"
                  className={`form-control pharmacists-form-input ${fieldErrors.birthdate ? "is-invalid" : ""}`}
                  name="birthdate"
                  value={formData.birthdate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={handleInputChange}
                  style={{ paddingRight: "2.5rem", cursor: "pointer" }}
                />
                <span
                  onClick={() => {
                    if (birthdateRef.current) {
                      try { birthdateRef.current.showPicker(); }
                      catch { birthdateRef.current.click(); }
                    }
                  }}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    color: "#9cb8cc",
                    pointerEvents: "all",
                    lineHeight: 1,
                  }}
                  title="Open calendar"
                >
                  <i className="fa-regular fa-calendar" style={{ fontSize: "15px" }} />
                </span>
              </div>
              {fieldErrors.birthdate && (
                <span className="pharmacists-field-error">
                  <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "11px" }} />
                  {fieldErrors.birthdate}
                </span>
              )}
            </div>
          </div>

          <div className="pharmacists-form-row">
            <div className="pharmacists-form-group">
              <label className="pharmacists-form-label">Status</label>
              <select
                className={`form-control pharmacists-form-input ${fieldErrors.status ? "is-invalid" : ""}`}
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="pharmacists-form-group">
              <label className="pharmacists-form-label">License number</label>
              <input
                type="text"
                className={`form-control pharmacists-form-input ${fieldErrors.licenseNumber ? "is-invalid" : ""}`}
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                placeholder="Enter license number"
              />
              {fieldErrors.licenseNumber && (
                <span className="pharmacists-field-error">
                  <i className="fa-solid fa-circle-exclamation" style={{ fontSize: "11px" }} />
                  {fieldErrors.licenseNumber}
                </span>
              )}
            </div>
          </div>

          <div className="pharmacists-modal-footer">
            <button
              type="button"
              className="btn pharmacists-btn-cancel"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn pharmacists-btn-save"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  {editingId ? "Saving..." : "Creating..."}
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PharmacistFormModal;
