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
  batchEditSuppliers,
  handleBatchSupplierChange,
  handleSaveAllBatches,
  hasBatchChanges,
  batchSaving,
  showAddBatch,
  setShowAddBatch,
  newBatch,
  setNewBatch,
  handleAddBatchSubmit,
  handleRequestDeleteBatch,
  setShowStockOutModal,
  setStockOutForm,
  inputErrors = {},
  isPharmacist = false,
  categoryOptions = CATEGORY_FILTERS,
  productUpdating = false,
  handleRequestDeleteProduct,
  isDeletingProduct = false,
}) {
  const isMedicine = selectedItem?.product_type === "medicine";
  const fileInputRef = React.useRef(null);
  const today = new Date().toISOString().split("T")[0];

  const activeBatchesCount = React.useMemo(() => {
    return (batches || []).filter((b) => {
      const currentStock = isModalEditing && batchEditStocks?.[b.id] !== undefined
        ? Number(batchEditStocks[b.id])
        : Number(b.stock);
      return (currentStock || 0) > 0;
    }).length;
  }, [batches, isModalEditing, batchEditStocks]);

  const formatBatchStatusLabel = (status) => {
    const raw = String(status || "").trim().toLowerCase();
    if (raw === "normal" || raw === "draft") return "Healthy";
    if (raw === "expiring soon" || raw === "expiring_soon") return "Expiring soon";
    if (raw === "expired") return "Expired";
    return status || "Healthy";
  };

  const getBatchStatusBadgeClass = (status) => {
    const cleanStatus = (status ?? "Healthy").toLowerCase().replace(/\s+/g, "-");
    const statusMap = {
      "expired": "inventory-status-expired",
      "expiring-soon": "inventory-status-expiring-soon",
      "expiring_soon": "inventory-status-expiring-soon",
      "healthy": "inventory-status-healthy",
      "normal": "inventory-status-healthy",
      "draft": "inventory-status-healthy",
    };
    return `inventory-status-chip ${statusMap[cleanStatus] || "inventory-status-healthy"}`;
  };

  const formatMonthYear = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const parts = String(dateStr).split("T")[0].split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString("en-PH", { month: "short", year: "numeric" });
      }
      return new Date(dateStr).toLocaleDateString("en-PH", { month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

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
                className="btn inventory-modal-btn inventory-modal-btn-primary d-flex align-items-center justify-content-center gap-2"
                onClick={handleRequestSave}
                disabled={productUpdating}
              >
                {productUpdating && (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                )}
                {productUpdating ? "Saving..." : "Save Changes"}
              </button>
            )}
          </div>
        ) : null
      }
    >
      {selectedItem && modalDraft && (
        <div className="inventory-modal-body-content">
          {/* Product Image Section */}
          <div className="inventory-modal-section inventory-product-image-section mt-0 pt-0">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h6 className="inventory-modal-section-title mb-0">Product Image</h6>
              {isModalEditing && !isPharmacist && (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm inventory-delete-product-btn d-flex align-items-center gap-1"
                  onClick={() => handleRequestDeleteProduct?.(selectedItem)}
                  disabled={isDeletingProduct}
                  title="Delete Product"
                  aria-label="Delete Product"
                >
                  <i className="fa-solid fa-trash-can" />
                  <span>Delete Product</span>
                </button>
              )}
            </div>
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
                      options={(categoryOptions && categoryOptions.length > 0 ? categoryOptions : CATEGORY_FILTERS).filter((category) => category !== "All")}
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
                      options={(categoryOptions && categoryOptions.length > 0 ? categoryOptions : CATEGORY_FILTERS).filter((category) => category !== "All" && category !== "Generic" && category !== "Branded" && category !== "Unclassified")}
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
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <p className="inventory-modal-label mb-0">Unit Cost</p>
                  {(!modalDraft.unitCost || Number(modalDraft.unitCost) <= 0) && (
                    <span
                      className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                      style={{ fontSize: "10px", padding: "1px 6px" }}
                    >
                      No cost data
                    </span>
                  )}
                </div>
                <input
                  type="number"
                  className="form-control inventory-modal-input"
                  value={modalDraft.unitCost ?? ""}
                  onChange={(event) => handleDraftChange("unitCost", event.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={!isModalEditing}
                />
                {isModalEditing && (!modalDraft.unitCost || Number(modalDraft.unitCost) <= 0) && (
                  <div className="text-warning-emphasis small mt-1" style={{ fontSize: "11px" }}>
                    <i className="fa-solid fa-circle-info me-1" />
                    Enter supplier unit cost to enable real-time profit & margin tracking.
                  </div>
                )}
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
              <div>
                <p className="inventory-modal-label">Make Available</p>
                <SelectDropdown
                  id="edit-product-available"
                  value={modalDraft.isAvailable ? "Available" : "Unavailable"}
                  onChange={(val) => handleDraftChange("isAvailable", val === "Available")}
                  options={[
                    { label: "Available", value: "Available" },
                    { label: "Unavailable", value: "Unavailable" },
                  ]}
                  disabled={!isModalEditing}
                  selectClassName="form-select inventory-modal-input"
                />
              </div>
            </div>
          </div>

          <div className="inventory-modal-section">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <h6 className="inventory-modal-section-title mb-0">Stock Batches</h6>
                <span
                  className="badge rounded-pill px-2.5 py-1 fw-semibold"
                  style={{ backgroundColor: "#e8f0fe", color: "#48aad9", fontSize: "11px" }}
                >
                  {activeBatchesCount} {activeBatchesCount === 1 ? "Batch" : "Batches"}
                </span>
              </div>
              <span className="inventory-batch-total text-muted small">
                Total In Stock: <strong style={{ color: "#48aad9", fontSize: "13.5px" }}>{(batches || []).reduce((s, b) => s + (isModalEditing && batchEditStocks?.[b.id] !== undefined ? (Number(batchEditStocks[b.id]) || 0) : (Number(b.stock) || 0)), 0)}</strong> units
              </span>
            </div>

            {(() => {
              const displayBatches = isModalEditing ? batches : batches.filter((b) => (b.stock ?? 0) > 0);
              return batchLoading ? (
                <div className="inventory-batch-loading py-3 text-center d-flex align-items-center justify-content-center gap-2 text-muted small">
                  <div className="spinner-border spinner-border-sm" style={{ color: "#48aad9" }} role="status" />
                  <span>Loading batches...</span>
                </div>
              ) : displayBatches.length === 0 ? (
                <div className="p-3 text-center border rounded-3 bg-light text-muted small my-2">
                  <i className="fa-solid fa-boxes-stacked me-1.5" style={{ color: "#94a3b8" }}></i>
                  No active batches recorded for this product.
                </div>
              ) : (
                <>
                  {/* Desktop & Tablet View: Table with horizontal scroll support and delete action */}
                  <div className="inventory-batch-table-container d-none d-md-block">
                    <div className="table-responsive">
                      <table className="table inventory-batch-table align-middle mb-0">
                        <thead>
                          <tr>
                            <th style={{ width: isModalEditing && !isPharmacist ? "28%" : "32%", minWidth: "140px" }}>Batch / Supplier</th>
                            <th className="text-center" style={{ width: isModalEditing && !isPharmacist ? "16%" : "16%", minWidth: "75px" }}>Stock</th>
                            <th style={{ width: isModalEditing && !isPharmacist ? "32%" : "34%", minWidth: "150px" }}>Expiration & Mfg</th>
                            <th className="text-center" style={{ width: isModalEditing && !isPharmacist ? "14%" : "18%", minWidth: "85px" }}>Status</th>
                            {isModalEditing && !isPharmacist && (
                              <th className="text-center" style={{ width: "10%", minWidth: "45px" }}>Action</th>
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {displayBatches.map((batch) => (
                            <tr key={batch.id}>
                              <td>
                                <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: "160px" }}>
                                  {batch.batch_number ? (
                                    <span className="batch-num-text">{batch.batch_number}</span>
                                  ) : (
                                    <em className="text-muted small">—</em>
                                  )}
                                  {batch.isDraft && (
                                    <span className="badge bg-secondary-subtle text-secondary rounded-pill ms-1.5" style={{ fontSize: "10px" }}>
                                      Draft
                                    </span>
                                  )}
                                </div>
                                {isModalEditing && !isPharmacist ? (
                                  <input
                                    type="text"
                                    className="form-control form-control-sm inventory-batch-supplier-input mt-1"
                                    placeholder="Supplier name"
                                    value={
                                      batchEditSuppliers?.[batch.id] !== undefined
                                        ? batchEditSuppliers[batch.id]
                                        : (batch.supplier_name || "")
                                    }
                                    onChange={(e) => handleBatchSupplierChange?.(batch.id, e.target.value)}
                                    style={{ fontSize: "11px", padding: "2px 6px", height: "24px", maxWidth: "155px" }}
                                  />
                                ) : (
                                  <div
                                    className="text-muted small text-truncate"
                                    style={{ fontSize: "11px", maxWidth: "160px" }}
                                    title={batch.supplier_name || ""}
                                  >
                                    {batch.supplier_name ? (
                                      <span>{batch.supplier_name}</span>
                                    ) : (
                                      <span className="fst-italic text-muted">No supplier</span>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="text-center">
                                {isModalEditing ? (
                                  <input
                                    type="number"
                                    className="form-control form-control-sm text-center mx-auto inventory-batch-stock-input"
                                    value={batchEditStocks[batch.id] ?? batch.stock}
                                    min="0"
                                    onChange={(e) => handleBatchStockChange(batch.id, e.target.value)}
                                  />
                                ) : (
                                  <div>
                                    <span className="fw-bold text-dark">{batch.stock}</span>
                                    <span className="text-muted ms-1" style={{ fontSize: "11px" }}>units</span>
                                  </div>
                                )}
                              </td>
                              <td>
                                {isModalEditing ? (
                                  <div className="d-flex flex-column gap-1 py-1">
                                    <div className="d-flex align-items-center gap-1">
                                      <span className="text-muted fw-semibold" style={{ fontSize: "10.5px", width: "26px", flexShrink: 0 }}>Exp:</span>
                                      <FormattedDateInput
                                        className="form-control form-control-sm inventory-batch-date-input"
                                        value={batchEditDates?.[batch.id]?.expiry_date !== undefined ? batchEditDates[batch.id].expiry_date : batch.expiry_date}
                                        min={batchEditDates?.[batch.id]?.manufactured_date !== undefined ? batchEditDates[batch.id].manufactured_date : batch.manufactured_date}
                                        onChange={(val) => handleBatchDateChange(batch.id, 'expiry_date', val)}
                                      />
                                    </div>
                                    <div className="d-flex align-items-center gap-1">
                                      <span className="text-muted fw-semibold" style={{ fontSize: "10.5px", width: "26px", flexShrink: 0 }}>Mfg:</span>
                                      <FormattedDateInput
                                        className="form-control form-control-sm inventory-batch-date-input"
                                        value={batchEditDates?.[batch.id]?.manufactured_date !== undefined ? batchEditDates[batch.id].manufactured_date : batch.manufactured_date}
                                        max={today}
                                        onChange={(val) => handleBatchDateChange(batch.id, 'manufactured_date', val)}
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="text-dark" style={{ fontSize: "12px" }}>
                                      <span className="text-muted me-1" style={{ fontSize: "11px" }}>Exp:</span>
                                      <strong className="text-dark">
                                        {formatMonthYear(batch.expiry_date)}
                                      </strong>
                                    </div>
                                    <div className="text-muted" style={{ fontSize: "11px" }}>
                                      <span className="me-1">Mfg:</span>
                                      {formatMonthYear(batch.manufactured_date)}
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="text-center">
                                <span className={getBatchStatusBadgeClass(batch.status)}>
                                  {formatBatchStatusLabel(batch.status)}
                                </span>
                              </td>
                              {isModalEditing && !isPharmacist && (
                                <td className="text-center">
                                  <button
                                    type="button"
                                    className="inventory-batch-delete-btn"
                                    title="Delete Batch"
                                    onClick={() => handleRequestDeleteBatch?.(batch)}
                                  >
                                    <i className="fa-solid fa-trash-can" style={{ fontSize: "11.5px" }}></i>
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Phone View: Touch-friendly cards */}
                  <div className="inventory-batch-mobile-list d-block d-md-none">
                    {displayBatches.map((batch) => {
                      const stockVal = isModalEditing && batchEditStocks?.[batch.id] !== undefined
                        ? batchEditStocks[batch.id]
                        : batch.stock;
                      const supplierVal = isModalEditing && batchEditSuppliers?.[batch.id] !== undefined
                        ? batchEditSuppliers[batch.id]
                        : (batch.supplier_name || "");
                      const expVal = isModalEditing && batchEditDates?.[batch.id]?.expiry_date !== undefined
                        ? batchEditDates[batch.id].expiry_date
                        : batch.expiry_date;
                      const mfgVal = isModalEditing && batchEditDates?.[batch.id]?.manufactured_date !== undefined
                        ? batchEditDates[batch.id].manufactured_date
                        : batch.manufactured_date;

                      return (
                        <div key={batch.id} className="inventory-batch-mobile-card">
                          {/* Top Row: Batch # + Badges + Delete Button */}
                          <div className="d-flex align-items-center justify-content-between pb-2 mb-2 border-bottom">
                            <div className="d-flex align-items-center gap-2 flex-wrap">
                              <span className="fw-bold text-dark" style={{ fontSize: "13px" }}>
                                {batch.batch_number ? `#${batch.batch_number}` : "No Batch #"}
                              </span>
                              {batch.isDraft && (
                                <span className="badge bg-secondary-subtle text-secondary rounded-pill" style={{ fontSize: "10px" }}>
                                  Draft
                                </span>
                              )}
                              <span className={getBatchStatusBadgeClass(batch.status)}>
                                {formatBatchStatusLabel(batch.status)}
                              </span>
                            </div>

                            {isModalEditing && !isPharmacist && (
                              <button
                                type="button"
                                className="inventory-batch-delete-btn ms-auto"
                                title="Delete Batch"
                                onClick={() => handleRequestDeleteBatch?.(batch)}
                              >
                                <i className="fa-solid fa-trash-can" style={{ fontSize: "11.5px" }}></i>
                              </button>
                            )}
                          </div>

                          {/* Data Row 1: Stock & Supplier */}
                          <div className="row g-2 mb-2">
                            <div className="col-5">
                              <span className="text-muted fw-semibold d-block mb-1" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                                Stock
                              </span>
                              {isModalEditing ? (
                                <input
                                  type="number"
                                  className="form-control form-control-sm text-center"
                                  value={stockVal}
                                  min="0"
                                  onChange={(e) => handleBatchStockChange(batch.id, e.target.value)}
                                  style={{ fontSize: "13px", height: "34px" }}
                                />
                              ) : (
                                <div className="fw-bold text-dark" style={{ fontSize: "13px" }}>
                                  {batch.stock} <span className="text-muted fw-normal small">units</span>
                                </div>
                              )}
                            </div>
                            <div className="col-7">
                              <span className="text-muted fw-semibold d-block mb-1" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                                Supplier
                              </span>
                              {isModalEditing && !isPharmacist ? (
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Supplier name"
                                  value={supplierVal}
                                  onChange={(e) => handleBatchSupplierChange?.(batch.id, e.target.value)}
                                  style={{ fontSize: "12px", height: "34px" }}
                                />
                              ) : (
                                <div className="text-truncate text-dark pt-1" style={{ fontSize: "12.5px" }} title={batch.supplier_name || ""}>
                                  {batch.supplier_name || <em className="text-muted small">No supplier</em>}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Data Row 2: Dates */}
                          <div className="row g-2 pt-1 border-top">
                            <div className="col-6">
                              <span className="text-muted fw-semibold d-block mb-1" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                                Mfg Date
                              </span>
                              {isModalEditing ? (
                                <FormattedDateInput
                                  className="form-control form-control-sm w-100"
                                  value={mfgVal}
                                  max={today}
                                  onChange={(val) => handleBatchDateChange(batch.id, 'manufactured_date', val)}
                                  style={{ fontSize: "12px", height: "34px" }}
                                />
                              ) : (
                                <span className="text-dark small" style={{ fontSize: "12px" }}>
                                  {formatMonthYear(batch.manufactured_date)}
                                </span>
                              )}
                            </div>
                            <div className="col-6">
                              <span className="text-muted fw-semibold d-block mb-1" style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                                Exp Date
                              </span>
                              {isModalEditing ? (
                                <FormattedDateInput
                                  className="form-control form-control-sm w-100"
                                  value={expVal}
                                  min={mfgVal || undefined}
                                  onChange={(val) => handleBatchDateChange(batch.id, 'expiry_date', val)}
                                  style={{ fontSize: "12px", height: "34px" }}
                                />
                              ) : (
                                <strong className="text-dark small" style={{ fontSize: "12px" }}>
                                  {formatMonthYear(batch.expiry_date)}
                                </strong>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            {isModalEditing && !isPharmacist && (
              <div className="inventory-batch-add-area">                
                {!showAddBatch ? (
                  <button
                    type="button"
                    className="inventory-batch-add-trigger w-100 d-flex align-items-center justify-content-center gap-2 py-2"
                    onClick={() => setShowAddBatch(true)}
                  >
                    <i className="fa-solid fa-plus-circle"></i> Add New Batch
                  </button>
                ) : (
                  <form onSubmit={handleAddBatchSubmit} className="inventory-batch-add-form mt-2 p-3">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fw-bold mb-0" style={{ color: "#48aad9", fontSize: "13.5px" }}>
                        <i className="fa-solid fa-boxes-stacked me-1.5"></i> New Batch Details
                      </h6>
                      <button
                        type="button"
                        className="btn-close shadow-none"
                        style={{ fontSize: "10px" }}
                        onClick={() => {
                          setShowAddBatch(false);
                          setNewBatch({
                            batch_number: "",
                            supplier_name: "",
                            stock: "",
                            expiry_date: "",
                            manufactured_date: "",
                          });
                        }}
                      />
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-12 col-sm-6">
                        <label className="inventory-modal-label mb-1">Batch No.</label>
                        <input
                          type="text"
                          className="form-control form-control-sm inventory-modal-input"
                          placeholder="e.g. LOT-2024-001"
                          value={newBatch.batch_number}
                          onChange={(e) =>
                            setNewBatch((p) => ({ ...p, batch_number: e.target.value }))
                          }
                        />
                      </div>
                      <div className="col-12 col-sm-6">
                        <label className="inventory-modal-label mb-1">
                          Supplier Name <span className="text-muted fw-normal" style={{ textTransform: "none" }}>(Optional)</span>
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm inventory-modal-input"
                          placeholder="e.g. Unilab"
                          value={newBatch.supplier_name || ""}
                          onChange={(e) =>
                            setNewBatch((p) => ({ ...p, supplier_name: e.target.value }))
                          }
                        />
                      </div>
                      <div className="col-12 col-sm-4">
                        <label className="inventory-modal-label mb-1">Stock *</label>
                        <input
                          type="number"
                          className={`form-control form-control-sm inventory-modal-input ${inputErrors.newBatchStock ? 'is-invalid' : ''}`}
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
                      <div className="col-12 col-sm-4">
                        <label className="inventory-modal-label mb-1">Manufactured Date</label>
                        <FormattedDateInput
                          className={`form-control form-control-sm inventory-modal-input ${inputErrors.newBatchManufacturedDate ? 'is-invalid' : ''}`}
                          value={newBatch.manufactured_date}
                          max={today}
                          onChange={(val) =>
                            setNewBatch((p) => ({ ...p, manufactured_date: val }))
                          }
                        />
                        {inputErrors.newBatchManufacturedDate && <span style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px", display: "block" }}>{inputErrors.newBatchManufacturedDate}</span>}
                      </div>
                      <div className="col-12 col-sm-4">
                        <label className="inventory-modal-label mb-1">Expiry Date</label>
                        <FormattedDateInput
                          className={`form-control form-control-sm inventory-modal-input ${inputErrors.newBatchExpiryDate ? 'is-invalid' : ''}`}
                          value={newBatch.expiry_date}
                          min={newBatch.manufactured_date || undefined}
                          onChange={(val) =>
                            setNewBatch((p) => ({ ...p, expiry_date: val }))
                          }
                        />
                        {inputErrors.newBatchExpiryDate && <span style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px", display: "block" }}>{inputErrors.newBatchExpiryDate}</span>}
                      </div>
                    </div>
                    <div className="inventory-batch-add-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-light border px-3 rounded-2"
                        onClick={() => {
                          setShowAddBatch(false);
                          setNewBatch({
                            batch_number: "",
                            supplier_name: "",
                            stock: "",
                            expiry_date: "",
                            manufactured_date: "",
                          });
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inventory-batch-confirm-btn"
                        disabled={batchSaving || Object.keys(inputErrors).length > 0}
                      >
                        {batchSaving ? (
                          <><span className="spinner-border spinner-border-sm me-1" /> Adding...</>
                        ) : (
                          <><i className="fa-solid fa-plus me-1"></i> Add Batch</>
                        )}
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
