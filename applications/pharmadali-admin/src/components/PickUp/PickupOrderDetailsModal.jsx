import React from "react";
import Modal from "../../shared/components/Modal";
import DiscountSelect from "./DiscountSelect";

export function PickupOrderDetailsModal({
  activeOrder,
  onClose,
  discountType,
  setDiscountType,
  discountPercentage,
  setDiscountPercentage,
  discountIdNumber,
  setDiscountIdNumber,
  subtotalAmount,
  computedDiscountAmount,
  finalPayableAmount,
  paymentMethod,
  setPaymentMethod,
  onOpenPaymentModal,
}) {
  if (!activeOrder) return null;

  const isReady = activeOrder.status === "ready_for_pickup";

  return (
    <Modal
      isOpen={Boolean(activeOrder)}
      onClose={onClose}
      size="lg"
      title={`Order Pickup Fulfillment #${activeOrder.order_number || activeOrder.id}`}
    >
      <div className="p-2">
        {/* Customer & Order Metadata Header */}
        <div className="p-3 bg-light rounded-3 border mb-3">
          <div className="row g-3 text-sm">
            <div className="col-6 col-md-3">
              <span className="text-muted d-block small">Customer Name</span>
              <strong className="text-dark">
                {activeOrder.customer_name || `${activeOrder.user?.first_name || ''} ${activeOrder.user?.last_name || ''}`.trim() || "Walk-in Customer"}
              </strong>
            </div>
            <div className="col-6 col-md-3">
              <span className="text-muted d-block small">Contact Number</span>
              <strong className="text-dark">{activeOrder.customer_phone || activeOrder.user?.mobile_number || "N/A"}</strong>
            </div>
            <div className="col-6 col-md-3">
              <span className="text-muted d-block small">Order Type</span>
              <strong style={{ color: "#2aabe2" }}>In-Store Pickup</strong>
            </div>
            <div className="col-6 col-md-3">
              <span className="text-muted d-block small">Current Status</span>
              <span className={`badge px-2 py-1 ${isReady ? "bg-warning-subtle text-warning-emphasis" : "bg-success-subtle text-success"}`}>
                {isReady ? "Ready for Pickup" : activeOrder.status}
              </span>
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="mb-3">
          <h6 className="fw-bold mb-2 text-dark" style={{ fontSize: 13 }}>Items to Fulfill</h6>
          <div className="table-responsive border rounded-3 overflow-hidden">
            <table className="table table-sm align-middle mb-0" style={{ fontSize: 12 }}>
              <thead className="bg-light">
                <tr>
                  <th>Product Name</th>
                  <th className="text-center">Price</th>
                  <th className="text-center">Qty</th>
                  <th className="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {(activeOrder.items || []).map((item, index) => {
                  const price = Number(item.price) || 0;
                  const qty = Number(item.quantity) || 1;
                  const itemSubtotal = Number(item.subtotal) || (price * qty);

                  return (
                    <tr key={item.id || index}>
                      <td>
                        <div className="fw-semibold text-dark">{item.product?.name || item.product_name || "Pharmacy Item"}</div>
                        {item.product?.brand && <span className="text-muted small">{item.product.brand}</span>}
                      </td>
                      <td className="text-center">PHP {price.toFixed(2)}</td>
                      <td className="text-center">
                        <span className="badge bg-secondary-subtle text-secondary px-2">{qty}</span>
                      </td>
                      <td className="text-end fw-bold">PHP {itemSubtotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment & Discount Controls for Ready Orders */}
        {isReady ? (
          <div className="card border-0 bg-light p-3 rounded-3 mb-3">
            <h6 className="fw-bold mb-2 text-dark" style={{ fontSize: 13 }}>Fulfillment & Payment Details</h6>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label text-muted small fw-semibold mb-1">Discount Policy</label>
                <DiscountSelect value={discountType} onChange={setDiscountType} />

                {discountType === "custom" && (
                  <div className="mb-2">
                    <label className="form-label text-muted small mb-1">Discount Percentage (%)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="e.g. 15"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>
                )}

                {discountType !== "none" && discountType !== "custom" && (
                  <div className="mb-2">
                    <label className="form-label text-muted small mb-1">Senior / PWD / ID Number *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Enter ID reference number"
                      value={discountIdNumber}
                      onChange={(e) => setDiscountIdNumber(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label text-muted small fw-semibold mb-1">Payment Method</label>
                <div className="d-flex gap-2 mb-3">
                  <button
                    type="button"
                    className={`btn btn-sm flex-fill d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 ${
                      paymentMethod === "cash" ? "btn-primary" : "btn-outline-secondary"
                    }`}
                    style={{
                      backgroundColor: paymentMethod === "cash" ? "#2aabe2" : "transparent",
                      borderColor: paymentMethod === "cash" ? "#2aabe2" : "#dde3ec",
                    }}
                    onClick={() => setPaymentMethod("cash")}
                  >
                    <i className="fa-solid fa-money-bill-wave" />
                    <span>Cash</span>
                  </button>

                  <button
                    type="button"
                    className={`btn btn-sm flex-fill d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 ${
                      paymentMethod === "gcash" ? "btn-primary" : "btn-outline-secondary"
                    }`}
                    style={{
                      backgroundColor: paymentMethod === "gcash" ? "#2aabe2" : "transparent",
                      borderColor: paymentMethod === "gcash" ? "#2aabe2" : "#dde3ec",
                    }}
                    onClick={() => setPaymentMethod("gcash")}
                  >
                    <i className="fa-solid fa-mobile-screen-button" />
                    <span>GCash</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Total Breakdown */}
            <div className="pt-2 border-top mt-2">
              <div className="d-flex justify-content-between text-muted small mb-1">
                <span>Subtotal</span>
                <span>PHP {subtotalAmount.toFixed(2)}</span>
              </div>
              {computedDiscountAmount > 0 && (
                <div className="d-flex justify-content-between text-success small mb-1">
                  <span>Discount</span>
                  <span>- PHP {computedDiscountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between fw-bold text-dark fs-5 pt-1 border-top">
                <span>Total Payable</span>
                <span style={{ color: "#2aabe2" }}>PHP {finalPayableAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-success-subtle border border-success-subtle rounded-3 text-center mb-3">
            <i className="fa-solid fa-circle-check text-success fs-3 mb-2 d-block" />
            <h6 className="fw-bold text-success mb-1">Order Completed</h6>
            <p className="text-muted small mb-0">This pickup transaction was fully processed and stock deducted.</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="d-flex justify-content-end gap-2 pt-2 border-top">
          <button type="button" className="btn btn-sm btn-outline-secondary px-4 py-2 rounded-3" onClick={onClose}>
            Close
          </button>
          {isReady && (
            <button
              type="button"
              className="btn btn-sm btn-primary px-4 py-2 rounded-3 fw-semibold"
              style={{ backgroundColor: "#2aabe2", borderColor: "#2aabe2" }}
              onClick={onOpenPaymentModal}
            >
              <i className="fa-solid fa-cash-register me-1" />
              Complete Transaction (PHP {finalPayableAmount.toFixed(2)})
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default PickupOrderDetailsModal;
