import React, { useState } from "react";
import { DiscountSelect, DiscountControl } from "../../shared/components/DiscountSelect";
import PaymentMethodSelect from "../../shared/components/PaymentMethodSelect";
import { formatCustomerName, formatCustomerPhone, formatDateTime } from "../../utils/formatUtils";
import ZoomableImageModal from "../../shared/components/ZoomableImageModal";

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
  cashReceived,
  changeAmount,
  onCompleteSale,
  shouldPrintReceipt = false,
  setShouldPrintReceipt = () => {},
  onPrintReceipt,
  loadingReceipt = false,
}) {
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

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
          <div className="text-dark mb-1">
            <span className="text-muted">Contact: </span>
            <span>{customerPhone}</span>
          </div>
        )}
        {activeOrder.scheduled_pickup_at && (
          <div className="text-dark mb-1">
            <span className="text-muted">Scheduled Pickup: </span>
            <span>{formatDateTime(activeOrder.scheduled_pickup_at)}</span>
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
          {(activeOrder.payment_method === 'cash' || activeOrder.payment_method === 'Cash' || (!activeOrder.payment_method)) && (activeOrder.amount_received !== null && activeOrder.amount_received !== undefined) && (
            <>
              <div className="d-flex justify-content-between text-muted mt-2 mb-1" style={{ fontSize: 13.5 }}>
                <span>Amount Received</span>
                <span className="text-dark">PHP {Number(activeOrder.amount_received || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="d-flex justify-content-between text-muted" style={{ fontSize: 13.5 }}>
                <span>Change</span>
                <span className="text-dark">PHP {Number(activeOrder.change_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Entered Payment Details for Ready Orders */}
      {isReady && isPaymentEntered && paymentMethod === 'cash' && (
        <div className="p-3 bg-light rounded-3 mb-3 border border-light-subtle" style={{ fontSize: 13.5 }}>
          <div className="d-flex justify-content-between text-muted mb-1">
            <span>Amount Paid</span>
            <span className="text-dark">PHP {Number(cashReceived).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="d-flex justify-content-between fw-bold text-dark pt-1">
            <span>Change</span>
            <span style={{ color: "var(--pd-primary)" }}>PHP {Number(changeAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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
          const cleanPath = path.replace(/^\/?storage\//, '').replace(/^\/+/, '');
          if (
            cleanPath.startsWith('prescriptions/') || 
            cleanPath.startsWith('discount_ids/') || 
            cleanPath.startsWith('payment_receipts/') || 
            cleanPath.startsWith('chat_images/')
          ) {
            return `${apiUrl.replace(/\/+$/, '')}/media/private/${cleanPath}`;
          }
          return `${baseUrl}/storage/${cleanPath}`;
        };

        const attachments = [];
        
        // Find prescription if it exists
        const rxItem = activeOrder.items?.find(i => 
          i.order_item_prescription?.prescription_image_url || 
          i.order_item_prescription?.image_url || 
          i.order_item_prescription?.prescription_image_path || 
          i.order_item_prescription?.image_path
        );
        if (rxItem) {
          const rx = rxItem.order_item_prescription;
          const rxUrl = rx.prescription_image_url || rx.image_url || resolveImageUrl(rx.prescription_image_path || rx.image_path);
          if (rxUrl) {
            attachments.push({
              url: rxUrl,
              title: "Prescription",
              type: "prescription",
            });
          }
        }
        
        // Discount ID
        if (activeOrder.discount_id_image_url || activeOrder.discount_id_image_path) {
          const discUrl = activeOrder.discount_id_image_url || resolveImageUrl(activeOrder.discount_id_image_path);
          if (discUrl) {
            attachments.push({
              url: discUrl,
              title: "Discount ID",
              type: "discount_id",
            });
          }
        }

        // Payment Receipt
        if (activeOrder.payment_receipt_image_url || activeOrder.payment_receipt_image_path) {
          const receiptUrl = activeOrder.payment_receipt_image_url || resolveImageUrl(activeOrder.payment_receipt_image_path);
          if (receiptUrl) {
            attachments.push({
              url: receiptUrl,
              title: "Payment Receipt",
              type: "payment_receipt",
            });
          }
        }

        const validAttachments = attachments.filter(a => Boolean(a?.url));

        const purgedLabels = [];
        const hasPurgedRx = activeOrder.items?.some(i =>
          !i.order_item_prescription?.prescription_image_path &&
          Boolean(i.order_item_prescription?.prescription_purged_at)
        );
        if (hasPurgedRx) {
          purgedLabels.push("Prescription");
        }
        if (!activeOrder.discount_id_image_path && activeOrder.discount_id_purged_at) {
          purgedLabels.push("Discount ID");
        }
        if (!activeOrder.payment_receipt_image_path && activeOrder.payment_receipt_purged_at) {
          purgedLabels.push("Payment Receipt");
        }

        if (validAttachments.length === 0 && purgedLabels.length === 0) return null;

        return (
          <>
            {validAttachments.length > 0 && (
              <div className="p-3 mb-3 rounded-4 border" style={{ backgroundColor: "var(--pd-bg-main)", borderColor: "var(--pd-border)" }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold m-0" style={{ fontSize: 13.5, color: "var(--pd-text-muted)" }}>Attachments</h6>
                  <span className="text-muted small" style={{ fontSize: "11px" }}>Click to zoom</span>
                </div>
                <div className={`d-flex gap-2 ${validAttachments.length === 1 ? 'justify-content-center' : 'justify-content-start overflow-x-auto'}`}>
                  {validAttachments.map((item, idx) => (
                    <button 
                      key={idx} 
                      type="button" 
                      className={`d-block flex-shrink-0 p-0 border-0 bg-transparent text-start ${validAttachments.length === 1 ? 'w-75' : 'flex-fill'}`}
                      style={{ maxWidth: validAttachments.length === 1 ? '80%' : 'calc(50% - 4px)', cursor: 'pointer' }}
                      onClick={() => {
                        setPreviewIndex(idx);
                        setPreviewModalOpen(true);
                      }}
                      title={`View ${item.title}`}
                    >
                      <div className="border overflow-hidden bg-white position-relative rounded-3 shadow-sm hover-shadow transition-all" style={{ borderColor: "var(--pd-primary)", borderWidth: 1.5, height: 90 }}>
                        <img src={item.url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white px-2 py-0.5 d-flex align-items-center justify-content-between" style={{ fontSize: "10px" }}>
                          <span className="text-truncate fw-medium">{item.title}</span>
                          <i className="fa-solid fa-magnifying-glass-plus ms-1" style={{ fontSize: "9px" }} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {purgedLabels.length > 0 && (
              <div className="p-2.5 mb-3 rounded-3 border d-flex align-items-start gap-2" style={{ backgroundColor: "var(--pd-bg-main)", borderColor: "var(--pd-border)", fontSize: "12px" }}>
                <i className="fa-solid fa-circle-info mt-1" style={{ color: "var(--pd-primary)" }} />
                <div className="text-secondary">
                  <strong className="text-dark">Data Privacy Retention:</strong>{" "}
                  {purgedLabels.join(", ")} image{purgedLabels.length > 1 ? "s were" : " was"} automatically disposed of after the retention period. Verified order metadata remains on record.
                </div>
              </div>
            )}

            <ZoomableImageModal
              isOpen={previewModalOpen}
              onClose={() => setPreviewModalOpen(false)}
              images={validAttachments}
              initialIndex={previewIndex}
            />
          </>
        );
      })()}

      {/* Payment Method Select (Conditional) */}
      {isReady && activeOrder.payment_method === 'gcash' && activeOrder.payment_status === 'unpaid' && (activeOrder.discount_id_image_url || activeOrder.discount_id_image_path || (activeOrder.items && activeOrder.items.some(i => i.order_item_prescription?.prescription_image_url || i.order_item_prescription?.prescription_image_path || i.order_item_prescription?.image_path))) && (
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

      {/* Bottom Action Area */}
      {isReady ? (
        <div className="mt-auto pt-2">
          <div className="d-flex align-items-center gap-2 mb-2 px-1 text-secondary" style={{ fontSize: "12px" }}>
            <input
              type="checkbox"
              id="pickupPrintReceipt"
              className="form-check-input mt-0"
              style={{ width: "15px", height: "15px", cursor: "pointer" }}
              checked={shouldPrintReceipt}
              onChange={(e) => setShouldPrintReceipt(e.target.checked)}
            />
            <label htmlFor="pickupPrintReceipt" className="user-select-none mb-0 fw-medium text-dark" style={{ cursor: "pointer" }}>
              Print thermal receipt after completion
            </label>
          </div>

          <button
            type="button"
            className="btn w-100 py-2 text-white fw-bold rounded-3"
            style={{ backgroundColor: "var(--pd-primary)", borderColor: "var(--pd-primary)", fontSize: 15 }}
            onClick={showEnterPayment ? onOpenPaymentModal : onCompleteSale}
          >
            {showEnterPayment ? "Enter Payment" : "Complete Sale"}
          </button>
        </div>
      ) : activeOrder && (activeOrder.status === 'completed' || activeOrder.status === 'Completed') ? (
        <div className="mt-auto pt-2">
          <button
            type="button"
            className="btn w-100 py-2 btn-outline-secondary fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-2"
            style={{ fontSize: 14 }}
            onClick={() => onPrintReceipt && onPrintReceipt(activeOrder.id)}
            disabled={loadingReceipt}
          >
            <i className="fa-solid fa-print" />
            <span>{loadingReceipt ? "Generating Receipt..." : "Print Receipt"}</span>
          </button>
        </div>
      ) : null}
    </aside>
  );
}

export default PickupOrderDetailsSidebar;
