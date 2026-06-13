import React from "react";
import Modal from "../../../components/Modal";

export function StockOutModal({
  isOpen,
  onClose,
  selectedItem,
  batches,
  stockOutForm,
  setStockOutForm,
  stockOutSaving,
  handleStockOutSubmit,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Out"
      size="sm"
      showCloseButton={true}
    >
      {selectedItem && (
        <form onSubmit={handleStockOutSubmit} className="p-1">
          <p className="h5 fw-bold text-dark mb-1">{selectedItem.name}</p>
          <p className="text-muted small mb-3">
            Available stock: <strong className="" style={{ color: "#4A88D9" }}>{batches.reduce((s, b) => s + (b.stock ?? 0), 0)}</strong> units
          </p>
          <div className="alert alert-warning d-flex align-items-start gap-2 py-2 px-3 small border-0 text-warning-emphasis bg-warning-subtle rounded-3 mb-3" role="alert">
            <i className="fa-solid fa-circle-info mt-1 text-warning" aria-hidden="true" />
            <div>
              This will automatically deduct stock from the soonest-expiring batches first.
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold text-secondary small mb-1">Quantity to Deduct *</label>
            <input
              type="number"
              className="form-control form-control-sm"
              style={{ color: "#1f2937" }}
              placeholder="e.g. 10"
              min="1"
              required
              value={stockOutForm.quantity}
              onChange={(e) => setStockOutForm((p) => ({ ...p, quantity: e.target.value }))}
            />
          </div>
          <div className="d-flex gap-2 justify-content-end mt-4">
            <button
              type="submit"
              className="btn btn-warning text-white fw-bold btn-sm px-3"
              disabled={stockOutSaving}
            >
              {stockOutSaving ? "Processing..." : "Confirm Stock Out"}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary fw-semibold btn-sm px-3"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default StockOutModal;
