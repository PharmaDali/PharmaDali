import React from "react";
import Modal from "../../shared/components/Modal";

export function BatchDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  batch,
  productName,
  isDeleting = false,
}) {
  if (!batch) return null;

  const batchNumber = batch.batch_number || "No Batch Number";
  const stockCount = batch.stock ?? 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      className="delete-confirm-modal p-0"
    >
      <div className="d-flex flex-column align-items-center text-center p-3 p-md-4">
        {/* Warning Icon */}
        <div
          className="d-flex justify-content-center align-items-center mb-3 mt-1"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "#fff1f0",
            border: "2.5px solid #ff4d4f",
            color: "#ff4d4f",
            fontSize: "22px",
          }}
        >
          <i className="fa-solid fa-triangle-exclamation" />
        </div>

        <h4 className="fw-bold mb-2 text-dark" style={{ fontSize: "1.2rem" }}>
          Delete Stock Batch?
        </h4>

        <p className="text-muted small mb-3 px-2" style={{ lineHeight: "1.5" }}>
          Are you sure you want to delete batch{" "}
          <strong className="text-dark">#{batchNumber}</strong>
          {productName ? (
            <>
              {" "}for <strong className="text-dark">{productName}</strong>
            </>
          ) : null}
          ?
          <br />
          <span className="text-danger fw-medium d-inline-block mt-1">
            {stockCount} {stockCount === 1 ? "unit" : "units"} will be deducted from the total product stock.
          </span>
          <br />
          <span className="text-muted" style={{ fontSize: "11px" }}>
            This action cannot be undone.
          </span>
        </p>

        <div className="d-flex gap-2 w-100 mt-2 px-1">
          <button
            type="button"
            className="btn btn-light border fw-semibold flex-grow-1 py-2"
            onClick={onClose}
            disabled={isDeleting}
            style={{ borderRadius: "8px", fontSize: "13.5px", color: "#475569" }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger fw-semibold flex-grow-1 py-2"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              backgroundColor: "#ff4d4f",
              borderColor: "#ff4d4f",
              borderRadius: "8px",
              fontSize: "13.5px",
            }}
          >
            {isDeleting ? (
              <div className="d-flex align-items-center justify-content-center gap-1.5">
                <span className="spinner-border spinner-border-sm" role="status" />
                <span>Deleting...</span>
              </div>
            ) : (
              "Delete Batch"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default BatchDeleteModal;

