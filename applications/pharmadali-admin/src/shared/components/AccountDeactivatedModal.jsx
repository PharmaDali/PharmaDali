import React from "react";
import Modal from "./Modal";
import errorIcon from "../../assets/icons/modal-icons/error.svg";

function AccountDeactivatedModal({ isOpen, onClose, message }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlay={false}
      showCloseButton={false}
    >
      <div className="text-center py-3 px-2">
        <div className="mb-3 d-flex justify-content-center mt-2">
          <img
            src={errorIcon}
            alt="Account Deactivated"
            style={{ width: "64px", height: "64px" }}
          />
        </div>

        <div className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-1 rounded-pill mb-2 fw-bold text-uppercase fs-7">
          ACCESS REVOKED
        </div>

        <h4 className="fw-bold mb-2 text-danger">
          Account Deactivated
        </h4>

        <p className="text-muted small mb-4">
          {message ||
            "Your account has been deactivated by the system administrator. Please contact support if you believe this is a mistake."}
        </p>

        <button
          type="button"
          className="btn btn-danger w-100 py-2 fw-semibold"
          onClick={onClose}
          style={{ borderRadius: "8px" }}
          autoFocus
        >
          Understood
        </button>
      </div>
    </Modal>
  );
}

export default AccountDeactivatedModal;
