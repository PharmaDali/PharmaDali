import { useState } from "react";
import "../../assets/css/settings.css";

const initialSurcharges = [];

const defaultForm = {
  name: "",
  type: "Percentage",
  value: "",
};

export const SurchargeOverlay = ({ isOpen, onClose }) => {
  const [surcharges, setSurcharges] = useState(initialSurcharges);
  const [modal, setModal] = useState({ type: null, surchargeId: null });
  const [formData, setFormData] = useState(defaultForm);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [valueError, setValueError] = useState("");

  if (!isOpen) return null;

  const openAddModal = () => {
    setFormData(defaultForm);
    setValueError("");
    setModal({ type: "add", surchargeId: null });
  };

  const openEditModal = (surcharge) => {
    setFormData({
      name: surcharge.name,
      type: surcharge.type,
      value: surcharge.value,
    });
    setValueError("");
    setModal({ type: "edit", surchargeId: surcharge.id });
  };

  const openDeleteModal = () => {
    setModal((prev) => ({ ...prev, type: "delete" }));
  };

  const closeSubModal = () => {
    setModal({ type: null, surchargeId: null });
    setIsTypeDropdownOpen(false);
  };

  const handleSave = () => {
    if (!formData.name.trim() || valueError) return;

    if (modal.type === "add") {
      const nextId = Math.max(0, ...surcharges.map((s) => s.id)) + 1;
      setSurcharges((prev) => [...prev, { ...formData, id: nextId }]);
    } else if (modal.type === "edit") {
      setSurcharges((prev) =>
        prev.map((s) => (s.id === modal.surchargeId ? { ...formData, id: s.id } : s))
      );
    }
    closeSubModal();
  };

  const handleDelete = () => {
    setSurcharges((prev) => prev.filter((s) => s.id !== modal.surchargeId));
    closeSubModal();
  };

  const handleFormChange = (field, value) => {
    if (field === "value") {
      const isNumeric = /^[0-9.]*$/.test(value);
      if (!isNumeric && value !== "") {
        setValueError("Only numerical values are allowed");
      } else {
        setValueError("");
      }
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const activeSurcharge = surcharges.find((s) => s.id === modal.surchargeId);

  return (
    <div className="settings-modal-backdrop" onClick={onClose}>
      <div className="settings-modal" style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()}>
        <div className="settings-panel-header">
          <div>
            <h5 className="settings-panel-title">Surcharge</h5>
            <p className="settings-panel-subtitle">Add, delete, and update surcharge.</p>
          </div>
          <div className="settings-panel-actions">
            <button type="button" className="icon-btn-circle" onClick={openAddModal}>+</button>
          </div>
        </div>

        <div className="settings-table-card">
          {surcharges.map((surcharge, index) => (
            <div
              key={surcharge.id}
              className={`settings-table-row${index === surcharges.length - 1 ? " is-last" : ""}`}
              onClick={() => openEditModal(surcharge)}
            >
              <div className="settings-table-name">
                <p className="settings-table-name-text">{surcharge.name}</p>
              </div>
              <div className="settings-table-actions">
                <span className="settings-table-value-text">
                  {surcharge.type === "Amount" ? `Php ${surcharge.value}` : `${surcharge.value}%`}
                </span>
              </div>
            </div>
          ))}
          {surcharges.length === 0 && (
            <div className="settings-table-empty">No Records</div>
          )}
        </div>

        {modal.type && (
          <div className="settings-modal-backdrop" style={{ zIndex: 3000, background: "rgba(0,0,0,0.4)" }} onClick={closeSubModal}>
            <div
              className={`settings-modal${modal.type === "delete" ? " settings-modal--confirm" : ""}`}
              style={{ maxWidth: modal.type === "delete" ? "400px" : "500px" }}
              onClick={(e) => e.stopPropagation()}
            >
              {modal.type === "delete" ? (
                <>
                  <div className="settings-modal-header" style={{ border: "none", textAlign: "center" }}>
                    <h4 className="settings-modal-title" style={{ color: "#333" }}>Delete "{activeSurcharge?.name}" ?</h4>
                  </div>
                  <div className="settings-modal-footer" style={{ justifyContent: "center", gap: "2rem" }}>
                    <button type="button" className="btn-pd-ghost" style={{ border: "none" }} onClick={closeSubModal}>Cancel</button>
                    <button type="button" className="btn-pd-ghost" style={{ border: "none" }} onClick={handleDelete}>Delete</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="settings-modal-header">
                    <h4 className="settings-modal-title">Surcharge</h4>
                    <div className="settings-modal-divider" />
                  </div>

                  <div className="settings-modal-body">
                    <div className="settings-modal-field">
                      <label className="settings-modal-label">Surcharge Name</label>
                      <input
                        type="text"
                        className="settings-modal-input"
                        placeholder="Surcharge Name"
                        value={formData.name}
                        onChange={(e) => handleFormChange("name", e.target.value)}
                      />
                    </div>

                    <div className="settings-modal-field">
                      <label className="settings-modal-label">Surcharge Value</label>
                      <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                        <div className="pd-dropdown-container">
                          <button
                            type="button"
                            className="pd-dropdown-btn"
                            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                          >
                            {formData.type}
                            <span style={{ fontSize: "0.6rem" }}>▼</span>
                          </button>
                          {isTypeDropdownOpen && (
                            <div className="pd-dropdown-menu">
                              <div className="pd-dropdown-item" onClick={() => { handleFormChange("type", "Amount"); setIsTypeDropdownOpen(false); }}>Amount</div>
                              <div className="settings-modal-divider" style={{ margin: 0, opacity: 0.2 }} />
                              <div className="pd-dropdown-item" onClick={() => { handleFormChange("type", "Percentage"); setIsTypeDropdownOpen(false); }}>Percentage</div>
                            </div>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1 }}>
                          <span style={{ fontSize: "1rem", color: "#888", minWidth: "35px", textAlign: "right" }}>
                            {formData.type === "Amount" ? "Php" : "%"}
                          </span>
                          <input
                            type="text"
                            className={`settings-modal-input${valueError ? " input-error" : ""}`}
                            placeholder="Value"
                            value={formData.value}
                            onChange={(e) => handleFormChange("value", e.target.value)}
                            style={{ flex: 1, maxWidth: "100%" }}
                          />
                        </div>
                      </div>
                      {valueError && <div className="error-text" style={{ gridColumn: "2" }}>{valueError}</div>}
                    </div>
                  </div>

                  <div className="settings-modal-footer">
                    <button type="button" className="btn-pd-ghost" style={{ flex: 1 }} onClick={closeSubModal}>Cancel</button>
                    <button type="button" className="btn-action-delete" style={{ flex: 1, height: "auto", padding: "0.8rem" }} onClick={openDeleteModal}>Delete</button>
                    <button type="button" className="btn-pd-primary" style={{ flex: 1 }} onClick={handleSave} disabled={!!valueError}>Save Changes</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
