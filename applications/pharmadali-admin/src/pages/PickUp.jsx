import React from "react";
import { usePickupOrders, PICKUP_TABS } from "../hooks/usePickupOrders";
import PickupOrdersTable from "../components/PickUp/PickupOrdersTable";
import PickupOrderDetailsSidebar from "../components/PickUp/PickupOrderDetailsSidebar";
import "../assets/css/pospage.css";
import "../assets/css/inventory.css";
import SearchBar from "../shared/components/SearchBar";
import { ReceivePaymentModal, ConfirmOrderModal, PaymentResultModal } from "../shared/components/PaymentModals";

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
        <div className={activeOrder ? "col-12 col-lg-8 col-xl-9 d-flex flex-column" : "col-12 d-flex flex-column"}>
          {/* Main White Parent Card for Toolbar + Table */}
          <div className="bg-white rounded-4 shadow-sm p-3 p-md-4 d-flex flex-column flex-grow-1">
            {/* Header Toolbar (Title, Tabs & Search) */}
            <div className="mb-3 d-flex align-items-center justify-content-between flex-wrap gap-3 border-0" style={{ backgroundColor: "transparent" }}>
              <div className="d-flex align-items-center gap-3 flex-wrap">
                <h5 className="fw-bold text-dark mb-0 me-2" style={{ fontSize: "1.25rem", whiteSpace: "nowrap" }}>
                  Pickup Orders
                </h5>
                <div className="nav nav-pills gap-3">
                  {PICKUP_TABS.map((tab) => {
                    const isActive = statusFilter === tab.id;
                    const rawCount = tabCounts[tab.id] || 0;
                    const badgeCount = tab.id === "Completed" ? (tabCounts.CompletedNew || 0) : rawCount;
                    const showBadge = tab.id !== "All" && badgeCount > 0;

                    return (
                      <div key={tab.id} className="position-relative d-inline-flex align-items-center">
                        <button
                          type="button"
                          className={`nav-link btn-sm d-flex align-items-center rounded-3 px-3 py-1.5 ${
                            isActive ? "active" : ""
                          }`}
                          style={{
                            backgroundColor: isActive ? "#2aabe2" : "#f1f5f9",
                            color: isActive ? "#ffffff" : "#475569",
                            fontWeight: isActive ? 600 : 500,
                            fontSize: "0.815rem",
                            gap: "7px",
                          }}
                          onClick={() => handleTabChange(tab.id)}
                        >
                          <i className={`fa-solid ${tab.icon}`} style={{ fontSize: "0.775rem" }} />
                          <span>{tab.label}</span>
                        </button>

                        {showBadge && (
                          <span
                            className="position-absolute top-0 start-100 translate-middle badge rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm"
                            style={{
                              width: "18px",
                              height: "18px",
                              padding: 0,
                              backgroundColor: "#f87171",
                              color: "#ffffff",
                              zIndex: 2,
                            }}
                          >
                            {tab.id === "Completed" ? (
                              <i className="fa-solid fa-check" style={{ fontSize: "9px" }} />
                            ) : (
                              <span style={{ fontSize: "0.675rem", lineHeight: "18px" }}>
                                {badgeCount > 99 ? "99+" : badgeCount}
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ minWidth: 420 }}>
                <SearchBar
                  id="pickup-orders-search"
                  value={search}
                  onChange={(val) => setSearch(val)}
                  placeholder="Search order ID, customer name, ref..."
                />
              </div>
            </div>

            <PickupOrdersTable
              orders={orders}
              filteredOrders={filteredOrders}
              loading={loading}
              fetchError={fetchError}
              paginatedOrders={paginatedOrders}
              currentPage={currentPage}
              totalPages={totalPages}
              visiblePageNumbers={visiblePageNumbers}
              onPageChange={handlePageChange}
              onSelectOrder={setActiveOrder}
            />
          </div>
        </div>

        {activeOrder && (
          <div className="col-12 col-lg-4 col-xl-3 d-flex flex-column">
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

      {/* Reusable Payment Modals */}
      <ReceivePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentMethod={paymentMethod}
        orderTotal={finalPayableAmount}
        cashReceived={cashReceived}
        setCashReceived={setCashReceived}
        gcashReference={gcashReference}
        setGcashReference={setGcashReference}
        onConfirm={handleCompleteOrderClick}
      />

      <ConfirmOrderModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setIsPaymentModalOpen(true);
        }}
        onContinue={confirmCompleteOrder}
      />

      <PaymentResultModal
        isOpen={isPaymentResultModalOpen}
        onClose={() => setIsPaymentResultModalOpen(false)}
        result={paymentResult}
      />
    </section>
  );
}

export default PickUp;
