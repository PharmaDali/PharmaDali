import React from "react";
import { getAvatarColor, getAvatarInitials } from "../../hooks/usePharmacists";

export function PharmacistDetailsModal({
  isOpen,
  onClose,
  pharmacist,
  onEdit,
  onDelete,
}) {
  if (!isOpen || !pharmacist) return null;

  return (
    <div className="pharmacists-modal-overlay" onClick={onClose}>
      <div className="pharmacists-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pharmacists-modal-header">
          <h5 className="pharmacists-modal-title">View pharmacist information</h5>
          <button
            type="button"
            className="pharmacists-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <div className="pharmacists-details-content">
          <div className="pharmacists-avatar-section">
            <div
              className="pharmacists-avatar"
              style={{ backgroundColor: getAvatarColor(pharmacist.date_of_birth) }}
            >
              {getAvatarInitials(`${pharmacist.first_name} ${pharmacist.last_name}`)}
            </div>
          </div>

          <div className="pharmacists-details-row">
            <div className="pharmacists-details-group">
              <label className="pharmacists-details-label">First name</label>
              <p className="pharmacists-details-value">{pharmacist.first_name}</p>
            </div>
            <div className="pharmacists-details-group">
              <label className="pharmacists-details-label">Last name</label>
              <p className="pharmacists-details-value">{pharmacist.last_name}</p>
            </div>
          </div>

          <div className="pharmacists-details-row pharmacists-details-row-single">
            <div className="pharmacists-details-group">
              <label className="pharmacists-details-label">Email</label>
              <p className="pharmacists-details-value">{pharmacist.email}</p>
            </div>
          </div>

          <div className="pharmacists-details-row">
            <div className="pharmacists-details-group">
              <label className="pharmacists-details-label">Mobile number</label>
              <p className="pharmacists-details-value">{pharmacist.mobile_number}</p>
            </div>
            <div className="pharmacists-details-group">
              <label className="pharmacists-details-label">Status</label>
              <p className="pharmacists-details-value">
                <span className={`pharmacists-status-badge pharmacists-status-${pharmacist.is_active ? "active" : "inactive"}`}>
                  {pharmacist.is_active ? "Active" : "Inactive"}
                </span>
              </p>
            </div>
          </div>

          <div className="pharmacists-details-row pharmacists-details-row-single">
            <div className="pharmacists-details-group">
              <label className="pharmacists-details-label">License number</label>
              <p className="pharmacists-details-value">
                {pharmacist.pharmacist?.license_number || "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="pharmacists-details-footer">
          <button
            type="button"
            className="btn pharmacists-btn-outline"
            onClick={() => {
              onEdit(pharmacist);
              onClose();
            }}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn pharmacists-btn-save"
            onClick={() => {
              onDelete(pharmacist.id);
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default PharmacistDetailsModal;
