import React from "react";
import { useInventory } from "./hooks/useInventory";
import InventoryMetrics from "./components/InventoryMetrics";
import InventoryFilterBar from "./components/InventoryFilterBar";
import InventoryTable from "./components/InventoryTable";
import InventorySideCards from "./components/InventorySideCards";
import ProductDetailsModal from "./components/ProductDetailsModal";
import StockOutModal from "./components/StockOutModal";
import AddProductModal from "./components/AddProductModal";
import Modal from "../../components/Modal";
import infoIcon from "../../assets/icons/modal-icons/info.svg";
import successfulIcon from "../../assets/icons/modal-icons/successful-task.svg";
import errorIcon from "../../assets/icons/modal-icons/error.svg";
import "../../assets/css/inventory.css";

export function Inventory() {
  const {
    // Search/Filter State
    query,
    setQuery,
    categoryFilter,
    setCategoryFilter,
    priceFilter,
    setPriceFilter,
    stockFilter,
    setStockFilter,
    statusFilter,
    setStatusFilter,
    categoryOptions,

    // Loading & Core Items
    loading,
    filteredItems,
    paginatedItems,

    // Pagination
    currentPage,
    totalPages,
    visiblePageNumbers,
    handlePageChange,

    // Metrics & Side Panel lists
    totalItems,
    lowStockCount,
    expiringSoonCount,
    expiredCount,
    lowStockItems,
    expiringItems,
    expiredItems,

    // Details Modal State & Adjustments
    selectedItem,
    isModalEditing,
    setIsModalEditing,
    modalDraft,
    showConfirmSave,
    productUpdating,
    batches,
    batchLoading,
    batchEditStocks,
    showAddBatch,
    setShowAddBatch,
    newBatch,
    setNewBatch,
    batchSaving,

    // Actions & Selection Handlers
    handleSelectItem,
    handleModalClose,
    handleBatchStockChange,
    handleSaveAllBatches,
    hasBatchChanges,
    handleAddBatchSubmit,
    handleDraftChange,
    handleRequestSave,
    handleConfirmSave,
    handleCancelSave,

    // Stock Out Form States & Actions
    showStockOutModal,
    setShowStockOutModal,
    stockOutForm,
    setStockOutForm,
    stockOutSaving,
    handleStockOutSubmit,

    // Add Product Modal States & Actions
    isAddModalOpen,
    setIsAddModalOpen,
    addProductType,
    setAddProductType,
    addForm,
    setAddForm,
    handleAddProductSubmit,

    successModal,
    setSuccessModal,
    errorModal,
    setErrorModal,
    inputErrors,
    setInputErrors,

    navigate,
    loadData,
  } = useInventory();

  return (
    <section className="inventory-page">
      <header className="admin-page-header">
        <h4 className="fw-bold mb-1 admin-page-title">Inventory</h4>
        <p className="admin-page-subtitle">
          Monitor stock health, spot urgent risks, and prep smarter replenishment strategies.
        </p>
      </header>

      <InventoryMetrics
        totalItems={totalItems}
        lowStockCount={lowStockCount}
        expiringSoonCount={expiringSoonCount}
        expiredCount={expiredCount}
      />

      <InventoryFilterBar
        query={query}
        setQuery={setQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        priceFilter={priceFilter}
        setPriceFilter={setPriceFilter}
        stockFilter={stockFilter}
        setStockFilter={setStockFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryOptions={categoryOptions}
        loadData={loadData}
      />

      <div className="row g-4 inventory-content-row">
        <div className="col-12 col-xl-8">
          <InventoryTable
            loading={loading}
            filteredItems={filteredItems}
            paginatedItems={paginatedItems}
            selectedItem={selectedItem}
            handleSelectItem={handleSelectItem}
            currentPage={currentPage}
            totalPages={totalPages}
            visiblePageNumbers={visiblePageNumbers}
            handlePageChange={handlePageChange}
            setIsAddModalOpen={setIsAddModalOpen}
            navigate={navigate}
          />
        </div>

        <div className="col-12 col-xl-4">
          <InventorySideCards
            lowStockItems={lowStockItems}
            expiringItems={expiringItems}
            expiredItems={expiredItems}
          />
        </div>
      </div>

      <ProductDetailsModal
        selectedItem={selectedItem}
        modalDraft={modalDraft}
        isModalEditing={isModalEditing}
        setIsModalEditing={setIsModalEditing}
        handleModalClose={handleModalClose}
        handleDraftChange={handleDraftChange}
        handleRequestSave={handleRequestSave}
        batches={batches}
        batchLoading={batchLoading}
        batchEditStocks={batchEditStocks}
        handleBatchStockChange={handleBatchStockChange}
        handleSaveAllBatches={handleSaveAllBatches}
        hasBatchChanges={hasBatchChanges}
        batchSaving={batchSaving}
        showAddBatch={showAddBatch}
        setShowAddBatch={setShowAddBatch}
        newBatch={newBatch}
        setNewBatch={setNewBatch}
        handleAddBatchSubmit={handleAddBatchSubmit}
        setShowStockOutModal={setShowStockOutModal}
        setStockOutForm={setStockOutForm}
        inputErrors={inputErrors}
      />

      <StockOutModal
        isOpen={showStockOutModal}
        onClose={() => setShowStockOutModal(false)}
        selectedItem={selectedItem}
        batches={batches}
        stockOutForm={stockOutForm}
        setStockOutForm={setStockOutForm}
        stockOutSaving={stockOutSaving}
        handleStockOutSubmit={handleStockOutSubmit}
        inputErrors={inputErrors}
      />

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        addForm={addForm}
        setAddForm={setAddForm}
        addProductType={addProductType}
        setAddProductType={setAddProductType}
        handleAddProductSubmit={handleAddProductSubmit}
        inputErrors={inputErrors}
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
