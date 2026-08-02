/**
 * TransactionDetailModal
 *
 * Displays the details of a single selected sales transaction in an overlay modal.
 * Clicking the backdrop or the close button dismisses it.
 */
function TransactionDetailModal({ row, onClose }) {
  if (!row) return null;

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

        <h2 className="fw-semibold mb-3" style={{ color: "#48AAD9", fontSize: "22px" }}>
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
        <div className="d-flex justify-content-between fw-bold mb-3" style={{ fontSize: "15px" }}>
          <span>TOTAL</span>
          <span>{parseFloat(row.total).toFixed(2)}</span>
        </div>
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
