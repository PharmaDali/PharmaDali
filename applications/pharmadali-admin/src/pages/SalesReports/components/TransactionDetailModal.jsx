/**
 * TransactionDetailModal
 *
 * Displays the details of a single selected sales transaction in an overlay modal.
 * Clicking the backdrop or the close button dismisses it.
 */
function TransactionDetailModal({ row, onClose }) {
  if (!row) return null;

  const discountLabelMap = {
    senior: "Senior Citizen",
    pwd: "PWD (Person With Disability)",
    employee: "Employee Discount",
    custom: "Custom Policy Discount",
  };
  const discountLabel = discountLabelMap[row.discountType] || "Discount";
  const discountAmount = Number(row.discountAmount || 0);
  const hasDiscount = discountAmount > 0 || (row.discountType && row.discountType !== "none");

  // Sum of original item prices (Gross Subtotal before discount)
  const itemsSum = row.orderItems?.reduce((sum, item) => sum + Number(item.subtotal || 0), 0) || 0;
  const grossSubtotal = itemsSum > 0 
    ? itemsSum 
    : (row.subtotal && Number(row.subtotal) > Number(row.total) 
        ? Number(row.subtotal) 
        : Number(row.total || 0) + discountAmount);

  const netTotal = Number(row.total || 0);

  return (
    <div
      className="modal d-flex align-items-center justify-content-center"
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3 p-4 position-relative overflow-auto"
        style={{ maxWidth: 800, width: "90%", maxHeight: "80vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn-close position-absolute top-0 end-0 m-3" onClick={onClose} />

        <h2 className="fw-semibold mb-3" style={{ color: "#2aabe2", fontSize: "22px" }}>
          Transaction Details
        </h2>
        <hr />

        <div className="d-flex justify-content-between mb-3">
          <span className="text-secondary" style={{ fontSize: "13px" }}>Order ID</span>
          <span className="fw-semibold">{row.id}</span>
        </div>

        {/* Items grid header */}
        <div className="report-modal-grid fw-semibold text-secondary mb-2" style={{ fontSize: "13px" }}>
          <span>Items</span>
          <span>Qty</span>
          <span>Price</span>
          <span>Subtotal</span>
        </div>

        {row.orderItems?.map((item, idx) => (
          <div key={idx} className="report-modal-grid py-2 border-bottom" style={{ fontSize: "13px" }}>
            <span>{item.name}</span>
            <span>{item.qty}</span>
            <span>{parseFloat(item.price).toFixed(2)}</span>
            <span>{parseFloat(item.subtotal).toFixed(2)}</span>
          </div>
        ))}

        <hr />
        
        {/* Financial Statement & Discount Breakdown */}
        {hasDiscount ? (
          <>
            <div className="d-flex justify-content-between mb-1" style={{ fontSize: "14px" }}>
              <span className="text-secondary">Subtotal (Original Price)</span>
              <span className="fw-semibold">PHP {grossSubtotal.toFixed(2)}</span>
            </div>

            <div className="d-flex justify-content-between mb-1" style={{ fontSize: "13px" }}>
              <span className="text-secondary">Discount Type</span>
              <span className="fw-medium text-dark">{discountLabel}</span>
            </div>

            {row.discountPercentage > 0 && (
              <div className="d-flex justify-content-between mb-1" style={{ fontSize: "13px" }}>
                <span className="text-secondary">Discount Rate</span>
                <span className="fw-medium text-dark">{row.discountPercentage}%</span>
              </div>
            )}

            <div className="d-flex justify-content-between mb-1 text-danger" style={{ fontSize: "14px" }}>
              <span>Discount Amount</span>
              <span className="fw-semibold">-PHP {discountAmount.toFixed(2)}</span>
            </div>

            {row.discountIdNumber && (
              <div className="d-flex justify-content-between mb-1 text-muted" style={{ fontSize: "12px" }}>
                <span>ID Card No.</span>
                <span className="fw-medium">{row.discountIdNumber}</span>
              </div>
            )}

            {row.discountRemarks && (
              <div className="d-flex justify-content-between mb-1 text-muted" style={{ fontSize: "12px" }}>
                <span>Remarks</span>
                <span className="fw-medium">{row.discountRemarks}</span>
              </div>
            )}

            <div className="d-flex justify-content-between fw-bold my-2 pt-2 border-top" style={{ fontSize: "16px", color: "#2aabe2" }}>
              <span>DISCOUNTED PRICE</span>
              <span>PHP {netTotal.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <div className="d-flex justify-content-between fw-bold my-2" style={{ fontSize: "16px", color: "#2aabe2" }}>
            <span>TOTAL AMOUNT</span>
            <span>PHP {netTotal.toFixed(2)}</span>
          </div>
        )}
        <hr />

        <div className="d-flex justify-content-between mb-2">
          <span className="text-secondary" style={{ fontSize: "13px" }}>Processed By</span>
          <span className="fw-medium" style={{ fontSize: "14px" }}>{row.processedBy}</span>
        </div>
        <div className="d-flex justify-content-between">
          <span className="text-secondary" style={{ fontSize: "13px" }}>Date</span>
          <span className="fw-medium" style={{ fontSize: "14px" }}>{row.date}</span>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetailModal;
