import React from "react";
import Modal from "../../shared/components/Modal";
import SelectDropdown from "../../shared/components/SelectDropdown";
import { CATEGORY_FILTERS } from "../../constants/inventoryConstants";
import FormattedDateInput from "./FormattedDateInput";

export function ProductDetailsModal({
  selectedItem,
  modalDraft,
  isModalEditing,
  setIsModalEditing,
  handleModalClose,
  handleDraftChange,
  handleImageFileSelect,
  handleRemoveSelectedImage,
  handleRequestSave,
  batches,
  batchLoading,
  batchEditStocks,
  handleBatchStockChange,
  batchEditDates,
  handleBatchDateChange,
  handleSaveAllBatches,
  hasBatchChanges,
  batchSaving,
  showAddBatch,
  setShowAddBatch,
  newBatch,
  setNewBatch,
  handleAddBatchSubmit,
  setShowStockOutModal,
  setStockOutForm,
  inputErrors = {},
  isPharmacist = false,
}) {
  const isMedicine = selectedItem?.product_type === "medicine";
  const fileInputRef = React.useRef(null);
  const today = new Date().toISOString().split("T")[0];

  const displayImage = modalDraft?.imagePreview || modalDraft?.imageUrl || selectedItem?.image_url;

  return (
    <Modal
      isOpen={!!selectedItem}
      onClose={handleModalClose}
      title="Product Details"
      size="md"
      className="inventory-details-modal"
      showCloseButton={true}
      footer={
        !isPharmacist ? (
          <div className={`inventory-modal-actions${isModalEditing ? " is-editing" : ""}`}>
            {!isModalEditing && (
              <>
                <button
                  type="button"
                  className="btn inventory-modal-btn btn-outline-warning"
                  onClick={() => {
                    setStockOutForm({ quantity: "" });
                    setShowStockOutModal(true);
                  }}
                >
                  Stock Out
                </button>
                <button
                  type="button"
                  className="btn inventory-modal-btn inventory-modal-btn-outline"
                  onClick={() => setIsModalEditing(true)}
                >
                  Edit
                </button>
              </>
            )}
            {isModalEditing && (
              <button
                type="button"
                className="btn inventory-modal-btn inventory-modal-btn-primary"
                onClick={handleRequestSave}
                disabled={Object.keys(inputErrors).length > 0}
              >
                Save Changes
              </button>
            )}
          </div>
        ) : null
      }
    >
      {selectedItem && modalDraft && (
        <div className="inventory-modal-body-content">
          {/* Product Image Section */}
          <div className="inventory-modal-section">
            <h6 className="inventory-modal-section-title mb-2">Product Image</h6>
            <div className="d-flex align-items-center gap-3">
              <div
                className={`inventory-image-container ${isModalEditing && !isPharmacist ? "is-editable" : ""}`}
                onClick={() => isModalEditing && !isPharmacist && fileInputRef.current?.click()}
                title={isModalEditing && !isPharmacist ? "Click to change product image" : ""}
              >
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt={modalDraft.name || "Product"}
                    className="inventory-product-img"
                  />
                ) : (
                  <div className="inventory-image-placeholder">
                    <i className="fa-solid fa-pills mb-1 text-secondary" style={{ fontSize: "24px" }} />
                    <span style={{ fontSize: "11px", color: "#6b7280" }}>No Image</span>
                  </div>
                )}

                {isModalEditing && !isPharmacist && (
                  <div className="inventory-image-overlay">
                    <i className="fa-solid fa-camera" />
                  </div>
                )}
              </div>

              <div className="d-flex flex-column gap-1">
                {isModalEditing ? (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="d-none"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageFileSelect(file);
                      }}
                    />
                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm inventory-image-upload-btn rounded-pill px-3 py-1"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <i className="fa-solid fa-cloud-arrow-up me-1" />
                        {displayImage ? "Change Image" : "Upload Image"}
                      </button>

                      {modalDraft.imageFile && (
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-danger text-decoration-none p-0"
                          style={{ fontSize: "12px" }}
                          onClick={handleRemoveSelectedImage}
                        >
                          Undo
                        </button>
                      )}
                    </div>
                    <span className="text-muted" style={{ fontSize: "11px" }}>
                      JPG, PNG, or WebP (Max 5MB)
                    </span>
                    {modalDraft.imageFile && (
                      <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill align-self-start" style={{ fontSize: "11px" }}>
                        New image selected
                      </span>
                    )}
                    {inputErrors.image && (
                      <span className="text-danger" style={{ fontSize: "12px" }}>
                        {inputErrors.image}
                      </span>
                    )}
                  </>
                ) : (
                  <div>
                    <p className="fw-medium mb-0" style={{ fontSize: "13px", color: "#374151" }}>
                      {displayImage ? "Exclusive Pharmacy Image" : "No Product Image Uploaded"}
                    </p>
                    <p className="text-muted mb-0" style={{ fontSize: "11px" }}>
                      {displayImage
                        ? "Click 'Edit' to change or update this product image."
                        : "Click 'Edit' to upload an image for this product."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="inventory-modal-section">
            <h6 className="inventory-modal-section-title">Basic Information</h6>
            <div className="inventory-modal-grid">
              {isMedicine ? (
                <>
                  <div>
                    <p className="inventory-modal-label">Generic Name</p>
                    <input
                      type="text"
                      className={`form-control inventory-modal-input ${inputErrors.name ? 'is-invalid' : ''}`}
                      value={modalDraft.name || ""}
                      onChange={(event) => handleDraftChange("name", event.target.value)}
                      disabled={!isModalEditing}
                    />
                    {inputErrors.name && <span style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px", display: "block" }}>{inputErrors.name}</span>}
                  </div>
                  <div>
                    <p className="inventory-modal-label">Brand Name</p>
                    <input
                      type="text"
                      className="form-control inventory-modal-input"
                      value={modalDraft.brand || ""}
                      onChange={(event) => handleDraftChange("brand", event.target.value)}
                      disabled={!isModalEditing}
                    />
                  </div>
                  <div>
                    <p className="inventory-modal-label">Category</p>
                    <SelectDropdown
                      id="edit-product-category-medicine"
                      value={modalDraft.category || ""}
                      onChange={(val) => handleDraftChange("category", val)}
                      options={CATEGORY_FILTERS.filter((category) => category !== "All")}
                      placeholder="Select Category"
                      disabled={!isModalEditing}
                      selectClassName={`form-select inventory-modal-input ${inputErrors.category ? 'is-invalid' : ''}`}
                    />
                    {inputErrors.category && <span style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px", display: "block" }}>{inputErrors.category}</span>}
                  </div>
                  <div>
                    <p className="inventory-modal-label">Form</p>
                    <input
                      type="text"
                      className="form-control inventory-modal-input"
                      value={modalDraft.form || ""}
                      onChange={(event) => handleDraftChange("form", event.target.value)}
                      disabled={!isModalEditing}
                    />
                  </div>
                  <div>
                    <p className="inventory-modal-label">Dosage</p>
                    <input
                      type="text"
                      className="form-control inventory-modal-input"
                      value={modalDraft.dosage || ""}
                      onChange={(event) => handleDraftChange("dosage", event.target.value)}
                      disabled={!isModalEditing}
                    />
                  </div>
                  <div>
                    <p className="inventory-modal-label">Size</p>
                    <input
                      type="text"
                      className="form-control inventory-modal-input"
                      value={modalDraft.size || ""}
                      onChange={(event) => handleDraftChange("size", event.target.value)}
                      disabled={!isModalEditing}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="inventory-modal-full-width">
                    <p className="inventory-modal-label">Product Name</p>
                    <input
                      type="text"
                      className={`form-control inventory-modal-input ${inputErrors.name ? 'is-invalid' : ''}`}
                      value={modalDraft.name || ""}
                      onChange={(event) => handleDraftChange("name", event.target.value)}
                      disabled={!isModalEditing}
                    />
                    {inputErrors.name && <span style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px", display: "block" }}>{inputErrors.name}</span>}
                  </div>
                  <div>
                    <p className="inventory-modal-label">Category</p>
                    <SelectDropdown
                      id="edit-product-category-nonmedicine"
                      value={modalDraft.category || ""}
                      onChange={(val) => handleDraftChange("category", val)}
                      options={CATEGORY_FILTERS.filter((category) => category !== "All" && category !== "Generic" && category !== "Branded" && category !== "Unclassified")}
                      placeholder="Select Category"
                      disabled={!isModalEditing}
                      selectClassName={`form-select inventory-modal-input ${inputErrors.category ? 'is-invalid' : ''}`}
                    />
                    {inputErrors.category && <span style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px", display: "block" }}>{inputErrors.category}</span>}
                  </div>
                  <div>
                    <p className="inventory-modal-label">Size</p>
                    <input
                      type="text"
                      className="form-control inventory-modal-input"
                      value={modalDraft.size || ""}
                      onChange={(event) => handleDraftChange("size", event.target.value)}
                      disabled={!isModalEditing}
                    />
                  </div>
                </>
              )}
              <div>
                <p className="inventory-modal-label">Needs Prescription</p>
                <SelectDropdown
                  id="edit-product-needs-prescription"
                  value={modalDraft.needsPrescription ? "True" : "False"}
                  onChange={(val) => handleDraftChange("needsPrescription", val === "True")}
                  options={["False", "True"]}
                  disabled={!isModalEditing}
                  selectClassName="form-select inventory-modal-input"
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
                <p className="inventory-modal-label">Unit Cost</p>
                <input
                  type="number"
                  className="form-control inventory-modal-input"
                  value={modalDraft.unitCost ?? ""}
                  onChange={(event) => handleDraftChange("unitCost", event.target.value)}
                  step="0.01"
                  min="0"
                  disabled={!isModalEditing}
                />
              </div>
              <div>
                <p className="inventory-modal-label">Selling Price</p>
                <input
                  type="number"
                  className="form-control inventory-modal-input"
                  value={modalDraft.sellingPrice ?? ""}
                  onChange={(event) => handleDraftChange("sellingPrice", event.target.value)}
                  step="0.01"
                  min="0"
                  disabled={!isModalEditing}
                />
              </div>
              <div>
                <p className="inventory-modal-label">Discountable</p>
                <SelectDropdown
                  id="edit-product-discountable"
                  value={modalDraft.isDiscountable ? "True" : "False"}
                  onChange={(val) => handleDraftChange("isDiscountable", val === "True")}
                  options={["False", "True"]}
                  disabled={!isModalEditing}
                  selectClassName="form-select inventory-modal-input"
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

            {(() => {
              const displayBatches = isModalEditing ? batches : batches.filter((b) => (b.stock ?? 0) > 0);
              return batchLoading ? (
                <div className="inventory-batch-loading">
                  <div className="spinner-border spinner-border-sm" style={{ color: "#1f2937" }} role="status" />
                  <span>Loading batches...</span>
                </div>
              ) : displayBatches.length === 0 ? (
                <p className="inventory-batch-empty">No active batches recorded for this product.</p>
              ) : (
                <div className="inventory-batch-table">
                  <div className="inventory-batch-head">
                    <span>Batch No.</span>
                    <span>Stock</span>
                    <span>Manufactured</span>
                    <span>Expiry Date</span>
                    <span>Status</span>
                  </div>
                  {displayBatches.map((batch) => (
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
                      {isModalEditing ? (
                        <FormattedDateInput
                          className="form-control inventory-batch-date-input"
                          value={batchEditDates?.[batch.id]?.manufactured_date !== undefined ? batchEditDates[batch.id].manufactured_date : batch.manufactured_date}
                          max={today}
                          onChange={(val) => handleBatchDateChange(batch.id, 'manufactured_date', val)}
                        />
                      ) : (
                        batch.manufactured_date
                          ? new Date(batch.manufactured_date).toLocaleDateString("en-PH", {
                            month: "2-digit",
                            year: "numeric",
                          })
                          : "N/A"
                      )}
                    </span>
                    <span>
                      {isModalEditing ? (
                        <FormattedDateInput
                          className="form-control inventory-batch-date-input"
                          value={batchEditDates?.[batch.id]?.expiry_date !== undefined ? batchEditDates[batch.id].expiry_date : batch.expiry_date}
                          min={batchEditDates?.[batch.id]?.manufactured_date !== undefined ? batchEditDates[batch.id].manufactured_date : batch.manufactured_date}
                          onChange={(val) => handleBatchDateChange(batch.id, 'expiry_date', val)}
                        />
                      ) : (
                        batch.expiry_date
                          ? new Date(batch.expiry_date).toLocaleDateString("en-PH", {
                            month: "2-digit",
                            year: "numeric",
                          })
                          : "N/A"
                      )}
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
                  </div>
                ))}
              </div>
            );
          })()}

            {isModalEditing && !isPharmacist && (
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
                          className={`form-control inventory-modal-input ${inputErrors.newBatchStock ? 'is-invalid' : ''}`}
                          placeholder="Quantity"
                          min="0"
                          required
                          value={newBatch.stock}
                          onChange={(e) =>
                            setNewBatch((p) => ({ ...p, stock: e.target.value }))
                          }
                        />
                        {inputErrors.newBatchStock && <span style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px", display: "block" }}>{inputErrors.newBatchStock}</span>}
                      </div>
                      <div>
                        <label className="inventory-modal-label">Expiry Date</label>
                        <FormattedDateInput
                          className={`form-control inventory-modal-input ${inputErrors.newBatchExpiryDate ? 'is-invalid' : ''}`}
                          value={newBatch.expiry_date}
                          min={newBatch.manufactured_date || undefined}
                          onChange={(val) =>
                            setNewBatch((p) => ({ ...p, expiry_date: val }))
                          }
                        />
                        {inputErrors.newBatchExpiryDate && <span style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px", display: "block" }}>{inputErrors.newBatchExpiryDate}</span>}
                      </div>
                      <div>
                        <label className="inventory-modal-label">Manufactured Date</label>
                        <FormattedDateInput
                          className={`form-control inventory-modal-input ${inputErrors.newBatchManufacturedDate ? 'is-invalid' : ''}`}
                          value={newBatch.manufactured_date}
                          max={today}
                          onChange={(val) =>
                            setNewBatch((p) => ({ ...p, manufactured_date: val }))
                          }
                        />
                        {inputErrors.newBatchManufacturedDate && <span style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px", display: "block" }}>{inputErrors.newBatchManufacturedDate}</span>}
                      </div>
                    </div>
                    <div className="inventory-batch-add-actions">
                      <button
                        type="submit"
                        className="inventory-batch-confirm-btn"
                        disabled={batchSaving || Object.keys(inputErrors).length > 0}
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
