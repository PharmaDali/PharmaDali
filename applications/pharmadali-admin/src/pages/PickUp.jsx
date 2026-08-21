import React from "react";
import Modal from "../shared/components/Modal";
import successfulTaskIcon from "../assets/icons/modal-icons/successful-task.svg";
import errorIcon from "../assets/icons/modal-icons/error.svg";
import shieldQuestionIcon from "../assets/icons/modal-icons/shield-question.svg";
import { usePickupOrders, PICKUP_TABS } from "../hooks/usePickupOrders";
import PickupOrdersTable from "../components/PickUp/PickupOrdersTable";
import PickupOrderDetailsSidebar from "../components/PickUp/PickupOrderDetailsSidebar";
import "../assets/css/pospage.css";
import "../assets/css/inventory.css";

export function PickUp() {
  const {
    orders,
    loading,
    fetchError,
    search,
    setSearch,
    statusFilter,
    activeOrder,
    setActiveOrder,
    paymentMethod,
    setPaymentMethod,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    isPaymentResultModalOpen,
    setIsPaymentResultModalOpen,
    cashReceived,
    setCashReceived,
    gcashReference,
    setGcashReference,
    paymentResult,
    errorMessage,
    discountType,
    setDiscountType,
    discountPercentage,
    setDiscountPercentage,
    discountIdNumber,
    setDiscountIdNumber,
    tabCounts,
    filteredOrders,
    paginatedOrders,
    currentPage,
    totalPages,
    visiblePageNumbers,
    handlePageChange,
    handleTabChange,
    subtotalAmount,
    computedDiscountAmount,
    finalPayableAmount,
    changeAmount,
    handleOpenPaymentModal,
    handleCompleteOrderClick,
    confirmCompleteOrder,
  } = usePickupOrders();

  return (
    <section className="inventory-page d-flex flex-column" aria-label="Pickup Order Fulfillment">
      <div className="row g-4 align-items-stretch">
        <div className={activeOrder ? "col-12 col-lg-8 col-xl-9 h-100 d-flex flex-column" : "col-12 h-100 d-flex flex-column"}>
          <PickupOrdersTable
            orders={orders}
            filteredOrders={filteredOrders}
            loading={loading}
            fetchError={fetchError}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            onTabChange={handleTabChange}
            tabCounts={tabCounts}
            paginatedOrders={paginatedOrders}
            currentPage={currentPage}
            totalPages={totalPages}
            visiblePageNumbers={visiblePageNumbers}
            onPageChange={handlePageChange}
            onSelectOrder={setActiveOrder}
            tabs={PICKUP_TABS}
          />
        </div>

        {activeOrder && (
          <div className="col-12 col-lg-4 col-xl-3 h-100 d-flex flex-column">
            <PickupOrderDetailsSidebar
              activeOrder={activeOrder}
              onClose={() => setActiveOrder(null)}
              discountType={discountType}
              setDiscountType={setDiscountType}
              discountPercentage={discountPercentage}
              setDiscountPercentage={setDiscountPercentage}
              discountIdNumber={discountIdNumber}
              setDiscountIdNumber={setDiscountIdNumber}
              subtotalAmount={subtotalAmount}
              computedDiscountAmount={computedDiscountAmount}
              finalPayableAmount={finalPayableAmount}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              onOpenPaymentModal={handleOpenPaymentModal}
            />
          </div>
        )}
      </div>

      {/* Payment Processing Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        size="md"
        title="Complete Pickup Payment"
      >
        <div className="p-3">
          <div className="p-3 bg-light rounded-3 mb-3 border">
            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted small">Total Payable Amount:</span>
              <strong className="fs-5" style={{ color: "#2aabe2" }}>PHP {finalPayableAmount.toFixed(2)}</strong>
            </div>
            {paymentMethod === "cash" && (
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted small">Change to return:</span>
                <strong className="text-success fs-6">PHP {changeAmount.toFixed(2)}</strong>
              </div>
            )}
          </div>

          {paymentMethod === "cash" ? (
            <div className="mb-3">
              <label className="form-label fw-semibold text-dark small">Cash Received (PHP) *</label>
              <input
                type="number"
                step="0.01"
                className="form-control form-control-lg"
                placeholder="Enter cash received"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
              />
            </div>
          ) : (
            <div className="mb-3">
              <label className="form-label fw-semibold text-dark small">GCash Reference Number *</label>
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="e.g. 100293848123"
                value={gcashReference}
                onChange={(e) => setGcashReference(e.target.value)}
              />
            </div>
          )}

          <div className="d-flex justify-content-end gap-2 pt-2 border-top">
            <button
              type="button"
              className="btn btn-outline-secondary px-4 rounded-3"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary px-4 rounded-3 fw-semibold"
              style={{ backgroundColor: "#2aabe2", borderColor: "#2aabe2" }}
              onClick={handleCompleteOrderClick}
            >
              Confirm & Complete Pickup
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        size="sm"
        showCloseButton={false}
        className="pos-confirm-modal"
      >
        <div className="pos-confirm-content">
          <img src={shieldQuestionIcon} alt="Confirm Pickup" className="pos-confirm-icon" />
          <h3 className="pos-confirm-title">Complete Pickup Order?</h3>
          <p className="pos-confirm-text">
            This will mark order <strong>#{activeOrder?.order_number || activeOrder?.id}</strong> as completed and deduct batch stock.
          </p>
          <div className="pos-confirm-actions">
            <button
              type="button"
              className="pos-confirm-primary"
              onClick={confirmCompleteOrder}
            >
              Confirm Complete
            </button>
            <button
              type="button"
              className="pos-confirm-secondary"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Result Status Modal */}
      <Modal
        isOpen={isPaymentResultModalOpen}
        onClose={() => setIsPaymentResultModalOpen(false)}
        size="sm"
        showCloseButton={false}
        className="pos-confirm-modal"
      >
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <img
            src={paymentResult === "success" ? successfulTaskIcon : errorIcon}
            alt={paymentResult === "success" ? "Success" : "Error"}
            style={{ width: "64px", height: "64px", marginBottom: "16px" }}
          />
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "12px", color: "#1f2937" }}>
            {paymentResult === "success" ? "Pickup Order Completed!" : "Transaction Failed"}
          </h2>
          <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.5", marginBottom: "24px" }}>
            {paymentResult === "success"
              ? "The customer pickup transaction has been completed successfully."
              : errorMessage}
          </p>
          <button
            onClick={() => setIsPaymentResultModalOpen(false)}
            className="btn inventory-modal-btn inventory-modal-btn-primary w-100"
            style={{
              padding: "10px",
              backgroundColor: paymentResult === "success" ? "#2aabe2" : "#dc3545",
              borderColor: paymentResult === "success" ? "#2aabe2" : "#dc3545",
              color: "white",
            }}
          >
            {paymentResult === "success" ? "DONE" : "DISMISS"}
          </button>
        </div>
      </Modal>
    </section>
  );
}

export default PickUp;
