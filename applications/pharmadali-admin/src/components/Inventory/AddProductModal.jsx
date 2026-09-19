import React from "react";
import Modal from "../../shared/components/Modal";
import SelectDropdown from "../../shared/components/SelectDropdown";
import { CATEGORY_FILTERS } from "../../constants/inventoryConstants";
import FormattedDateInput from "./FormattedDateInput";

export function AddProductModal({
  isOpen,
  onClose,
  addForm,
  setAddForm,
  addProductType,
  setAddProductType,
  handleAddProductSubmit,
  inputErrors = {},
  isAddSubmitting = false,
  setInputErrors = () => {},
  categoryOptions = CATEGORY_FILTERS,
}) {
  const handleFieldChange = (field, value) => {
    setAddForm((prev) => ({ ...prev, [field]: value }));
    if (inputErrors && inputErrors[field] && typeof setInputErrors === "function") {
      setInputErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleTypeChange = (newType) => {
    setAddProductType(newType);
    if (typeof setInputErrors === "function") {
      setInputErrors((prev) => {
        const copy = { ...prev };
        delete copy.categoryName;
        delete copy.genericName;
        delete copy.productName;
        return copy;
      });
    }
    if (
      newType === "non_medicine" &&
      (addForm.categoryName === "Generic" || addForm.categoryName === "Branded")
    ) {
      setAddForm((prev) => ({ ...prev, categoryName: "" }));
    }
  };

  const medicineCategoryOptions = React.useMemo(() => {
    const list = Array.isArray(categoryOptions) && categoryOptions.length > 0 ? categoryOptions : CATEGORY_FILTERS;
    return list.filter((cat) => cat !== "All");
  }, [categoryOptions]);

  const nonMedicineCategoryOptions = React.useMemo(() => {
    const list = Array.isArray(categoryOptions) && categoryOptions.length > 0 ? categoryOptions : CATEGORY_FILTERS;
    return list.filter((cat) => cat !== "All" && cat !== "Generic" && cat !== "Branded" && cat !== "Unclassified");
  }, [categoryOptions]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Product"
      size="md"
      className="add-product-modal"
      showCloseButton={true}
    >
      <form onSubmit={handleAddProductSubmit} className="add-product-modal-body">
        {/* Radio Buttons for Medicine/Non-medicine */}
        <div className="add-product-type-selector">
          <label className="add-product-type-label">
            <input
              type="radio"
              name="product_type"
              value="medicine"
              checked={addProductType === "medicine"}
              onChange={() => handleTypeChange("medicine")}
              disabled={isAddSubmitting}
            />
            Medicine
          </label>
          <label className="add-product-type-label">
            <input
              type="radio"
              name="product_type"
              value="non_medicine"
              checked={addProductType === "non_medicine"}
              onChange={() => handleTypeChange("non_medicine")}
              disabled={isAddSubmitting}
            />
            Non-medicine
          </label>
        </div>

        {/* Basic Information Section */}
        <div className="add-product-section">
          <h6 className="add-product-section-title">Basic Information</h6>
          <div className="add-product-grid">
            {addProductType === "medicine" ? (
              <>
                <div className="add-product-field">
                  <label className="add-product-label">Generic Name</label>
                  <input
                    type="text"
                    className={`add-product-input ${inputErrors.genericName ? "is-invalid" : ""}`}
                    placeholder="Generic Name"
                    value={addForm.genericName}
                    onChange={(e) => handleFieldChange("genericName", e.target.value)}
                    disabled={isAddSubmitting}
                    required
                  />
                  {inputErrors.genericName && (
                    <span style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px", display: "block" }}>
                      {inputErrors.genericName}
                    </span>
                  )}
                </div>
                <div className="add-product-field">
                  <label className="add-product-label">Brand Name</label>
                  <input
                    type="text"
                    className="add-product-input"
                    placeholder="Brand Name"
                    value={addForm.brandName}
                    onChange={(e) => handleFieldChange("brandName", e.target.value)}
                    disabled={isAddSubmitting}
                  />
                </div>
                <div className="add-product-field">
                  <label className="add-product-label">Category</label>
                  <SelectDropdown
                    id="add-product-category-medicine"
                    value={addForm.categoryName}
                    onChange={(val) => handleFieldChange("categoryName", val)}
                    options={medicineCategoryOptions}
                    placeholder="Select Category"
                    disabled={isAddSubmitting}
                    selectClassName={`add-product-select ${inputErrors.categoryName ? "is-invalid" : ""}`}
                  />
                  {inputErrors.categoryName && (
                    <span style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px", display: "block" }}>
                      {inputErrors.categoryName}
                    </span>
                  )}
                </div>
                <div className="add-product-field">
                  <label className="add-product-label">Form</label>
                  <input
                    type="text"
                    className="add-product-input"
                    placeholder="e.g. Capsule, Syrup"
                    value={addForm.form}
                    onChange={(e) => handleFieldChange("form", e.target.value)}
                    disabled={isAddSubmitting}
                  />
                </div>
                <div className="add-product-field">
                  <label className="add-product-label">Dosage</label>
                  <input
                    type="text"
                    className="add-product-input"
                    placeholder="Dosage"
                    value={addForm.dosage}
                    onChange={(e) => handleFieldChange("dosage", e.target.value)}
                    disabled={isAddSubmitting}
                  />
                </div>
                <div className="add-product-field">
                  <label className="add-product-label">Size</label>
                  <input
                    type="text"
                    className="add-product-input"
                    placeholder="Size"
                    value={addForm.size}
                    onChange={(e) => handleFieldChange("size", e.target.value)}
                    disabled={isAddSubmitting}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="add-product-field add-product-full-width">
                  <label className="add-product-label">Product Name</label>
                  <input
                    type="text"
                    className={`add-product-input ${inputErrors.productName ? "is-invalid" : ""}`}
                    placeholder="Product Name"
                    value={addForm.productName}
                    onChange={(e) => handleFieldChange("productName", e.target.value)}
                    disabled={isAddSubmitting}
                    required
                  />
                  {inputErrors.productName && (
                    <span style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px", display: "block" }}>
                      {inputErrors.productName}
                    </span>
                  )}
                </div>
                <div className="add-product-field">
                  <label className="add-product-label">Category</label>
                  <SelectDropdown
                    id="add-product-category-nonmedicine"
                    value={addForm.categoryName}
                    onChange={(val) => handleFieldChange("categoryName", val)}
                    options={nonMedicineCategoryOptions}
                    placeholder="Select Category"
                    disabled={isAddSubmitting}
                    selectClassName={`add-product-select ${inputErrors.categoryName ? "is-invalid" : ""}`}
                  />
                  {inputErrors.categoryName && (
                    <span style={{ color: "#dc3545", fontSize: "12px", marginTop: "4px", display: "block" }}>
                      {inputErrors.categoryName}
                    </span>
                  )}
                </div>
                <div className="add-product-field">
                  <label className="add-product-label">Size</label>
                  <input
                    type="text"
                    className="add-product-input"
                    placeholder="Size"
                    value={addForm.size}
                    onChange={(e) => handleFieldChange("size", e.target.value)}
                    disabled={isAddSubmitting}
                  />
                </div>
              </>
            )}

            <div className="add-product-field">
              <label className="add-product-label">Batch Number</label>
              <input
                type="text"
                className="add-product-input"
                placeholder="Batch Number"
                value={addForm.batchNumber}
                onChange={(e) => handleFieldChange("batchNumber", e.target.value)}
                disabled={isAddSubmitting}
              />
            </div>
            <div className="add-product-field">
              <label className="add-product-label">Expiry Date</label>
              <FormattedDateInput
                className={`add-product-input ${!addForm.expiryDate ? "is-empty" : ""}`}
                value={addForm.expiryDate}
                onChange={(val) => handleFieldChange("expiryDate", val)}
                disabled={isAddSubmitting}
              />
            </div>
            {addProductType === "medicine" && (
              <div className="add-product-field">
                <label className="add-product-label">Needs Prescription</label>
                <SelectDropdown
                  selectClassName="add-product-select"
                  value={addForm.needsPrescription}
                  onChange={(val) => handleFieldChange("needsPrescription", val)}
                  options={[
                    { label: "False", value: "False" },
                    { label: "True", value: "True" },
                  ]}
                  disabled={isAddSubmitting}
                />
              </div>
            )}
          </div>
        </div>

        {/* Transaction Details Section */}
        <div className="add-product-section">
          <h6 className="add-product-section-title">Transaction Details</h6>
          <div className="add-product-grid">
            <div className="add-product-field">
              <label className="add-product-label">Quantity</label>
              <input
                type="number"
                className="add-product-input"
                placeholder="Quantity"
                value={addForm.quantity}
                onChange={(e) => handleFieldChange("quantity", e.target.value)}
                disabled={isAddSubmitting}
              />
            </div>
            <div className="add-product-field">
              <label className="add-product-label">Unit Cost</label>
              <input
                type="number"
                step="0.01"
                className="add-product-input"
                placeholder="Unit Cost"
                value={addForm.unitCost}
                onChange={(e) => handleFieldChange("unitCost", e.target.value)}
                disabled={isAddSubmitting}
              />
            </div>
            <div className="add-product-field">
              <label className="add-product-label">Discountable</label>
              <SelectDropdown
                selectClassName="add-product-select"
                value={addForm.discountable}
                onChange={(val) => handleFieldChange("discountable", val)}
                options={[
                  { label: "False", value: "False" },
                  { label: "True", value: "True" },
                ]}
                disabled={isAddSubmitting}
              />
            </div>
            <div className="add-product-field">
              <label className="add-product-label">Make Available</label>
              <SelectDropdown
                selectClassName="add-product-select"
                value={addForm.isAvailable || "Available"}
                onChange={(val) => handleFieldChange("isAvailable", val)}
                options={[
                  { label: "Available", value: "Available" },
                  { label: "Unavailable", value: "Unavailable" },
                ]}
                disabled={isAddSubmitting}
              />
            </div>
            <div className="add-product-field">
              <label className="add-product-label">Selling Price</label>
              <input
                type="number"
                step="0.01"
                className="add-product-input"
                placeholder="Selling Price"
                value={addForm.sellingPrice}
                onChange={(e) => handleFieldChange("sellingPrice", e.target.value)}
                disabled={isAddSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Other Details Section */}
        <div className="add-product-section">
          <h6 className="add-product-section-title">Other Details</h6>
          <div className="add-product-grid">
            <div className="add-product-field add-product-full-width">
              <label className="add-product-label">Barcode</label>
              <input
                type="text"
                className="add-product-input"
                placeholder="Barcode"
                value={addForm.barcode}
                onChange={(e) => handleFieldChange("barcode", e.target.value)}
                disabled={isAddSubmitting}
              />
            </div>
            <div className="add-product-field add-product-full-width">
              <label className="add-product-label">Product Description</label>
              <textarea
                className="add-product-textarea"
                placeholder="Description here..."
                value={addForm.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                disabled={isAddSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="add-product-footer">
          <button
            type="button"
            className="add-product-btn-cancel"
            onClick={onClose}
            disabled={isAddSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="add-product-btn-add d-flex align-items-center justify-content-center gap-2"
            disabled={isAddSubmitting}
          >
            {isAddSubmitting && (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            )}
            {isAddSubmitting ? "Adding..." : "Add"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddProductModal;
