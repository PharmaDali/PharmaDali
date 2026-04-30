import { useState } from "react";
import "../../assets/css/settings.css";

export const TaxOverlay = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    enabled: true,
    tax1Name: "State Rate",
    tax1Rate: "4",
    tax2Name: "Local Rate",
    tax2Rate: "4.875",
    applyTax2OnTax1: false,
    tax3Name: "",
    tax3Rate: "",
    applyTax3OnBoth: false,
    taxNumber: "T000123456789",
    priceExcludesTax: false,
    applyTaxOnServiceFee: false,
  });

  if (!isOpen) return null;

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, enabled: !prev.enabled }));
  };

  const handleCheck = (field) => {
    setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onClose();
  };

  return (
    <div className="settings-modal-backdrop" onClick={onClose}>
      <div
        className="settings-modal"
        style={{ maxWidth: "600px" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="settings-modal-header">
          <h4 className="settings-modal-title">Setup Tax</h4>
          <div className="settings-modal-divider" />
        </div>

        <div className="settings-modal-body" style={{ opacity: formData.enabled ? 1 : 0.6 }}>
          <div className="settings-flex-row" style={{ marginBottom: "0.5rem" }}>
            <span className="settings-modal-label" style={{ fontSize: "1rem" }}>Enabled</span>
            <div 
              className={`toggle-switch${formData.enabled ? " active" : ""}`}
              onClick={handleToggle}
            >
              <div className="toggle-handle" />
            </div>
          </div>

          {[
            { label: "Tax 1", name: "tax1Name", rate: "tax1Rate" },
            { label: "Tax 2", name: "tax2Name", rate: "tax2Rate" },
          ].map((tax) => (
            <div key={tax.label} className="settings-flex-column">
              <label className="settings-modal-label">{tax.label}</label>
              <div className="settings-flex-row">
                <input
                  type="text"
                  className="settings-modal-input"
                  placeholder="Tax name"
                  disabled={!formData.enabled}
                  value={formData[tax.name]}
                  onChange={(e) => handleChange(tax.name, e.target.value)}
                  style={{ flex: 1.5 }}
                />
                <div className="settings-flex-row" style={{ flex: 1 }}>
                  <input
                    type="text"
                    className="settings-modal-input"
                    placeholder="Tax rate"
                    disabled={!formData.enabled}
                    value={formData[tax.rate]}
                    onChange={(e) => handleChange(tax.rate, e.target.value)}
                  />
                  <span style={{ color: "#888", fontSize: "1.1rem" }}>%</span>
                </div>
              </div>
            </div>
          ))}

          <div className="pd-checkbox-container" onClick={() => formData.enabled && handleCheck("applyTax2OnTax1")}>
            <input
              type="checkbox"
              className="pd-checkbox"
              checked={formData.applyTax2OnTax1}
              disabled={!formData.enabled}
              onChange={() => {}}
            />
            <span className="pd-checkbox-label">Apply Tax 2 on Tax 1 (Subtotal + Tax 1)</span>
          </div>

          <div className="settings-flex-column">
            <label className="settings-modal-label">Tax 3</label>
            <div className="settings-flex-row">
              <input
                type="text"
                className="settings-modal-input"
                placeholder="Tax name"
                disabled={!formData.enabled}
                value={formData.tax3Name}
                onChange={(e) => handleChange("tax3Name", e.target.value)}
                style={{ flex: 1.5 }}
              />
              <div className="settings-flex-row" style={{ flex: 1 }}>
                <input
                  type="text"
                  className="settings-modal-input"
                  placeholder="Tax rate"
                  disabled={!formData.enabled}
                  value={formData.tax3Rate}
                  onChange={(e) => handleChange("tax3Rate", e.target.value)}
                />
                <span style={{ color: "#888", fontSize: "1.1rem" }}>%</span>
              </div>
            </div>
          </div>

          <div className="pd-checkbox-container" onClick={() => formData.enabled && handleCheck("applyTax3OnBoth")}>
            <input
              type="checkbox"
              className="pd-checkbox"
              checked={formData.applyTax3OnBoth}
              disabled={!formData.enabled}
              onChange={() => {}}
            />
            <span className="pd-checkbox-label">Apply Tax 3 on Tax 1 and Tax 2 (Subtotal + Tax 1 + Tax 2)</span>
          </div>

          <div className="settings-flex-column">
            <label className="settings-modal-label">Tax Number</label>
            <input
              type="text"
              className="settings-modal-input"
              disabled={!formData.enabled}
              value={formData.taxNumber}
              onChange={(e) => handleChange("taxNumber", e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div className="settings-flex-column" style={{ marginTop: "0.5rem" }}>
            <div className="pd-checkbox-container" onClick={() => formData.enabled && handleCheck("priceExcludesTax")}>
              <input
                type="checkbox"
                className="pd-checkbox"
                checked={formData.priceExcludesTax}
                disabled={!formData.enabled}
                onChange={() => {}}
              />
              <span className="pd-checkbox-label">Price excludes tax</span>
            </div>
            <div className="pd-checkbox-container" onClick={() => formData.enabled && handleCheck("applyTaxOnServiceFee")}>
              <input
                type="checkbox"
                className="pd-checkbox"
                checked={formData.applyTaxOnServiceFee}
                disabled={!formData.enabled}
                onChange={() => {}}
              />
              <span className="pd-checkbox-label">Apply Tax on service fee</span>
            </div>
          </div>
        </div>

        <div className="settings-modal-footer">
          <button type="button" className="btn-pd-ghost" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
          <button type="button" className="btn-pd-primary" onClick={handleSave} style={{ flex: 1 }}>Save</button>
        </div>
      </div>
    </div>
  );
};
