import React from "react";
import Modal from "../../shared/components/Modal";

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  messageLines,
  confirmText = "Delete All",
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      className="delete-confirm-modal p-0"
    >
      <style>{`
        /* Fluid typography and nowrap to keep layout identical across screen sizes */
        .delete-confirm-modal {
          width: fit-content !important;
          max-width: 95vw !important;
          margin: 0 auto;
        }
        .delete-confirm-icon {
          width: min(12vw, 44px);
          height: min(12vw, 44px);
          border: 2.5px solid #ff4d4f;
          font-size: min(4vw, 1.5rem);
        }
        .delete-confirm-title {
          font-size: min(5vw, 1.1rem);
          white-space: nowrap;
        }
        .delete-confirm-text {
          font-size: min(3.5vw, 0.8rem);
          padding: 0 4px;
          white-space: nowrap;
        }
        .delete-confirm-btn {
          border-radius: 8px;
          padding: 8px 10px;
          font-size: min(3.8vw, 0.85rem);
        }
        
        /* Tablet & Desktop */
        @media (min-width: 768px) {
          .delete-confirm-modal {
            min-width: 400px;
            max-width: 450px !important;
          }
          .delete-confirm-icon {
            width: 64px;
            height: 64px;
            border: 3px solid #ff4d4f;
            font-size: 2rem;
            margin-bottom: 20px !important;
          }
          .delete-confirm-title {
            font-size: 1.35rem;
            margin-bottom: 12px !important;
          }
          .delete-confirm-text {
            font-size: 0.95rem;
            line-height: 1.5 !important;
            padding: 0;
            margin-bottom: 24px !important;
          }
          .delete-confirm-btn {
            border-radius: 10px;
            padding: 10px 16px;
            font-size: 0.95rem;
          }
        }
      `}</style>
      <div className="d-flex flex-column align-items-center text-center p-3 p-md-4">
        {/* Custom Hollow Exclamation Circle Icon */}
        <div
          className="delete-confirm-icon d-flex justify-content-center align-items-center mb-2"
          style={{
            borderRadius: "50%",
            color: "#ff4d4f",
            fontWeight: "700",
            fontFamily: "Arial, sans-serif"
          }}
        >
          !
        </div>

        <h4 className="delete-confirm-title fw-bold mb-2" style={{ color: "#ff4d4f" }}>
          {title}
        </h4>
        
        <p className="delete-confirm-text mb-3" style={{ color: "#475569", lineHeight: "1.5" }}>
          {messageLines.map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              {idx < messageLines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>

        <div className="d-flex gap-2 gap-md-3 w-100 mt-1">
          <button
            className="delete-confirm-btn btn border-0 fw-semibold flex-grow-1"
            style={{ backgroundColor: "#e2e8f0", color: "#334155" }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="delete-confirm-btn btn btn-danger fw-semibold flex-grow-1"
            style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteConfirmationModal;
