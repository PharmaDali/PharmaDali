import { useState } from "react";
import "../../assets/css/settings/common.css";
import "../../assets/css/settings/product-config.css";
import "../../assets/css/settings/overlays.css";

const initialDiscounts = [
  { id: 1, name: "Coupon 5", type: "Amount", value: "300.00" },
  { id: 2, name: "Coupon 10", type: "Amount", value: "600.00" },
  { id: 3, name: "VIP", type: "Percentage", value: "25" },
];

const defaultForm = {
  name: "",
  type: "Amount",
  value: "",
};

export const DiscountOverlay = ({ isOpen, onClose }) => {
  const [discounts, setDiscounts] = useState(initialDiscounts);
  const [modal, setModal] = useState({ type: null, discountId: null });
  const [formData, setFormData] = useState(defaultForm);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [valueError, setValueError] = useState("");

  if (!isOpen) return null;

  const openAddModal = () => {
    setFormData(defaultForm);
    setValueError("");
    setModal({ type: "add", discountId: null });
  };

  const openEditModal = (discount) => {
    setFormData({
      name: discount.name,
      type: discount.type,
      value: discount.value,
    });
    setValueError("");
    setModal({ type: "edit", discountId: discount.id });
  };

  const openDeleteModal = () => {
    setModal((prev) => ({ ...prev, type: "delete" }));
  };

  const closeSubModal = () => {
    setModal({ type: null, discountId: null });
    setIsTypeDropdownOpen(false);
  };

  const handleSave = () => {
    if (!formData.name.trim() || valueError) return;

    if (modal.type === "add") {
      const nextId = Math.max(0, ...discounts.map((d) => d.id)) + 1;
      setDiscounts((prev) => [...prev, { ...formData, id: nextId }]);
    } else if (modal.type === "edit") {
      setDiscounts((prev) =>
        prev.map((d) => (d.id === modal.discountId ? { ...formData, id: d.id } : d))
      );
    }
    closeSubModal();
  };

  const handleDelete = () => {
    setDiscounts((prev) => prev.filter((d) => d.id !== modal.discountId));
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

  const activeDiscount = discounts.find((d) => d.id === modal.discountId);

  return (
    <div className="settings-modal-backdrop" onClick={onClose}>
      <div className="settings-modal" style={{ maxWidth: "680px" }} onClick={(e) => e.stopPropagation()}>
        <div className="settings-panel-header">
          <div>
            <h5 className="settings-panel-title">Discount</h5>
            <p className="settings-panel-subtitle">Add, delete, and update discount.</p>
          </div>
          <div className="settings-panel-actions">
            <button type="button" className="icon-btn-circle" onClick={openAddModal}>+</button>
          </div>
        </div>

        <div className="settings-table-card">
          {discounts.map((discount, index) => (
            <div
              key={discount.id}
              className={`settings-table-row${index === discounts.length - 1 ? " is-last" : ""}`}
              onClick={() => openEditModal(discount)}
            >
              <div className="settings-table-name">
                <p className="settings-table-name-text">{discount.name}</p>
              </div>
              <div className="settings-table-actions">
                <span className="settings-table-value-text">
                  {discount.type === "Amount" ? `Php ${discount.value}` : `${discount.value}%`}
                </span>
              </div>
            </div>
          ))}
          {discounts.length === 0 && (
            <div className="settings-table-empty">No discounts found.</div>
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
                    <h4 className="settings-modal-title" style={{ color: "#333" }}>Delete "{activeDiscount?.name}" ?</h4>
                  </div>
                  <div className="settings-modal-footer" style={{ justifyContent: "center", gap: "2rem" }}>
                    <button type="button" className="btn-pd-ghost" style={{ border: "none" }} onClick={closeSubModal}>Cancel</button>
                    <button type="button" className="btn-pd-ghost" style={{ border: "none" }} onClick={handleDelete}>Delete</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="settings-modal-header">
                    <h4 className="settings-modal-title">{modal.type === "add" ? "Add Discount" : "Update Discount"}</h4>
                    <div className="settings-modal-divider" />
                  </div>

                  <div className="settings-modal-body">
                    <div className="settings-modal-field">
                      <label className="settings-modal-label">Discount Name</label>
                      <input
                        type="text"
                        className="settings-modal-input"
                        placeholder="Coupon Name"
                        value={formData.name}
                        onChange={(e) => handleFormChange("name", e.target.value)}
                      />
                    </div>

                    <div className="settings-modal-field">
                      <label className="settings-modal-label">Discount Value</label>
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
