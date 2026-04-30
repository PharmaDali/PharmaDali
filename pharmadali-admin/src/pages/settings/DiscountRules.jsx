import { useState } from "react";
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
  const [modal, setModal] = useState({ type: null, discountId: null });
  const [formData, setFormData] = useState(defaultForm);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);

  if (!isOpen) return null;

  const openAddModal = () => {
    setFormData(defaultForm);
    setModal({ type: "add", discountId: null });
  };

  const openEditModal = (discount) => {
    setFormData({
      name: discount.name,
      type: discount.type,
      value: discount.value,
    });
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
    if (!formData.name.trim()) return;
    
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const activeDiscount = discounts.find((d) => d.id === modal.discountId);

  return (
    <div className="settings-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="settings-modal"
        style={{ maxWidth: "680px", padding: "1.8rem", borderRadius: "16px" }}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Main Discount List Header */}
        <div className="settings-panel-header" style={{ marginBottom: "1.2rem", alignItems: "center" }}>
          <div>
            <h5 className="fw-bold settings-panel-title" style={{ fontSize: "1.25rem", margin: 0 }}>Discount</h5>
            <p className="settings-panel-subtitle" style={{ fontSize: "0.85rem", marginTop: "0.2rem" }}>
              Add, delete, and update discount.
            </p>
          </div>
          <div className="settings-panel-actions">
            <button 
              type="button" 
              className="settings-icon-button" 
              onClick={openAddModal}
              style={{ width: "40px", height: "40px", fontSize: "1.2rem", background: "#48aad9", border: "none" }}
            >
              +
            </button>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #eee", marginBottom: "0.5rem" }} />

        {/* Discount List */}
        <div className="settings-table-card" style={{ border: "none", boxShadow: "none" }}>
          {discounts.map((discount, index) => (
            <div
              key={discount.id}
              className={`settings-table-row${index === discounts.length - 1 ? " is-last" : ""}`}
              onClick={() => openEditModal(discount)}
              style={{ 
                cursor: "pointer", 
                padding: "1rem 0.5rem", 
                borderBottom: "1px solid #eee",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div className="settings-table-name">
                <p className="settings-table-title" style={{ fontSize: "1.1rem", fontWeight: "600", color: "#333" }}>
                  {discount.name}
                </p>
              </div>
              <div className="settings-table-actions">
                <span style={{ fontSize: "1.1rem", fontWeight: "500", color: "#888" }}>
                  {discount.type === "Amount" ? `Php ${discount.value}` : `${discount.value}%`}
                </span>
              </div>
            </div>
          ))}
          {discounts.length === 0 && (
            <div className="settings-table-empty" style={{ padding: "3rem", color: "#999" }}>
              No discounts found.
            </div>
          )}
        </div>

        {/* Sub-modals for Add/Edit/Delete */}
        {modal.type && (
          <div className="settings-modal-backdrop" style={{ zIndex: 3000, background: "rgba(0,0,0,0.4)" }} role="presentation" onClick={closeSubModal}>
            <div
              className={`settings-modal${modal.type === "delete" ? " settings-modal--confirm" : ""}`}
              style={{ 
                maxWidth: modal.type === "delete" ? "400px" : "500px",
                borderRadius: "20px",
                padding: modal.type === "delete" ? "1.5rem" : "1.8rem"
              }}
              role="dialog"
              aria-modal="true"
              onClick={(event) => event.stopPropagation()}
            >
              {modal.type === "delete" ? (
                <>
                  <div className="settings-modal-header settings-modal-header--center" style={{ borderBottom: "none", padding: "1rem 0" }}>
                    <h4 className="settings-modal-title" style={{ color: "#333", fontSize: "1.2rem", fontWeight: "600" }}>
                      Delete "{activeDiscount?.name}" ?
                    </h4>
                  </div>
                  <div className="settings-modal-footer settings-modal-footer--center" style={{ marginTop: "1rem", gap: "2rem" }}>
                    <button 
                      type="button" 
                      className="btn btn-link" 
                      onClick={closeSubModal} 
                      style={{ color: "#48aad9", textDecoration: "none", fontWeight: "600", fontSize: "1rem" }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-link" 
                      onClick={handleDelete} 
                      style={{ color: "#48aad9", textDecoration: "none", fontWeight: "600", fontSize: "1rem" }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="settings-modal-header" style={{ borderBottom: "1px solid #eee", marginBottom: "1.5rem", paddingBottom: "0.8rem" }}>
                    <h4 className="settings-modal-title" style={{ color: "#48aad9", fontSize: "1.1rem", fontWeight: "600" }}>
                      {modal.type === "add" ? "Add Discount" : "Update Discount"}
                    </h4>
                  </div>
                  
                  <div className="settings-modal-body" style={{ gap: "1.5rem" }}>
                    {/* Discount Name Field */}
                    <div className="settings-modal-field-row" style={{ gridTemplateColumns: "140px 1fr" }}>
                      <label className="settings-modal-label" style={{ fontSize: "1rem", fontWeight: "600", color: "#333" }}>
                        Discount Name
                      </label>
                      <div className="settings-modal-control">
                        <input
                          type="text"
                          className="settings-modal-input"
                          placeholder="Coupon Name"
                          value={formData.name}
                          onChange={(event) => handleFormChange("name", event.target.value)}
                          style={{ 
                            maxWidth: "100%", 
                            background: "#ededed", 
                            border: "none",
                            padding: "0.75rem 1rem",
                            borderRadius: "12px",
                            fontSize: "1rem"
                          }}
                        />
                      </div>
                    </div>

                    {/* Discount Value Field */}
                    <div className="settings-modal-field-row" style={{ gridTemplateColumns: "140px 1fr" }}>
                      <label className="settings-modal-label" style={{ fontSize: "1rem", fontWeight: "600", color: "#333" }}>
                        Discount Value
                      </label>
                      <div className="settings-modal-control" style={{ gap: "0.8rem", alignItems: "center" }}>
                        {/* Custom Dropdown */}
                        <div style={{ position: "relative", width: "130px" }}>
                          <button
                            type="button"
                            className="settings-modal-input"
                            onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                            style={{ 
                              width: "100%", 
                              textAlign: "left", 
                              display: "flex", 
                              justifyContent: "space-between", 
                              alignItems: "center",
                              background: "#ededed",
                              border: "none",
                              padding: "0.75rem 1rem",
                              borderRadius: "12px",
                              fontSize: "1rem",
                              color: "#777"
                            }}
                          >
                            {formData.type}
                            <span style={{ fontSize: "0.6rem", color: "#777" }}>▼</span>
                          </button>
                          {isTypeDropdownOpen && (
                            <div style={{ 
                              position: "absolute", 
                              top: "100%", 
                              left: 0, 
                              right: 0, 
                              background: "#999", 
                              borderRadius: "12px", 
                              marginTop: "5px", 
                              zIndex: 10, 
                              overflow: "hidden",
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                            }}>
                              <div 
                                onClick={() => { handleFormChange("type", "Amount"); setIsTypeDropdownOpen(false); }} 
                                style={{ padding: "0.8rem 1rem", color: "white", fontSize: "0.9rem", cursor: "pointer" }}
                              >
                                Amount
                              </div>
                              <div style={{ height: "1px", background: "rgba(255,255,255,0.2)" }} />
                              <div 
                                onClick={() => { handleFormChange("type", "Percentage"); setIsTypeDropdownOpen(false); }} 
                                style={{ padding: "0.8rem 1rem", color: "white", fontSize: "0.9rem", cursor: "pointer" }}
                              >
                                Percentage
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Prefix and Value Input */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flex: 1 }}>
                          <span style={{ fontSize: "1rem", color: "#888", minWidth: "35px", textAlign: "right" }}>
                            {formData.type === "Amount" ? "Php" : "%"}
                          </span>
                          <input
                            type="text"
                            className="settings-modal-input"
                            placeholder="Value"
                            value={formData.value}
                            onChange={(event) => handleFormChange("value", event.target.value)}
                            style={{ 
                              flex: 1, 
                              maxWidth: "100%", 
                              background: "#ededed", 
                              border: "none",
                              padding: "0.75rem 1rem",
                              borderRadius: "12px",
                              fontSize: "1rem"
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="settings-modal-footer" style={{ marginTop: "2rem", gap: "1rem" }}>
                    <button 
                      type="button" 
                      className="btn btn-outline-primary" 
                      onClick={closeSubModal} 
                      style={{ 
                        borderRadius: "12px", 
                        borderColor: "#48aad9", 
                        color: "#48aad9",
                        flex: 1,
                        padding: "0.8rem"
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-danger" 
                      onClick={openDeleteModal} 
                      style={{ 
                        borderRadius: "12px", 
                        borderColor: "#ffb3b3", 
                        color: "#ff6b6b",
                        flex: 1,
                        padding: "0.8rem"
                      }}
                    >
                      Delete
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={handleSave} 
                      style={{ 
                        borderRadius: "12px", 
                        background: "#48aad9", 
                        border: "none",
                        flex: 1,
                        padding: "0.8rem"
                      }}
                    >
                      Save Changes
                    </button>
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
