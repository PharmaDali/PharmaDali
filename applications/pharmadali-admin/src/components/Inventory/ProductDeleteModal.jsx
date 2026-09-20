import React from "react";
import Modal from "../../shared/components/Modal";

const isValidValue = (val) => {
  if (!val) return false;
  const clean = String(val).trim().toLowerCase();
  return !["n/a", "na", "n.a", "n.a.", "n / a", "none", "-", "null", "undefined"].includes(clean);
};

export function ProductDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  product,
  isDeleting = false,
}) {
  if (!product) return null;

  const rawName = product.name || product.product_name || "";
  const productName = [
    rawName,
    isValidValue(product.strength) ? product.strength.trim() : null,
    isValidValue(product.size) ? product.size.trim() : null,
  ].filter(Boolean).join(" ") || "this product";
  const brandName = product.brand || product.brand_name;
  const stockCount = product.quantity ?? product.stock ?? 0;

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
          <i className="fa-solid fa-trash-can" />
        </div>

        <h4 className="fw-bold mb-2 text-dark" style={{ fontSize: "1.2rem" }}>
          Delete Product?
        </h4>

        <p className="text-muted small mb-3 px-2" style={{ lineHeight: "1.5" }}>
          Are you sure you want to delete{" "}
          <strong className="text-dark">
            {productName}
            {brandName ? ` (${brandName})` : ""}
          </strong>
          ?
          <br />
          <span className="text-danger fw-medium d-inline-block mt-2">
            All batch stocks ({stockCount} {stockCount === 1 ? "unit" : "units"}) and records for this product will be permanently deleted.
          </span>
          <br />
          <span className="text-muted mt-1 d-inline-block" style={{ fontSize: "11px" }}>
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
              "Delete Product"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ProductDeleteModal;

