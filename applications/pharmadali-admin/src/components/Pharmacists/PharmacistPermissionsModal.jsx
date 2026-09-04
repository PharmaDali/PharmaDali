import React, { useState, useEffect } from "react";
import Modal from "../../shared/components/Modal";
import { updatePharmacistPermissions } from "../../services/pharmacistService";

const AVAILABLE_PERMISSIONS = [
  {
    key: "access_pos",
    label: "POS Counter",
    description: "Allow processing over-the-counter transactions and printing customer receipts.",
    icon: "fa-solid fa-calculator",
  },
  {
    key: "access_pickup",
    label: "Pickup Orders",
    description: "Allow viewing online pickup orders and completing customer pickups.",
    icon: "fa-solid fa-boxes-packing",
  },
  {
    key: "view_inventory",
    label: "View Inventory Catalog",
    description: "Allow searching and inspecting pharmacy product batches and stock counts.",
    icon: "fa-solid fa-boxes-stacked",
  },
  {
    key: "view_sales_reports",
    label: "Transaction History",
    description: "Allow viewing sales transaction history for orders processed by this pharmacist.",
    icon: "fa-solid fa-receipt",
  },
  {
    key: "process_item_exchange",
    label: "Process Item Exchanges / Returns",
    description: "Allow creating and completing product exchange and item return transactions.",
    icon: "fa-solid fa-arrow-rotate-left",
  },
];

const PRESETS = [
  {
    name: "Full Pharmacist",
    icon: "fa-solid fa-user-shield",
    permissions: ["access_pos", "access_pickup", "view_inventory", "view_sales_reports", "process_item_exchange"],
  },
  {
    name: "POS Cashier",
    icon: "fa-solid fa-cash-register",
    permissions: ["access_pos"],
  },
  {
    name: "Fulfillment Staff",
    icon: "fa-solid fa-truck-ramp-box",
    permissions: ["access_pickup", "view_inventory"],
  },
  {
    name: "Stock Handler",
    icon: "fa-solid fa-box-archive",
    permissions: ["view_inventory"],
  },
];

export default function PharmacistPermissionsModal({ isOpen, onClose, pharmacist, onSuccess }) {
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    if (pharmacist) {
      const existing = pharmacist.pharmacist?.permissions ?? [
        "access_pos",
        "access_pickup",
        "view_inventory",
        "view_sales_reports",
        "process_item_exchange",
      ];
      setSelectedPermissions(existing);
      setError(null);
    }
  }, [pharmacist]);

  if (!isOpen || !pharmacist) return null;

  const handleToggle = (key) => {
    setSelectedPermissions((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key]
    );
  };

  const handleApplyPreset = (presetPerms) => {
    setSelectedPermissions(presetPerms);
  };

  const handleSave = () => {
    setShowConfirmModal(true);
  };

  const executeSave = async () => {
    setShowConfirmModal(false);
    try {
      setIsSaving(true);
      setError(null);
      const res = await updatePharmacistPermissions(pharmacist.id, selectedPermissions);
      if (onSuccess) {
        onSuccess(res.data?.data || res.data || res);
      }
      onClose();
    } catch (err) {
      console.error("Failed to update pharmacist permissions:", err);
      setError(err.response?.data?.message || "Failed to update permissions. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const pharmacistName = `${pharmacist.first_name || ""} ${pharmacist.last_name || ""}`.trim() || "Pharmacist";

  const modalTitle = (
    <div className="permission-modal-header-text">
      <span className="permission-modal-main-title">Staff Permissions</span>
      <span className="permission-modal-user-subtitle">{pharmacistName}</span>
    </div>
  );

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} className="permission-manage-modal" size="md">
        <div className="permission-modal-body-wrap">
          {error && (
            <div className="alert alert-danger d-flex align-items-center gap-2 mb-3 py-2 px-3 small border-0 bg-danger-subtle text-danger-emphasis rounded-3">
              <i className="fa-solid fa-circle-exclamation"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="permission-presets-section mb-3 mb-md-4">
            <label className="permission-presets-label">
              Quick Permission Presets
            </label>
            <div className="permission-presets-grid">
              {PRESETS.map((preset) => {
                const isMatch =
                  preset.permissions.length === selectedPermissions.length &&
                  preset.permissions.every((p) => selectedPermissions.includes(p));

                return (
                  <button
                    key={preset.name}
                    type="button"
                    className={`btn permission-preset-pill ${isMatch ? "active" : ""}`}
                    onClick={() => handleApplyPreset(preset.permissions)}
                  >
                    <i className={`${preset.icon} me-1`}></i>
                    <span>{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="permission-list mb-3 mb-md-4">
            {AVAILABLE_PERMISSIONS.map((perm) => {
              const isChecked = selectedPermissions.includes(perm.key);
              return (
                <div
                  key={perm.key}
                  className={`permission-item ${isChecked ? "permission-item-active" : ""}`}
                  onClick={() => handleToggle(perm.key)}
                >
                  <div className="permission-item-left">
                    <div className={`permission-item-icon ${isChecked ? "active" : ""}`}>
                      <i className={perm.icon}></i>
                    </div>
                    <div className="permission-item-info">
                      <h6 className="permission-item-title">
                        {perm.label}
                      </h6>
                      <p className="permission-item-desc">
                        {perm.description}
                      </p>
                    </div>
                  </div>

                  <div className="form-check form-switch permission-item-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={isChecked}
                      onChange={() => handleToggle(perm.key)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="permission-modal-footer">
            <button type="button" className="btn btn-light permission-btn-cancel" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button
              type="button"
              className="btn text-white permission-btn-save"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-check me-1"></i>
                  Save Permissions
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        showCloseButton={false}
        size="sm"
      >
        <div className="d-flex flex-column align-items-center text-center p-2">
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center mb-3 mt-2" 
            style={{ 
              width: "56px", 
              height: "56px", 
              border: "3px solid #eab308",
              color: "#eab308",
              fontSize: "26px"
            }}
          >
            <i className="fa-solid fa-exclamation"></i>
          </div>
          <h4 className="fw-bold text-dark mb-2" style={{ fontSize: "1.2rem" }}>Save permission changes?</h4>
          <p className="text-muted small mb-4 px-2" style={{ lineHeight: "1.4" }}>
            Are you sure you want to update the permissions for {pharmacistName}?
          </p>
          <div className="d-flex gap-3 w-100 px-2 pb-1">
            <button 
              type="button" 
              className="btn flex-grow-1 text-white rounded-3 py-2 fw-medium border-0 shadow-sm"
              style={{ backgroundColor: "#48aad9", fontSize: "14px" }}
              onClick={executeSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Continue"}
            </button>
            <button 
              type="button" 
              className="btn flex-grow-1 bg-white rounded-3 py-2 fw-medium shadow-sm"
              style={{ border: "1px solid #48aad9", color: "#48aad9", fontSize: "14px" }}
              onClick={() => setShowConfirmModal(false)}
              disabled={isSaving}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
