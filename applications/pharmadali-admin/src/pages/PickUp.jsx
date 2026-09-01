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
    isPaymentEntered,
    handlePaymentModalConfirm,
    handleOpenPaymentModal,
    handleCompleteOrderClick,
    confirmCompleteOrder,
  } = usePickupOrders();

  return (
    <section className="inventory-page d-flex flex-column" aria-label="Pickup Order Fulfillment">
      <div className="row g-4 align-items-stretch">
        <div className={activeOrder ? "col-12 col-lg-8 col-xl-9 d-flex flex-column" : "col-12 d-flex flex-column"}>
          <div className="bg-white rounded-3 shadow-sm p-4 d-flex flex-column flex-grow-1">
            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-end justify-content-between gap-2 gap-md-0" style={{ marginBottom: "0" }}>
              <h4 className="fw-bold text-dark m-0 pb-md-2" style={{ fontSize: "1.25rem", minWidth: "max-content" }}>
                Pickup Orders
              </h4>
              <div className="d-flex flex-nowrap justify-content-end gap-1 ms-auto w-md-auto" style={{ marginBottom: "-1px", zIndex: 2, maxWidth: "75%" }}>
                {(() => {
                  const orderedTabs = [
                    PICKUP_TABS.find(t => t.id === "All"),
                    PICKUP_TABS.find(t => t.id === "Completed"),
                    PICKUP_TABS.find(t => t.id === "Ready")
                  ].filter(Boolean);

                  return orderedTabs.map((tab) => {
                    const isActive = statusFilter === tab.id;
                    const rawCount = tabCounts[tab.id] || 0;
                    const badgeCount = tab.id === "Completed" ? (tabCounts.CompletedNew || 0) : rawCount;
                    const showBadge = tab.id !== "All" && badgeCount > 0;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        className="btn btn-sm fw-semibold d-flex align-items-center justify-content-center position-relative flex-grow-1 flex-md-grow-0"
                        style={{
                          backgroundColor: isActive ? "#e2f2fa" : "#e2e8f0",
                          color: isActive ? "#0f172a" : "#475569",
                          border: "1px solid",
                          borderColor: isActive ? "#cce4f2" : "transparent",
                          borderBottomColor: isActive ? "#e2f2fa" : "#cce4f2",
                          borderTopLeftRadius: "8px",
                          borderTopRightRadius: "8px",
                          borderBottomLeftRadius: "0",
                          borderBottomRightRadius: "0",
                          fontSize: "clamp(10px, 2.5vw, 12px)",
                          paddingTop: "7px",
                          paddingBottom: "7px",
                          paddingLeft: "clamp(8px, 3vw, 16px)",
                          paddingRight: "clamp(8px, 3vw, 16px)",
                          transition: "all 0.2s",
                          whiteSpace: "nowrap",
                        }}
                        onClick={() => handleTabChange(tab.id)}
                      >
                        {tab.label === "All" ? "All Orders" : tab.label}
                        {showBadge && (
                          <span
                            className="position-absolute top-0 start-100 translate-middle badge rounded-circle d-inline-flex align-items-center justify-content-center"
                            style={{
                              width: "18px",
                              height: "18px",
                              padding: 0,
                              backgroundColor: "#ef4444",
                              color: "#ffffff",
                              fontSize: "10px",
                              zIndex: 3,
                            }}
                          >
                            {badgeCount > 99 ? "99+" : badgeCount}
                          </span>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="d-flex flex-column flex-grow-1" style={{ backgroundColor: "#e2f2fa", border: "1px solid #cce4f2", borderTopLeftRadius: "12px", borderTopRightRadius: "0px", borderBottomLeftRadius: "12px", borderBottomRightRadius: "12px", zIndex: 1, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)", paddingTop: "24px", paddingBottom: "0px", paddingLeft: "0px", paddingRight: "0px", overflow: "hidden" }}>

              <div className="mb-4 px-4">
                <div className="input-group">
                  <span className="input-group-text border-end-0" style={{ borderColor: "#cce4f2", backgroundColor: "#edf4f9" }}>
                    <i className="fa-solid fa-magnifying-glass text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    style={{ borderColor: "#cce4f2", backgroundColor: "#edf4f9", fontSize: "14px", height: "42px" }}
                    placeholder="Search an order by order ID or Customer Name"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <PickupOrdersTable
                orders={orders}
                filteredOrders={filteredOrders}
                loading={loading}
                fetchError={fetchError}
                paginatedOrders={paginatedOrders}
                statusFilter={statusFilter}
                currentPage={currentPage}
                totalPages={totalPages}
                visiblePageNumbers={visiblePageNumbers}
                onPageChange={handlePageChange}
                onSelectOrder={setActiveOrder}
                activeOrder={activeOrder}
              />
            </div>
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
              isPaymentEntered={isPaymentEntered}
              onCompleteSale={handleCompleteOrderClick}
            />
          </div>
        )}
      </div>

      <ReceivePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentMethod={paymentMethod}
        orderTotal={finalPayableAmount}
        cashReceived={cashReceived}
        setCashReceived={setCashReceived}
        gcashReference={gcashReference}
        setGcashReference={setGcashReference}
        onConfirm={handlePaymentModalConfirm}
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
