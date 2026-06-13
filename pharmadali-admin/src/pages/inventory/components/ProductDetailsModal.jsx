import React from "react";
import Modal from "../../../components/Modal";
import { CATEGORY_FILTERS } from "../inventoryConstants";
import FormattedDateInput from "./FormattedDateInput";

export function ProductDetailsModal({
  selectedItem,
  modalDraft,
  isModalEditing,
  setIsModalEditing,
  handleModalClose,
  handleDraftChange,
  handleRequestSave,
  batches,
  batchLoading,
  batchEditStocks,
  handleBatchStockChange,
  handleSaveBatchStock,
  batchSaving,
  showAddBatch,
  setShowAddBatch,
  newBatch,
  setNewBatch,
  handleAddBatchSubmit,
  setShowStockOutModal,
  setStockOutForm,
}) {
  return (
    <Modal
      isOpen={!!selectedItem}
      onClose={handleModalClose}
      title="Product Details"
      size="md"
      className="inventory-details-modal"
      showCloseButton={true}
      footer={
        <div className={`inventory-modal-actions${isModalEditing ? " is-editing" : ""}`}>
          <button
            type="button"
            className="btn inventory-modal-btn btn-outline-warning"
            onClick={() => {
              setStockOutForm({ quantity: "" });
              setShowStockOutModal(true);
            }}
            disabled={isModalEditing}
          >
            Stock Out
          </button>
          <button
            type="button"
            className="btn inventory-modal-btn inventory-modal-btn-outline"
            onClick={() => setIsModalEditing(true)}
            disabled={isModalEditing}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn inventory-modal-btn inventory-modal-btn-primary"
            onClick={handleRequestSave}
            disabled={!isModalEditing}
          >
            Save Changes
          </button>
        </div>
      }
    >
      {selectedItem && modalDraft && (
        <div className="inventory-modal-body-content">
          <div className="inventory-modal-section">
            <h6 className="inventory-modal-section-title">Basic Information</h6>
            <div className="inventory-modal-grid">
              <div>
                <p className="inventory-modal-label">Generic Name</p>
                <input
                  type="text"
                  className="form-control inventory-modal-input"
                  value={modalDraft.name}
                  onChange={(event) => handleDraftChange("name", event.target.value)}
                  disabled={!isModalEditing}
                />
              </div>
              <div>
                <p className="inventory-modal-label">Brand Name</p>
                <input
                  type="text"
                  className="form-control inventory-modal-input"
                  value={modalDraft.brand}
                  onChange={(event) => handleDraftChange("brand", event.target.value)}
                  disabled={!isModalEditing}
                />
              </div>
              <div>
                <p className="inventory-modal-label">Category</p>
                <select
                  className="form-select inventory-modal-input"
                  value={modalDraft.category}
                  onChange={(event) => handleDraftChange("category", event.target.value)}
                  disabled={!isModalEditing}
                >
                  {CATEGORY_FILTERS.filter((category) => category !== "All").map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="inventory-modal-label">Form</p>
                <input
                  type="text"
                  className="form-control inventory-modal-input"
                  value={modalDraft.form}
                  onChange={(event) => handleDraftChange("form", event.target.value)}
                  disabled={!isModalEditing}
                />
              </div>
            </div>
          </div>

          <div className="inventory-modal-section">
            <h6 className="inventory-modal-section-title">Inventory Data</h6>
            <div className="inventory-modal-grid">
              <div>
                <p className="inventory-modal-label">Barcode</p>
                <input
                  type="text"
                  className="form-control inventory-modal-input"
                  value={modalDraft.id}
                  onChange={(event) => handleDraftChange("id", event.target.value)}
                  disabled={!isModalEditing}
                />
              </div>
              <div>
                <p className="inventory-modal-label">Needs Prescription</p>
                <select
                  className="form-select inventory-modal-input"
                  value={modalDraft.needsPrescription ? "true" : "false"}
                  onChange={(event) =>
                    handleDraftChange("needsPrescription", event.target.value === "true")
                  }
                  disabled={!isModalEditing}
                >
                  <option value="false">False</option>
                  <option value="true">True</option>
                </select>
              </div>
              <div>
                <p className="inventory-modal-label">Expiry Date</p>
                <FormattedDateInput
                  className="form-control inventory-modal-input"
                  value={modalDraft.expiryDate}
                  onChange={(val) => handleDraftChange("expiryDate", val)}
                  disabled={!isModalEditing}
                />
              </div>
              <div>
                <p className="inventory-modal-label">Selling Cost</p>
                <input
                  type="number"
                  className="form-control inventory-modal-input"
                  value={modalDraft.sellingPrice}
                  onChange={(event) => handleDraftChange("sellingPrice", event.target.value)}
                  step="0.01"
                  min="0"
                  disabled={!isModalEditing}
                />
              </div>
              <div>
                <p className="inventory-modal-label">Dosage/Size</p>
                <input
                  type="text"
                  className="form-control inventory-modal-input"
                  value={modalDraft.form}
                  onChange={(event) => handleDraftChange("form", event.target.value)}
                  disabled={!isModalEditing}
                />
              </div>
            </div>
          </div>

          <div className="inventory-modal-section">
            <div className="inventory-batch-section-header">
              <h6 className="inventory-modal-section-title mb-0">Stock Batches</h6>
              <span className="inventory-batch-total">
                Total: <strong>{batches.reduce((s, b) => s + (b.stock ?? 0), 0)}</strong> units
              </span>
            </div>

            {batchLoading ? (
              <div className="inventory-batch-loading">
                <div className="spinner-border spinner-border-sm" style={{ color: "#1f2937" }} role="status" />
                <span>Loading batches...</span>
              </div>
            ) : batches.length === 0 ? (
              <p className="inventory-batch-empty">No batches recorded for this product.</p>
            ) : (
              <div className="inventory-batch-table">
                <div className="inventory-batch-head">
                  <span>Batch No.</span>
                  <span>Stock</span>
                  <span>Expiry Date</span>
                  <span>Status</span>
                  {isModalEditing && <span></span>}
                </div>
                {batches.map((batch) => (
                  <div key={batch.id} className="inventory-batch-row">
                    <span className="inventory-batch-num">
                      {batch.batch_number || <em className="text-muted">—</em>}
                    </span>
                    <span>
                      {isModalEditing ? (
                        <input
                          type="number"
                          className="form-control inventory-batch-stock-input"
                          value={batchEditStocks[batch.id] ?? batch.stock}
                          min="0"
                          onChange={(e) => handleBatchStockChange(batch.id, e.target.value)}
                        />
                      ) : (
                        <span>{batch.stock}</span>
                      )}
                    </span>
                    <span>
                      {batch.expiry_date
                        ? new Date(batch.expiry_date).toLocaleDateString("en-PH", {
                          month: "2-digit",
                          year: "numeric",
                        })
                        : "N/A"}
                    </span>
                    <span>
                      <span
                        className={`inventory-status-chip inventory-status-${(
                          batch.status ?? "normal"
                        )
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {batch.status ?? "Normal"}
                      </span>
                    </span>
                    {isModalEditing && (
                      <span>
                        <button
                          type="button"
                          className="inventory-batch-save-btn"
                          disabled={batchSaving}
                          onClick={() => handleSaveBatchStock(batch)}
                        >
                          Save
                        </button>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isModalEditing && (
              <div className="inventory-batch-add-area">
                {!showAddBatch ? (
                  <button
                    type="button"
                    className="inventory-batch-add-trigger"
                    onClick={() => setShowAddBatch(true)}
                  >
                    + Add Batch
                  </button>
                ) : (
                  <form onSubmit={handleAddBatchSubmit} className="inventory-batch-add-form">
                    <p className="inventory-batch-add-title">New Batch</p>
                    <div className="inventory-batch-add-grid">
                      <div>
                        <label className="inventory-modal-label">Batch No.</label>
                        <input
                          type="text"
                          className="form-control inventory-modal-input"
                          placeholder="e.g. LOT-2024-001"
                          value={newBatch.batch_number}
                          onChange={(e) =>
                            setNewBatch((p) => ({ ...p, batch_number: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="inventory-modal-label">Stock *</label>
                        <input
                          type="number"
                          className="form-control inventory-modal-input"
                          placeholder="Quantity"
                          min="0"
                          required
                          value={newBatch.stock}
                          onChange={(e) =>
                            setNewBatch((p) => ({ ...p, stock: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="inventory-modal-label">Expiry Date</label>
                        <FormattedDateInput
                          className="form-control inventory-modal-input"
                          value={newBatch.expiry_date}
                          onChange={(val) =>
                            setNewBatch((p) => ({ ...p, expiry_date: val }))
                          }
                        />
                      </div>
                      <div>
                        <label className="inventory-modal-label">Manufactured Date</label>
                        <FormattedDateInput
                          className="form-control inventory-modal-input"
                          value={newBatch.manufactured_date}
                          onChange={(val) =>
                            setNewBatch((p) => ({ ...p, manufactured_date: val }))
                          }
                        />
                      </div>
                    </div>
                    <div className="inventory-batch-add-actions">
                      <button
                        type="submit"
                        className="inventory-batch-confirm-btn"
                        disabled={batchSaving}
                      >
                        {batchSaving ? "Adding..." : "Add Batch"}
                      </button>
                      <button
                        type="button"
                        className="inventory-batch-cancel-btn"
                        onClick={() => {
                          setShowAddBatch(false);
                          setNewBatch({
                            batch_number: "",
                            stock: "",
                            expiry_date: "",
                            manufactured_date: "",
                          });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

export default ProductDetailsModal;
