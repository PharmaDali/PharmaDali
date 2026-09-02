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
  isPaymentEntered,
  onCompleteSale,
}) {
  const isReady = activeOrder && activeOrder.status === 'ready_for_pickup';

  const requiresPaymentInput = paymentMethod === 'cash' || (activeOrder?.payment_method === 'gcash' && activeOrder?.payment_status === 'unpaid');
  const showEnterPayment = requiresPaymentInput && !isPaymentEntered;
  const customerName = formatCustomerName(activeOrder);
  const customerPhone = formatCustomerPhone(activeOrder);

  if (!activeOrder) return null;

  return (
    <aside className="pickup-order-sidebar admin-card d-flex flex-column justify-content-between h-100" style={{ borderRadius: 16 }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: 18 }}>Order Details</h5>
        <button
          type="button"
          className="btn btn-sm rounded-circle d-flex align-items-center justify-content-center border-0 text-secondary shadow-none"
          style={{
            width: 30,
            height: 30,
            backgroundColor: "var(--pd-bg-sidebar)",
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
            <span style={{ color: "var(--pd-primary)" }}>
              PHP {Number(activeOrder.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* Attachments Container */}
      {(() => {
        const resolveImageUrl = (path) => {
          if (!path) return null;
          if (path.startsWith('http')) return path;
          const apiUrl = import.meta.env.VITE_API_BASE_URL || '';
          const baseUrl = apiUrl.replace(/\/api\/?$/, '');
          const cleanPath = path.startsWith('/') ? path : `/${path}`;
          // Laravel storage paths are often 'storage/...' in the DB
          // but sometimes just relative paths. Let's ensure it maps to the public URL
          return baseUrl + (cleanPath.startsWith('/storage') ? cleanPath : `/storage${cleanPath}`);
        };

        const attachments = [];
        
        // Find prescription if it exists
        const rxItem = activeOrder.items?.find(i => i.order_item_prescription?.image_path);
        if (rxItem) attachments.push(resolveImageUrl(rxItem.order_item_prescription.image_path));
        
        // Discount ID and Payment Receipt
        if (activeOrder.discount_id_image_path) attachments.push(resolveImageUrl(activeOrder.discount_id_image_path));
        if (activeOrder.payment_receipt_image_path) attachments.push(resolveImageUrl(activeOrder.payment_receipt_image_path));

        const validAttachments = attachments.filter(Boolean);
        if (validAttachments.length === 0) return null;

        return (
          <div className="p-3 mb-3 rounded-4 border" style={{ backgroundColor: "var(--pd-bg-main)", borderColor: "var(--pd-border)" }}>
            <h6 className="fw-bold mb-3" style={{ fontSize: 14, color: "var(--pd-text-muted)" }}>Attachments</h6>
            <div className={`d-flex gap-2 ${validAttachments.length === 1 ? 'justify-content-center' : 'justify-content-start overflow-x-auto'}`}>
              {validAttachments.map((url, idx) => (
                <a 
                  key={idx} 
                  href={url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`d-block flex-shrink-0 ${validAttachments.length === 1 ? 'w-75' : 'flex-fill'}`}
                  style={{ maxWidth: validAttachments.length === 1 ? '80%' : 'calc(50% - 4px)' }}
                >
                  <div className="border overflow-hidden bg-white" style={{ borderColor: "var(--pd-primary)", borderWidth: 1.5, borderRadius: 12, height: 90 }}>
                    <img src={url} alt="Attachment" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                </a>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Payment Method Select (Conditional) */}
      {isReady && activeOrder.payment_method === 'gcash' && activeOrder.payment_status === 'unpaid' && (activeOrder.discount_id_image_path || (activeOrder.items && activeOrder.items.some(i => i.order_item_prescription?.image_path))) && (
        <PaymentMethodSelect
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />
      )}

      {/* Approved GCash Indication */}
      {isReady && activeOrder.payment_method === 'gcash' && activeOrder.payment_status === 'paid' && (
        <div className="p-3 bg-light rounded-3 mb-3 border border-light-subtle d-flex justify-content-between align-items-center">
          <span className="fw-semibold text-dark" style={{ fontSize: 14 }}>Payment Method</span>
          <span className="badge bg-primary px-3 py-2 rounded-pill" style={{ fontSize: 12 }}>GCash (Paid)</span>
        </div>
      )}

      {/* Bottom Action Button (Only shown when Ready) */}
      {isReady && (
        <button
          type="button"
          className="btn w-100 py-2 text-white fw-bold rounded-3 mt-auto"
          style={{ backgroundColor: "var(--pd-primary)", borderColor: "var(--pd-primary)", fontSize: 15 }}
          onClick={showEnterPayment ? onOpenPaymentModal : onCompleteSale}
        >
          {showEnterPayment ? "Enter Payment" : "Complete Sale"}
        </button>
      )}
    </aside>
  );
}

export default PickupOrderDetailsSidebar;
