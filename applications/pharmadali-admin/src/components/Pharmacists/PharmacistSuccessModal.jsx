import React from "react";
import Modal from "../../shared/components/Modal";
import successfulTaskIcon from "../../assets/icons/modal-icons/successful-task.svg";

export function PharmacistSuccessModal({
  isOpen,
  onClose,
  message = "Permissions have been updated successfully.",
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      className="pharmacists-confirm-modal"
    >
      <div className="d-flex flex-column align-items-center text-center p-2">
        <img
          src={successfulTaskIcon}
          alt="Success"
          className="mb-3 mt-2"
          style={{ width: 64, height: 64 }}
        />
        <h4 className="fw-bold text-dark mb-2" style={{ fontSize: "1.2rem" }}>
          Success!
        </h4>
        <p className="text-muted small mb-4 px-2" style={{ lineHeight: "1.4" }}>
          {message}
        </p>
        <div className="d-flex w-100 px-2 pb-1">
          <button
            type="button"
            className="btn flex-grow-1 text-white rounded-3 py-2 fw-medium border-0 shadow-sm"
            style={{ backgroundColor: "#48aad9", fontSize: "14px" }}
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default PharmacistSuccessModal;
