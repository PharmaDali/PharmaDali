import React from "react";

function ExchangeReceiptModal({ exchangeData, onClose }) {
  if (!exchangeData) return null;

  const handlePrint = () => {
    window.print();
  };

  const returnedItems = exchangeData.returned_items || exchangeData.returnedItems || [];
  const replacementItems = exchangeData.replacement_items || exchangeData.replacementItems || [];

  const returnedTotal = Number(exchangeData.total_returned_value || 0);
  const replacementTotal = Number(exchangeData.total_replacement_value || 0);
  const additionalPayment = Number(exchangeData.additional_payment || 0);
  const amountReceived = Number(exchangeData.amount_received || 0);
  const changeAmount = Number(exchangeData.change_amount || 0);

  const processedByName = exchangeData.processed_by?.first_name
    ? `${exchangeData.processed_by.first_name} ${exchangeData.processed_by.last_name || ""}`.trim()
    : exchangeData.processedBy || "Pharmacy Staff";

  const orderNumber =
    exchangeData.order?.order_number ||
    (exchangeData.order_id ? `#${exchangeData.order_id}` : "N/A");

  const formattedDate = new Date(exchangeData.created_at || Date.now()).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isLowerValueReturn = replacementTotal < returnedTotal;
  const excessForfeited = isLowerValueReturn ? Math.max(0, returnedTotal - replacementTotal) : 0;
  const isEqualExchange = Math.abs(replacementTotal - returnedTotal) < 0.01;

  const getConditionBadgeClass = (condition) => {
    switch (condition?.toLowerCase()) {
      case "resalable":
        return "bg-success-subtle text-success border border-success-subtle";
      case "damaged":
        return "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
      case "expired":
        return "bg-danger-subtle text-danger border border-danger-subtle";
      default:
        return "bg-secondary-subtle text-secondary border border-secondary-subtle";
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{
        backgroundColor: "rgba(16, 30, 44, 0.45)",
        backdropFilter: "blur(2px)",
        zIndex: 1060,
      }}
      onClick={onClose}
    >
      {/* Print Specific CSS for clean document breakdown */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-exchange-breakdown, .printable-exchange-breakdown * {
            visibility: visible;
          }
          .printable-exchange-breakdown {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 24px !important;
            color: #1e293b !important;
            background-color: #ffffff !important;
          }
          .d-print-none {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
        style={{ maxWidth: "680px", width: "95%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content border-0 shadow-lg printable-exchange-breakdown"
          style={{
            borderRadius: "20px",
            overflow: "hidden",
            fontFamily: "var(--pd-font-family, 'Poppins', sans-serif)",
          }}
        >
          {/* Modal Header */}
          <div className="modal-header border-0 px-4 pt-4 pb-2 align-items-start">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span
                  className="badge rounded-pill px-3 py-1 fw-semibold"
                  style={{ backgroundColor: "#e8f0fe", color: "#48aad9", fontSize: "13px" }}
                >
                  <i className="fa-solid fa-right-left me-1"></i> {exchangeData.exchange_number}
                </span>
                <span
                  className="badge rounded-pill bg-success-subtle text-success px-3 py-1 fw-semibold"
                  style={{ fontSize: "12px" }}
                >
                  <i className="fa-solid fa-circle-check me-1"></i> Completed
                </span>
              </div>
              <h4 className="modal-title fw-bold" style={{ color: "#48aad9", fontSize: "22px" }}>
                Item Exchange Breakdown
              </h4>
              <div className="text-muted small">
                Original Order Ref: <strong className="text-dark">{orderNumber}</strong>
              </div>
            </div>
            <button
              type="button"
              className="btn-close shadow-none d-print-none"
              onClick={onClose}
            ></button>
          </div>

          <hr className="my-1 mx-4" style={{ borderColor: "#e2e8f0" }} />

          {/* Modal Body */}
          <div className="modal-body px-4 py-3">
            {/* Metadata Summary Banner */}
            <div className="exchange-card-box p-3 mb-3 bg-light" style={{ fontSize: "13px" }}>
              <div className="row g-2">
                <div className="col-sm-6">
                  <span className="text-muted"><i className="fa-solid fa-user me-1"></i> Processed By:</span>{" "}
                  <strong className="text-dark">{processedByName}</strong>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted"><i className="fa-solid fa-calendar-days me-1"></i> Date & Time:</span>{" "}
                  <strong className="text-dark">{formattedDate}</strong>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted"><i className="fa-solid fa-credit-card me-1"></i> Payment Method:</span>{" "}
                  <span className="badge bg-secondary-subtle text-secondary text-uppercase px-2 py-1 ms-1">
                    {exchangeData.payment_method || "CASH"}
                  </span>
                </div>
                <div className="col-sm-6">
                  <span className="text-muted"><i className="fa-solid fa-circle-question me-1"></i> Reason:</span>{" "}
                  <span className="badge bg-info-subtle text-info-emphasis px-2 py-1 text-uppercase fw-semibold ms-1">
                    {exchangeData.reason || "Item Exchange"}
                  </span>
                </div>
                {exchangeData.notes && (
                  <div className="col-12 mt-1">
                    <span className="text-muted"><i className="fa-solid fa-note-sticky me-1"></i> Notes:</span>{" "}
                    <span className="text-dark fst-italic">{exchangeData.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Returned Items Card */}
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: "13px" }}>
                  <i className="fa-solid fa-arrow-rotate-left text-danger"></i>
                  Returned Items
                </h6>
                <span className="badge bg-danger-subtle text-danger fw-semibold px-2 py-1" style={{ fontSize: "11px" }}>
                  Credit: -PHP {returnedTotal.toFixed(2)}
                </span>
              </div>
              <div className="exchange-card-box">
                <div className="table-responsive">
                  <table className="table exchange-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Item Details</th>
                        <th className="text-center">Condition</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Unit Price</th>
                        <th className="text-end">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnedItems.map((item, idx) => {
                        const name =
                          item.pharmacy_product?.product?.product_name ||
                          item.product_name ||
                          "Returned Item";
                        const cond = item.condition || "resalable";
                        const qty = item.quantity || 1;
                        const price = Number(item.unit_price_snapshot || 0);
                        const subtotal = Number(item.subtotal || price * qty);

                        return (
                          <tr key={idx}>
                            <td className="fw-medium text-dark">{name}</td>
                            <td className="text-center">
                              <span
                                className={`badge rounded-pill text-uppercase px-2 py-1 ${getConditionBadgeClass(
                                  cond
                                )}`}
                                style={{ fontSize: "10px" }}
                              >
                                {cond}
                              </span>
                            </td>
                            <td className="text-center fw-semibold">{qty}</td>
                            <td className="text-end text-muted">PHP {price.toFixed(2)}</td>
                            <td className="text-end fw-bold text-danger">-PHP {subtotal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="table-light border-top">
                      <tr>
                        <td colSpan="4" className="fw-bold text-dark">
                          Total Return Credit Available
                        </td>
                        <td className="text-end fw-bold text-danger">
                          -PHP {returnedTotal.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Replacement Items Card */}
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: "13px" }}>
                  <i className="fa-solid fa-boxes-stacked" style={{ color: "#48aad9" }}></i>
                  Replacement Items
                </h6>
                <span className="badge bg-primary-subtle fw-semibold px-2 py-1" style={{ color: "#48aad9", fontSize: "11px" }}>
                  Cost: PHP {replacementTotal.toFixed(2)}
                </span>
              </div>
              <div className="exchange-card-box">
                <div className="table-responsive">
                  <table className="table exchange-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Item Details</th>
                        <th className="text-center">Qty</th>
                        <th className="text-end">Unit Price</th>
                        <th className="text-end">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {replacementItems.map((item, idx) => {
                        const name =
                          item.pharmacy_product?.product?.product_name ||
                          item.product_name ||
                          "Replacement Item";
                        const qty = item.quantity || 1;
                        const price = Number(item.unit_price_snapshot || 0);
                        const subtotal = Number(item.subtotal || price * qty);

                        return (
                          <tr key={idx}>
                            <td className="fw-medium text-dark">{name}</td>
                            <td className="text-center fw-semibold">{qty}</td>
                            <td className="text-end text-muted">PHP {price.toFixed(2)}</td>
                            <td className="text-end fw-bold text-dark">PHP {subtotal.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="table-light border-top">
                      <tr>
                        <td colSpan="3" className="fw-bold text-dark">
                          Total Replacements Value
                        </td>
                        <td className="text-end fw-bold text-dark">
                          PHP {replacementTotal.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Financial Settlement Breakdown Card */}
            <div className="exchange-card-box p-3 bg-light mb-2" style={{ fontSize: "13px" }}>
              <h6 className="fw-bold text-dark mb-3" style={{ fontSize: "14px" }}>
                <i className="fa-solid fa-receipt me-2" style={{ color: "#48aad9" }}></i> Financial Settlement
              </h6>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Return Credit Applied:</span>
                <span className="fw-bold text-danger">-PHP {returnedTotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Replacement Items Total:</span>
                <span className="fw-bold text-dark">PHP {replacementTotal.toFixed(2)}</span>
              </div>

              <hr className="my-2" style={{ borderColor: "#e2e8f0" }} />

              {additionalPayment > 0 ? (
                <>
                  <div className="d-flex justify-content-between align-items-center py-1">
                    <span className="fw-bold text-dark fs-6">Additional Amount Paid:</span>
                    <span className="fw-bold fs-5" style={{ color: "#48aad9" }}>
                      PHP {additionalPayment.toFixed(2)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between text-muted mt-1">
                    <span>Amount Tendered / Received:</span>
                    <span className="fw-semibold text-dark">PHP {amountReceived.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between text-muted mt-1">
                    <span>Change Given:</span>
                    <span className="fw-bold text-success">PHP {changeAmount.toFixed(2)}</span>
                  </div>
                </>
              ) : isEqualExchange ? (
                <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mb-0 rounded-3 border-0 small">
                  <i className="fa-solid fa-circle-check text-success fs-5"></i>
                  <div>
                    <strong>Equal Value Exchange:</strong> The credit from returned items exactly matches the replacement items total. No additional payment was required.
                  </div>
                </div>
              ) : (
                <div className="alert alert-warning d-flex align-items-start gap-2 py-2 px-3 mb-0 rounded-3 border-0 small text-warning-emphasis">
                  <i className="fa-solid fa-shield-halved mt-1 fs-5"></i>
                  <div>
                    <strong>No Cash Refund Policy:</strong> Replacements cost less than returned items.
                    Excess credit of <strong>PHP {excessForfeited.toFixed(2)}</strong> was forfeited per store policy. Cash refund issued: <strong>PHP 0.00</strong>.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer border-0 px-4 pb-4 pt-2 d-flex justify-content-end gap-2 d-print-none">
            <button
              type="button"
              className="btn btn-cancel-step px-4"
              onClick={onClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary-step px-4 shadow-sm"
              onClick={handlePrint}
            >
              <i className="fa-solid fa-print me-2"></i> Print Breakdown
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExchangeReceiptModal;
