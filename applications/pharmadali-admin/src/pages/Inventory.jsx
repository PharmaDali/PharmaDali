import React from "react";
import { useOutletContext } from "react-router-dom";
import { useInventory } from "../hooks/useInventory";
import InventoryMetrics from "../components/Inventory/InventoryMetrics";
import InventoryFilterBar from "../components/Inventory/InventoryFilterBar";
import InventoryTable from "../components/Inventory/InventoryTable";
import InventorySideCards from "../components/Inventory/InventorySideCards";
import ProductDetailsModal from "../components/Inventory/ProductDetailsModal";
import StockOutModal from "../components/Inventory/StockOutModal";
import AddProductModal from "../components/Inventory/AddProductModal";
import Modal from "../shared/components/Modal";
import infoIcon from "../assets/icons/modal-icons/info.svg";
import successfulIcon from "../assets/icons/modal-icons/successful-task.svg";
import errorIcon from "../assets/icons/modal-icons/error.svg";
import "../assets/css/inventory.css";

export function Inventory() {
  const context = useOutletContext() || {};
  const user = context.user;
  const isPharmacist = user?.role === "pharmacist";

  const {
    filter,
    metrics,
    sideCards,
    table,
    detailsModal,
    stockOutModal,
    addProductModal,
    feedbackModals,
    showConfirmSave,
    handleCancelSave,
    handleConfirmSave,
    productUpdating,
    isAddModalOpen,
    setIsAddModalOpen,
    navigate,
    loadData,
  } = useInventory();

  const {
    successModal,
    setSuccessModal,
    errorModal,
    setErrorModal,
  } = feedbackModals;

  return (
    <section className="inventory-page" aria-label="Pharmacy Inventory Management">
      <header className="admin-page-header">
        <h4 className="fw-bold mb-1 admin-page-title">Inventory</h4>
        <p className="admin-page-subtitle">
          Monitor stock health, spot urgent risks, and prep smarter replenishment strategies.
        </p>
      </header>

      <InventoryMetrics {...metrics} />

      <InventoryFilterBar {...filter} loadData={loadData} onReset={filter.resetFilters} />

      <div className="row g-4 inventory-content-row">
        <div className="col-12 col-xl-8">
          <InventoryTable
            {...table}
            setIsAddModalOpen={setIsAddModalOpen}
            navigate={navigate}
            isPharmacist={isPharmacist}
          />
        </div>

        <div className="col-12 col-xl-4">
          <InventorySideCards {...sideCards} />
        </div>
      </div>

      <ProductDetailsModal
        {...detailsModal}
        setShowStockOutModal={stockOutModal.setShowStockOutModal}
        setStockOutForm={stockOutModal.setStockOutForm}
        inputErrors={feedbackModals.inputErrors}
        isPharmacist={isPharmacist}
      />

      <StockOutModal
        {...stockOutModal}
        inputErrors={feedbackModals.inputErrors}
      />

      <AddProductModal
        {...addProductModal}
        inputErrors={feedbackModals.inputErrors}
      />

      {/* Save Confirmation Modal */}
      <Modal
        isOpen={showConfirmSave}
        onClose={handleCancelSave}
        size="sm"
        showCloseButton={false}
        closeOnOverlay={false}
        className="pos-confirm-modal"
      >
        <div className="pos-confirm-content">
          <img src={infoIcon} alt="Information" className="pos-confirm-icon" />
          <h3 className="pos-confirm-title">Confirm Changes?</h3>
          <p className="pos-confirm-text">
            Changes will be reflected in the inventory after you save.
          </p>
          <div className="pos-confirm-actions">
            <button
              type="button"
              className="pos-confirm-primary d-flex align-items-center justify-content-center gap-2"
              onClick={handleConfirmSave}
              disabled={productUpdating}
              style={{ minWidth: "120px" }}
            >
              {productUpdating && (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              )}
              {productUpdating ? "Saving..." : "Continue"}
            </button>
            <button
              type="button"
              className="pos-confirm-secondary"
              onClick={handleCancelSave}
              disabled={productUpdating}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        size="sm"
        showCloseButton={false}
        className="pos-confirm-modal"
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <img
            src={successfulIcon}
            alt="Success"
            style={{ width: "64px", height: "64px", marginBottom: "16px" }}
          />
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px", color: "#1f2937" }}>
            {successModal.title}
          </h2>
          <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.5", marginBottom: "24px" }}>
            {successModal.message}
          </p>
          <button
            onClick={() => setSuccessModal({ ...successModal, isOpen: false })}
            className="btn inventory-modal-btn inventory-modal-btn-primary w-100"
            style={{ padding: "10px" }}
          >
            DONE
          </button>
        </div>
      </Modal>

      {/* Error Modal */}
      <Modal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        size="sm"
        showCloseButton={false}
        className="pos-confirm-modal"
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <img
            src={errorIcon}
            alt="Error"
            style={{ width: "64px", height: "64px", marginBottom: "16px" }}
          />
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px", color: "#1f2937" }}>
            {errorModal.title}
          </h2>
          <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.5", marginBottom: "24px" }}>
            {errorModal.message}
          </p>
          <button
            onClick={() => setErrorModal({ ...errorModal, isOpen: false })}
            className="btn inventory-modal-btn inventory-modal-btn-primary w-100"
            style={{ padding: "10px", backgroundColor: "#dc3545", borderColor: "#dc3545", color: "white" }}
          >
            DISMISS
          </button>
        </div>
      </Modal>
    </section>
  );
}

export default Inventory;
