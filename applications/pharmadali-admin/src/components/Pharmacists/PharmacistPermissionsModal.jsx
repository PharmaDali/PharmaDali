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

  const handleSave = async () => {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Permissions: ${pharmacistName}`} maxWidth="650px">
      <div className="p-1">
        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-3 py-2 px-3 small border-0 bg-danger-subtle text-danger-emphasis rounded-3">
            <i className="fa-solid fa-circle-exclamation"></i>
            <span>{error}</span>
          </div>
        )}

        <div className="mb-4">
          <label className="fw-semibold text-muted small uppercase tracking-wider mb-2 d-block">
            Quick Permission Presets
          </label>
          <div className="d-flex flex-wrap gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                className="btn btn-outline-secondary btn-sm rounded-pill d-flex align-items-center gap-1 px-3"
                style={{ fontSize: "0.825rem" }}
                onClick={() => handleApplyPreset(preset.permissions)}
              >
                <i className={`${preset.icon} me-1`}></i>
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="permission-list d-flex flex-column gap-3 mb-4">
          {AVAILABLE_PERMISSIONS.map((perm) => {
            const isChecked = selectedPermissions.includes(perm.key);
            return (
              <div
                key={perm.key}
                className="p-3 rounded-3 border d-flex align-items-start justify-content-between transition-all"
                style={{
                  cursor: "pointer",
                  borderColor: isChecked ? "#96d2ee" : "#e2e8f0",
                  backgroundColor: isChecked ? "#f4f9fd" : "#f8fafc",
                }}
                onClick={() => handleToggle(perm.key)}
              >
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center mt-1"
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: isChecked ? "#2aabe2" : "#e2e8f0",
                      color: isChecked ? "#ffffff" : "#64748b",
                    }}
                  >
                    <i className={perm.icon}></i>
                  </div>
                  <div>
                    <h6 className="fw-semibold mb-1 text-dark" style={{ fontSize: "0.95rem" }}>
                      {perm.label}
                    </h6>
                    <p className="text-muted mb-0 small" style={{ fontSize: "0.825rem" }}>
                      {perm.description}
                    </p>
                  </div>
                </div>

                <div className="form-check form-switch ms-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    checked={isChecked}
                    onChange={() => handleToggle(perm.key)}
                    onClick={(e) => e.stopPropagation()}
                    style={{ cursor: "pointer", width: "2.5em", height: "1.25em" }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top">
          <button type="button" className="btn btn-light px-4" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button
            type="button"
            className="btn text-white px-4 d-flex align-items-center gap-2"
            style={{ backgroundColor: "#2aabe2" }}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                Saving...
              </>
            ) : (
              <>
                <i className="fa-solid fa-check"></i>
                Save Permissions
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
