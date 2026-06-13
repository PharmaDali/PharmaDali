import React from "react";
import Modal from "../../../components/Modal";
import { CATEGORY_FILTERS } from "../inventoryConstants";

export function AddProductModal({
  isOpen,
  onClose,
  addForm,
  setAddForm,
  addProductType,
  setAddProductType,
  handleAddProductSubmit,
}) {
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
              onChange={() => setAddProductType("medicine")}
            />
            Medicine
          </label>
          <label className="add-product-type-label">
            <input
              type="radio"
              name="product_type"
              value="non_medicine"
              checked={addProductType === "non_medicine"}
              onChange={() => setAddProductType("non_medicine")}
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
                    className="add-product-input"
                    placeholder="Generic Name"
                    value={addForm.genericName}
                    onChange={(e) => setAddForm(prev => ({ ...prev, genericName: e.target.value }))}
                    required
                  />
                </div>
                <div className="add-product-field">
                  <label className="add-product-label">Brand Name</label>
                  <input
                    type="text"
                    className="add-product-input"
                    placeholder="Brand Name"
                    value={addForm.brandName}
                    onChange={(e) => setAddForm(prev => ({ ...prev, brandName: e.target.value }))}
                  />
                </div>
                <div className="add-product-field">
                  <label className="add-product-label">Category</label>
                  <select
                    className="add-product-select"
                    value={addForm.categoryName}
                    onChange={(e) => setAddForm(prev => ({ ...prev, categoryName: e.target.value }))}
                  >
                    {CATEGORY_FILTERS.filter(cat => cat !== "All").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="add-product-field">
                  <label className="add-product-label">Dosage</label>
                  <input
                    type="text"
                    className="add-product-input"
                    placeholder="Dosage"
                    value={addForm.dosage}
                    onChange={(e) => setAddForm(prev => ({ ...prev, dosage: e.target.value }))}
                  />
                </div>
                <div className="add-product-field">
                  <label className="add-product-label">Size</label>
                  <input
                    type="text"
                    className="add-product-input"
                    placeholder="Size"
                    value={addForm.size}
                    onChange={(e) => setAddForm(prev => ({ ...prev, size: e.target.value }))}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="add-product-field add-product-full-width">
                  <label className="add-product-label">Product Name</label>
                  <input
                    type="text"
                    className="add-product-input"
                    placeholder="Product Name"
                    value={addForm.productName}
                    onChange={(e) => setAddForm(prev => ({ ...prev, productName: e.target.value }))}
                    required
                  />
                </div>
                <div className="add-product-field">
                  <label className="add-product-label">Category</label>
                  <select
                    className="add-product-select"
                    value={addForm.categoryName}
                    onChange={(e) => setAddForm(prev => ({ ...prev, categoryName: e.target.value }))}
                    required
                  >
                    {CATEGORY_FILTERS.filter(cat => cat !== "All" && cat !== "Generic" && cat !== "Branded" && cat !== "Unclassified").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="add-product-field">
                  <label className="add-product-label">Size</label>
                  <input
                    type="text"
                    className="add-product-input"
                    placeholder="Size"
                    value={addForm.size}
                    onChange={(e) => setAddForm(prev => ({ ...prev, size: e.target.value }))}
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
                onChange={(e) => setAddForm(prev => ({ ...prev, batchNumber: e.target.value }))}
              />
            </div>
            <div className="add-product-field">
              <label className="add-product-label">Expiry Date</label>
              <div style={{ position: "relative" }}>
                <input
                  type="date"
                  className={`add-product-input ${!addForm.expiryDate ? "is-empty" : ""}`}
                  placeholder="dd/mm/yyyy"
                  style={{ paddingRight: "2.5rem" }}
                  value={addForm.expiryDate}
                  onChange={(e) => setAddForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                />
                <i
                  className="fa-regular fa-calendar"
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#48aad9",
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                />
              </div>
            </div>
            {addProductType === "medicine" && (
              <div className="add-product-field">
                <label className="add-product-label">Needs Prescription</label>
                <select
                  className="add-product-select"
                  value={addForm.needsPrescription}
                  onChange={(e) => setAddForm(prev => ({ ...prev, needsPrescription: e.target.value }))}
                >
                  <option value="False">False</option>
                  <option value="True">True</option>
                </select>
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
                onChange={(e) => setAddForm(prev => ({ ...prev, quantity: e.target.value }))}
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
                onChange={(e) => setAddForm(prev => ({ ...prev, unitCost: e.target.value }))}
              />
            </div>
            <div className="add-product-field">
              <label className="add-product-label">Discountable</label>
              <select
                className="add-product-select"
                value={addForm.discountable}
                onChange={(e) => setAddForm(prev => ({ ...prev, discountable: e.target.value }))}
              >
                <option value="False">False</option>
                <option value="True">True</option>
              </select>
            </div>
            <div className="add-product-field">
              <label className="add-product-label">Selling Price</label>
              <input
                type="number"
                step="0.01"
                className="add-product-input"
                placeholder="Selling Price"
                value={addForm.sellingPrice}
                onChange={(e) => setAddForm(prev => ({ ...prev, sellingPrice: e.target.value }))}
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
                onChange={(e) => setAddForm(prev => ({ ...prev, barcode: e.target.value }))}
              />
            </div>
            <div className="add-product-field add-product-full-width">
              <label className="add-product-label">Product Description</label>
              <textarea
                className="add-product-textarea"
                placeholder="Description here..."
                value={addForm.description}
                onChange={(e) => setAddForm(prev => ({ ...prev, description: e.target.value }))}
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
          >
            Cancel
          </button>
          <button type="submit" className="add-product-btn-add">
            Add
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default AddProductModal;
