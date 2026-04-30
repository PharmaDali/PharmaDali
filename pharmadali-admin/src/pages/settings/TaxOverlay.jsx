import { useState } from "react";

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
    // logic here po
    onClose();
  };

  return (
    <div className="settings-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="settings-modal"
        style={{ maxWidth: "600px", padding: "2rem", borderRadius: "20px" }}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="settings-modal-header" style={{ borderBottom: "1px solid #eee", marginBottom: "1.5rem", paddingBottom: "0.8rem" }}>
          <h4 className="settings-modal-title" style={{ color: "#48aad9", fontSize: "1.2rem", fontWeight: "600" }}>
            Setup Tax
          </h4>
        </div>

        <div className="settings-modal-body" style={{ gap: "1.2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "1rem", fontWeight: "600", color: "#333" }}>Enabled</span>
            <label className="settings-toggle">
              <input type="checkbox" checked={formData.enabled} onChange={handleToggle} />
              <span className="settings-toggle-slider" style={{ background: formData.enabled ? "#48aad9" : "#ccc" }} />
            </label>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", opacity: formData.enabled ? 1 : 0.6 }}>
            <label style={{ fontSize: "0.95rem", fontWeight: "600", color: "#333" }}>Tax 1</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", width: "100%" }}>
              <input
                type="text"
                className="settings-modal-input"
                placeholder="Tax name"
                disabled={!formData.enabled}
                value={formData.tax1Name}
                onChange={(e) => handleChange("tax1Name", e.target.value)}
                style={{ flex: 1.5, background: "#ededed", border: "none", borderRadius: "12px", padding: "0.75rem 1rem", cursor: formData.enabled ? "text" : "not-allowed" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flex: 1 }}>
                <input
                  type="text"
                  className="settings-modal-input"
                  placeholder="Tax rate"
                  disabled={!formData.enabled}
                  value={formData.tax1Rate}
                  onChange={(e) => handleChange("tax1Rate", e.target.value)}
                  style={{ flex: 1, background: "#ededed", border: "none", borderRadius: "12px", padding: "0.75rem 1rem", cursor: formData.enabled ? "text" : "not-allowed" }}
                />
                <span style={{ color: "#888", fontSize: "1.1rem" }}>%</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", opacity: formData.enabled ? 1 : 0.6 }}>
            <label style={{ fontSize: "0.95rem", fontWeight: "600", color: "#333" }}>Tax 2</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", width: "100%" }}>
              <input
                type="text"
                className="settings-modal-input"
                placeholder="Tax name"
                disabled={!formData.enabled}
                value={formData.tax2Name}
                onChange={(e) => handleChange("tax2Name", e.target.value)}
                style={{ flex: 1.5, background: "#ededed", border: "none", borderRadius: "12px", padding: "0.75rem 1rem", cursor: formData.enabled ? "text" : "not-allowed" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flex: 1 }}>
                <input
                  type="text"
                  className="settings-modal-input"
                  placeholder="Tax rate"
                  disabled={!formData.enabled}
                  value={formData.tax2Rate}
                  onChange={(e) => handleChange("tax2Rate", e.target.value)}
                  style={{ flex: 1, background: "#ededed", border: "none", borderRadius: "12px", padding: "0.75rem 1rem", cursor: formData.enabled ? "text" : "not-allowed" }}
                />
                <span style={{ color: "#888", fontSize: "1.1rem" }}>%</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginLeft: "0.2rem", opacity: formData.enabled ? 1 : 0.6 }}>
            <input
              type="checkbox"
              checked={formData.applyTax2OnTax1}
              disabled={!formData.enabled}
              onChange={() => handleCheck("applyTax2OnTax1")}
              style={{ width: "20px", height: "20px", accentColor: "#48aad9", cursor: formData.enabled ? "pointer" : "not-allowed" }}
            />
            <span style={{ fontSize: "0.85rem", color: "#888" }}>Apply Tax 2 on Tax 1 (Subtotal + Tax 1)</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", opacity: formData.enabled ? 1 : 0.6 }}>
            <label style={{ fontSize: "0.95rem", fontWeight: "600", color: "#333" }}>Tax 3</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", width: "100%" }}>
              <input
                type="text"
                className="settings-modal-input"
                placeholder="Tax name"
                disabled={!formData.enabled}
                value={formData.tax3Name}
                onChange={(e) => handleChange("tax3Name", e.target.value)}
                style={{ flex: 1.5, background: "#ededed", border: "none", borderRadius: "12px", padding: "0.75rem 1rem", cursor: formData.enabled ? "text" : "not-allowed" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flex: 1 }}>
                <input
                  type="text"
                  className="settings-modal-input"
                  placeholder="Tax rate"
                  disabled={!formData.enabled}
                  value={formData.tax3Rate}
                  onChange={(e) => handleChange("tax3Rate", e.target.value)}
                  style={{ flex: 1, background: "#ededed", border: "none", borderRadius: "12px", padding: "0.75rem 1rem", cursor: formData.enabled ? "text" : "not-allowed" }}
                />
                <span style={{ color: "#888", fontSize: "1.1rem" }}>%</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginLeft: "0.2rem", opacity: formData.enabled ? 1 : 0.6 }}>
            <input
              type="checkbox"
              checked={formData.applyTax3OnBoth}
              disabled={!formData.enabled}
              onChange={() => handleCheck("applyTax3OnBoth")}
              style={{ width: "20px", height: "20px", accentColor: "#48aad9", cursor: formData.enabled ? "pointer" : "not-allowed" }}
            />
            <span style={{ fontSize: "0.85rem", color: "#888" }}>Apply Tax 3 on Tax 1 and Tax 2 (Subtotal + Tax 1 + Tax 2)</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", opacity: formData.enabled ? 1 : 0.6 }}>
            <label style={{ fontSize: "0.95rem", fontWeight: "600", color: "#333" }}>Tax Number</label>
            <input
              type="text"
              className="settings-modal-input"
              disabled={!formData.enabled}
              value={formData.taxNumber}
              onChange={(e) => handleChange("taxNumber", e.target.value)}
              style={{ width: "100%", background: "#ededed", border: "none", borderRadius: "12px", padding: "0.75rem 1rem", cursor: formData.enabled ? "text" : "not-allowed" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", marginTop: "0.5rem", opacity: formData.enabled ? 1 : 0.6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginLeft: "0.2rem" }}>
              <input
                type="checkbox"
                checked={formData.priceExcludesTax}
                disabled={!formData.enabled}
                onChange={() => handleCheck("priceExcludesTax")}
                style={{ width: "20px", height: "20px", accentColor: "#48aad9", cursor: formData.enabled ? "pointer" : "not-allowed" }}
              />
              <span style={{ fontSize: "0.85rem", color: "#888" }}>Price excludes tax</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginLeft: "0.2rem" }}>
              <input
                type="checkbox"
                checked={formData.applyTaxOnServiceFee}
                disabled={!formData.enabled}
                onChange={() => handleCheck("applyTaxOnServiceFee")}
                style={{ width: "20px", height: "20px", accentColor: "#48aad9", cursor: formData.enabled ? "pointer" : "not-allowed" }}
              />
              <span style={{ fontSize: "0.85rem", color: "#888" }}>Apply Tax on service fee</span>
            </div>
          </div>
        </div>

        <div className="settings-modal-footer" style={{ marginTop: "2.5rem", gap: "1.5rem" }}>
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={onClose}
            style={{ borderRadius: "12px", borderColor: "#48aad9", color: "#48aad9", flex: 1, padding: "0.8rem" }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            style={{ borderRadius: "12px", background: "#48aad9", border: "none", flex: 1, padding: "0.8rem" }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
