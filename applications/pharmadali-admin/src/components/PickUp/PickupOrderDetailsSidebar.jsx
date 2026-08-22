import React from "react";
import { DiscountSelect, DiscountControl } from "../../shared/components/DiscountSelect";
import PaymentMethodSelect from "../../shared/components/PaymentMethodSelect";
import { formatCustomerName, formatCustomerPhone } from "../../utils/formatUtils";

export function PickupOrderDetailsSidebar({
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
  const customerName = formatCustomerName(activeOrder);
  const customerPhone = formatCustomerPhone(activeOrder);

  return (
    <aside className="pickup-order-sidebar card border-0 shadow-sm p-4 h-100 d-flex flex-column justify-content-between" style={{ borderRadius: 16, backgroundColor: "#ffffff" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: 18 }}>Order Details</h5>
        <button
          type="button"
          className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center border-0 text-secondary shadow-none"
          style={{
            width: 30,
            height: 30,
            backgroundColor: "#f1f5f9",
            outline: "none",
            boxShadow: "none",
          }}
          onClick={onClose}
          aria-label="Close details sidebar"
        >
          <i className="fa-solid fa-xmark" style={{ fontSize: 14 }} />
        </button>
      </div>

      {/* Customer Info */}
      <div className="mb-3" style={{ fontSize: 14 }}>
        <div className="mb-1 text-dark">
          <span className="text-muted">Customer: </span>
          <strong className="fw-semibold">{customerName}</strong>
        </div>
        {customerPhone && (
          <div className="text-dark">
            <span className="text-muted">Contact: </span>
            <span>{customerPhone}</span>
          </div>
        )}
      </div>

      <hr className="my-3 opacity-25" />

      {/* Order Items List */}
      <div className="mb-3 flex-grow-1">
        <h6 className="fw-bold text-dark mb-3" style={{ fontSize: 15 }}>Order Details</h6>
        <div className="order-items-scroll px-1" style={{ maxHeight: 260, overflowY: "auto" }}>
          {(activeOrder.items || []).map((item, index) => {
            const qty = Number(item.quantity) || 1;
            const name = item.product?.product_name || item.product_name || item.product?.name || "Pharmacy Item";
            const unit = item.product?.form || item.product?.size || "box";
            return (
              <div key={item.id || index} className="d-flex justify-content-between text-dark mb-2" style={{ fontSize: 14 }}>
                <span>{name} {unit} × {qty}</span>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="my-3 opacity-25" />

      {/* Summary Amounts & Status */}
      <div className="d-flex justify-content-between align-items-center mb-2" style={{ fontSize: 14 }}>
        <span className="text-muted">Total Amount</span>
        <strong className="fw-bold text-dark" style={{ fontSize: 16 }}>
          PHP {Number(activeOrder.total_amount || finalPayableAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </strong>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3" style={{ fontSize: 14 }}>
        <span className="text-muted">Status:</span>
        <span className="fw-semibold" style={{ color: isReady ? "#01A768" : "#444444" }}>
          {isReady ? "Ready" : "Completed"}
        </span>
      </div>

      {/* Transaction Breakdown for Completed Orders */}
      {!isReady && (
        <div className="p-3 bg-light rounded-3 mb-3 border border-light-subtle" style={{ fontSize: 13.5 }}>
          <h6 className="fw-bold text-dark mb-2" style={{ fontSize: 14 }}>Transaction Summary</h6>
          <div className="d-flex justify-content-between text-muted mb-1">
            <span>Payment Method</span>
            <strong className="text-dark text-capitalize">{activeOrder.payment_method || "Cash"}</strong>
          </div>
          {Number(activeOrder.subtotal) > 0 && (
            <div className="d-flex justify-content-between text-muted mb-1">
              <span>Subtotal</span>
              <span>PHP {Number(activeOrder.subtotal).toFixed(2)}</span>
            </div>
          )}
          {Number(activeOrder.discount_amount) > 0 && (
            <div className="d-flex justify-content-between text-success mb-1">
              <span>Discount ({activeOrder.discount_type || "Applied"})</span>
              <span>- PHP {Number(activeOrder.discount_amount).toFixed(2)}</span>
            </div>
          )}
          <div className="d-flex justify-content-between fw-bold text-dark pt-2 border-top mt-2" style={{ fontSize: 15 }}>
            <span>Total Paid</span>
            <span style={{ color: "#2aabe2" }}>
              PHP {Number(activeOrder.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* Payment & Discount Controls for Ready Orders */}
      {isReady && (
        <>
          <DiscountControl
            discountType={discountType}
            setDiscountType={setDiscountType}
            discountPercentage={discountPercentage}
            setDiscountPercentage={setDiscountPercentage}
            discountIdNumber={discountIdNumber}
            setDiscountIdNumber={setDiscountIdNumber}
          />

          <PaymentMethodSelect
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
        </>
      )}

      {/* Bottom Action Button (Only shown when Ready) */}
      {isReady && (
        <button
          type="button"
          className="btn w-100 py-2 text-white fw-bold rounded-3 mt-auto"
          style={{ backgroundColor: "#2aabe2", borderColor: "#2aabe2", fontSize: 15 }}
          onClick={onOpenPaymentModal}
        >
          Complete Sale
        </button>
      )}
    </aside>
  );
}

export default PickupOrderDetailsSidebar;
