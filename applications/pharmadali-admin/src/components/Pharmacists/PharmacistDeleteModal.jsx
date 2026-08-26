import React from "react";
import Modal from "../../shared/components/Modal";

export function PharmacistDeleteModal({ isOpen, onClose, onConfirm, isDeleting }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
        <h4 className="fw-bold text-dark mb-2" style={{ fontSize: "1.2rem" }}>Delete pharmacist?</h4>
        <p className="text-muted small mb-4 px-2" style={{ lineHeight: "1.4" }}>
          This action cannot be undone. Are you sure you want to continue?
        </p>
        <div className="d-flex gap-3 w-100 px-2 pb-1">
          <button 
            type="button" 
            className="btn flex-grow-1 text-white rounded-3 py-2 fw-medium border-0 shadow-sm"
            style={{ backgroundColor: "#48aad9", fontSize: "14px" }}
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Continue"}
          </button>
          <button 
            type="button" 
            className="btn flex-grow-1 bg-white rounded-3 py-2 fw-medium shadow-sm"
            style={{ border: "1px solid #48aad9", color: "#48aad9", fontSize: "14px" }}
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default PharmacistDeleteModal;
