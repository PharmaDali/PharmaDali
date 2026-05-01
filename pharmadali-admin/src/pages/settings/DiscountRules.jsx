import { useState } from "react";
import "../../assets/css/settings.css";
import infoIcon from "../../assets/icons/modal-icons/info.svg";
import Modal from "../../components/Modal";

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
  const [modal, setModal] = useState({ type: null, discountId: null, subType: null });
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

  const openDeleteModal = (discount) => {
    setModal({ type: "delete", discountId: discount.id });
  };

  const closeSubModal = () => {
    setModal({ type: null, discountId: null });
    setIsTypeDropdownOpen(false);
  };

  const handleSave = () => {
    if (!formData.name.trim() || valueError) return;
    setModal((prev) => ({ ...prev, subType: prev.type, type: "confirm" }));
  };

  const handleFinalSave = () => {
    if (modal.subType === "add") {
      const nextId = Math.max(0, ...discounts.map((d) => d.id)) + 1;
      setDiscounts((prev) => [...prev, { ...formData, id: nextId }]);
    } else if (modal.subType === "edit") {
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
      <div className="settings-modal" style={{ maxWidth: "680px", minHeight: "550px", display: "flex", flexDirection: "column" }} onClick={(e) => e.stopPropagation()}>
        <div className="settings-panel-header">
          <div>
            <h5 className="settings-panel-title">Discount</h5>
            <p className="settings-panel-subtitle">Add, delete, and update discount.</p>
          </div>
          <div className="settings-panel-actions">
            <button type="button" className="icon-btn-circle" onClick={openAddModal}>+</button>
          </div>
        </div>

        <div className="settings-table-card" style={{ flex: 1, marginBottom: "1rem" }}>
          {discounts.map((discount, index) => (
            <div
              key={discount.id}
              className={`settings-table-row${index === discounts.length - 1 ? " is-last" : ""}`}
              onClick={() => openEditModal(discount)}
            >
              <div className="settings-table-name">
                <p className="settings-table-name-text">{discount.name}</p>
              </div>
              <div className="settings-table-actions" style={{ gap: "1.5rem" }}>
                <span className="settings-table-value-text">
                  {discount.type === "Amount" ? `Php ${discount.value}` : `${discount.value}%`}
                </span>
                <button
                  type="button"
                  className="settings-action-btn--delete"
                  style={{ background: "transparent", border: "none", padding: "4px" }}
                  onClick={(e) => { e.stopPropagation(); openDeleteModal(discount); }}
                >
                  <i className="fa-regular fa-trash-can" style={{ fontSize: "1.1rem" }}></i>
                </button>
              </div>
            </div>
          ))}
          {discounts.length === 0 && (
            <div className="settings-table-empty">No discounts found.</div>
          )}
        </div>

        {modal.type && modal.type !== "confirm" && (
          <div className="settings-modal-backdrop" style={{ zIndex: 3000, background: "rgba(0,0,0,0.4)" }} onClick={closeSubModal}>
            <div
              className={`settings-modal${modal.type === "delete" ? " settings-modal--confirm" : ""}`}
              style={{
                maxWidth: modal.type === "delete" ? "400px" : "550px",
                minHeight: modal.type === "delete" ? "auto" : "400px",
                display: "flex",
                flexDirection: "column"
              }}
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

                  <div className="settings-modal-body" style={{ flex: 1 }}>
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
                      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <div className="pd-dropdown-container" style={{ width: "160px" }}>
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

                  <div className="settings-modal-footer" style={{ gap: "1rem" }}>
                    <button type="button" className="btn-pd-ghost" style={{ flex: 1 }} onClick={closeSubModal}>Cancel</button>
                    <button type="button" className="btn-pd-primary" style={{ flex: 1 }} onClick={handleSave} disabled={!!valueError}>
                      {modal.type === "add" ? "Add discount" : "Save Changes"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <Modal
          isOpen={modal.type === "confirm"}
          onClose={() => setModal(prev => ({ ...prev, type: prev.subType, subType: null }))}
          size="sm"
          showCloseButton={false}
          className="pos-confirm-modal"
        >
          <div className="pos-confirm-content">
            <img src={infoIcon} alt="info" className="pos-confirm-icon" style={{ width: "80px", height: "80px" }} />
            <h3 className="pos-confirm-title">Confirm Changes?</h3>
            <p className="pos-confirm-text">
              Changes will be reflected in the mobile app<br />after you save
            </p>
            <div className="pos-confirm-actions">
              <button type="button" className="pos-confirm-primary" style={{ flex: 1 }} onClick={handleFinalSave}>Continue</button>
              <button type="button" className="pos-confirm-secondary" style={{ flex: 1 }} onClick={() => setModal(prev => ({ ...prev, type: prev.subType, subType: null }))}>Cancel</button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
