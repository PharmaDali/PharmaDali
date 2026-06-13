import React from "react";
import { useInventory } from "./inventory/hooks/useInventory";
import InventoryMetrics from "./inventory/components/InventoryMetrics";
import InventoryFilterBar from "./inventory/components/InventoryFilterBar";
import InventoryTable from "./inventory/components/InventoryTable";
import InventorySideCards from "./inventory/components/InventorySideCards";
import ProductDetailsModal from "./inventory/components/ProductDetailsModal";
import StockOutModal from "./inventory/components/StockOutModal";
import AddProductModal from "./inventory/components/AddProductModal";
import Modal from "../components/Modal";
import infoIcon from "../assets/icons/modal-icons/info.svg";
import "../assets/css/inventory.css";

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

    // Details Modal State & Adjustments
    selectedItem,
    isModalEditing,
    setIsModalEditing,
    modalDraft,
    showConfirmSave,
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
    handleSaveBatchStock,
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
        handleSaveBatchStock={handleSaveBatchStock}
        batchSaving={batchSaving}
        showAddBatch={showAddBatch}
        setShowAddBatch={setShowAddBatch}
        newBatch={newBatch}
        setNewBatch={setNewBatch}
        handleAddBatchSubmit={handleAddBatchSubmit}
        setShowStockOutModal={setShowStockOutModal}
        setStockOutForm={setStockOutForm}
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
      />

      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        addForm={addForm}
        setAddForm={setAddForm}
        addProductType={addProductType}
        setAddProductType={setAddProductType}
        handleAddProductSubmit={handleAddProductSubmit}
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
            <button type="button" className="pos-confirm-primary" onClick={handleConfirmSave}>
              Continue
            </button>
            <button type="button" className="pos-confirm-secondary" onClick={handleCancelSave}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

export default Inventory;