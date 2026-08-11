import React, { useState } from "react";

function ExchangeReceiptModal({ exchangeData, onClose }) {
  const [closeBtnHovered, setCloseBtnHovered] = useState(false);
  const [printBtnHovered, setPrintBtnHovered] = useState(false);

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

  return (
    <div
      className="modal d-flex align-items-center justify-content-center"
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1060 }}
      onClick={onClose}
    >
      {/* Print Specific CSS to ensure crisp black-and-white thermal printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-exchange-receipt, .printable-exchange-receipt * {
            visibility: visible;
          }
          .printable-exchange-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            color: #000000 !important;
            background-color: #ffffff !important;
          }
          .d-print-none {
            display: none !important;
          }
        }
      `}</style>

      <div
        className="bg-white rounded-3 p-4 position-relative overflow-auto shadow-lg printable-exchange-receipt"
        style={{ maxWidth: 480, width: "95%", maxHeight: "90vh", color: "#000000", fontFamily: "'Courier New', Courier, monospace" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn-close position-absolute top-0 end-0 m-3 d-print-none" onClick={onClose} />

        {/* Monochromatic Black & White Store Header */}
        <div className="text-center mb-3">
          <h4 className="fw-bold mb-1 text-uppercase tracking-wide" style={{ color: "#000000", letterSpacing: "1px" }}>
            PHARMADALI PHARMACY
          </h4>
          <div className="fw-bold text-uppercase border-top border-bottom border-dark py-1 my-2" style={{ fontSize: "14px", color: "#000000" }}>
            OFFICIAL ITEM EXCHANGE SLIP
          </div>
          <div className="fw-semibold text-uppercase" style={{ fontSize: "11px", color: "#000000" }}>
            *** STORE POLICY: NO CASH REFUNDS ***
          </div>
        </div>

        {/* Receipt Metadata */}
        <div className="mb-3 border-bottom border-dark pb-2" style={{ fontSize: "12px", lineHeight: "1.5" }}>
          <div className="d-flex justify-content-between">
            <span>Exchange No:</span>
            <span className="fw-bold">{exchangeData.exchange_number}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Original Order Ref:</span>
            <span className="fw-bold">{exchangeData.order?.order_number || `#${exchangeData.order_id}`}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Processed By:</span>
            <span className="fw-bold">
              {exchangeData.processed_by?.first_name 
                ? `${exchangeData.processed_by.first_name} ${exchangeData.processed_by.last_name}` 
                : (exchangeData.processedBy || "Cashier/Staff")}
            </span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Date &amp; Time:</span>
            <span>{new Date(exchangeData.created_at || Date.now()).toLocaleString("en-PH")}</span>
          </div>
          {exchangeData.reason && (
            <div className="d-flex justify-content-between">
              <span>Reason:</span>
              <span className="fw-bold text-uppercase">{exchangeData.reason}</span>
            </div>
          )}
        </div>

        {/* Returned Items Section */}
        <div className="mb-3">
          <div className="fw-bold text-uppercase mb-1" style={{ fontSize: "12px", borderBottom: "1px dashed #000000" }}>
            [RETURNED ITEMS]
          </div>
          <table className="table table-sm table-borderless mb-1 text-dark" style={{ fontSize: "12px", fontFamily: "inherit" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #000000" }}>
                <th className="p-0">ITEM</th>
                <th className="p-0 text-center">QTY</th>
                <th className="p-0 text-center">COND</th>
                <th className="p-0 text-end">CREDIT</th>
              </tr>
            </thead>
            <tbody>
              {returnedItems.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px dotted #cccccc" }}>
                  <td className="p-0 py-1">
                    {item.pharmacy_product?.product?.product_name || item.product_name || "Returned Product"}
                  </td>
                  <td className="p-0 py-1 text-center">{item.quantity}</td>
                  <td className="p-0 py-1 text-center text-uppercase" style={{ fontSize: "10px" }}>
                    [{item.condition || "resalable"}]
                  </td>
                  <td className="p-0 py-1 text-end fw-bold">
                    -PHP {Number(item.subtotal || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="d-flex justify-content-between fw-bold pt-1" style={{ fontSize: "12px" }}>
            <span>TOTAL RETURN CREDIT:</span>
            <span>-PHP {returnedTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Replacement Items Section */}
        <div className="mb-3">
          <div className="fw-bold text-uppercase mb-1" style={{ fontSize: "12px", borderBottom: "1px dashed #000000" }}>
            [REPLACEMENT ITEMS]
          </div>
          <table className="table table-sm table-borderless mb-1 text-dark" style={{ fontSize: "12px", fontFamily: "inherit" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #000000" }}>
                <th className="p-0">ITEM</th>
                <th className="p-0 text-center">QTY</th>
                <th className="p-0 text-end">PRICE</th>
                <th className="p-0 text-end">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              {replacementItems.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: "1px dotted #cccccc" }}>
                  <td className="p-0 py-1">
                    {item.pharmacy_product?.product?.product_name || "Replacement Product"}
                  </td>
                  <td className="p-0 py-1 text-center">{item.quantity}</td>
                  <td className="p-0 py-1 text-end">PHP {Number(item.unit_price_snapshot || 0).toFixed(2)}</td>
                  <td className="p-0 py-1 text-end fw-bold">PHP {Number(item.subtotal || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="d-flex justify-content-between fw-bold pt-1" style={{ fontSize: "12px" }}>
            <span>TOTAL REPLACEMENTS:</span>
            <span>PHP {replacementTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Financial Statement Breakdown */}
        <div className="border-top border-dark pt-2 mb-3" style={{ fontSize: "12px", lineHeight: "1.6" }}>
          <div className="d-flex justify-content-between">
            <span>Returned Credit:</span>
            <span>-PHP {returnedTotal.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Replacement Total:</span>
            <span>PHP {replacementTotal.toFixed(2)}</span>
          </div>

          {replacementTotal > returnedTotal ? (
            <>
              <div className="d-flex justify-content-between fw-bold border-top border-dark pt-1 mt-1" style={{ fontSize: "13px" }}>
                <span>ADDITIONAL AMOUNT DUE:</span>
                <span>PHP {additionalPayment.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Payment Method:</span>
                <span className="text-uppercase">{exchangeData.payment_method || "CASH"}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Amount Received:</span>
                <span>PHP {amountReceived.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold">
                <span>CHANGE GIVEN:</span>
                <span>PHP {changeAmount.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <div className="border border-dark p-2 my-2 text-center" style={{ fontSize: "11px", backgroundColor: "#ffffff" }}>
              <div className="fw-bold">NO CASH REFUND ISSUED</div>
              <div>Excess Return Credit Forfeited: PHP {(returnedTotal - replacementTotal).toFixed(2)}</div>
              <div className="fw-bold mt-1">CASH REFUND = PHP 0.00</div>
            </div>
          )}
        </div>

        {/* Footer Disclaimers */}
        <div className="text-center border-top border-dark pt-2" style={{ fontSize: "11px" }}>
          <div className="fw-bold text-uppercase mb-1">THANK YOU FOR SHOPPING AT PHARMADALI!</div>
          <div>Please keep this slip for your item exchange record.</div>
          <div className="fw-bold mt-1">*** END OF EXCHANGE SLIP ***</div>
        </div>

        {/* Screen Action Buttons */}
        <div className="d-flex gap-2 justify-content-end mt-4 pt-3 border-top d-print-none">
          <button
            className="btn btn-sm px-3 fw-semibold rounded-3"
            style={{
              backgroundColor: closeBtnHovered ? "#6c757d" : "#ffffff",
              color: closeBtnHovered ? "#ffffff" : "#6c757d",
              border: "1.5px solid #6c757d",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseEnter={() => setCloseBtnHovered(true)}
            onMouseLeave={() => setCloseBtnHovered(false)}
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="btn btn-sm px-4 text-white fw-semibold rounded-3 shadow-sm"
            style={{
              backgroundColor: printBtnHovered ? "#1b6f94" : "#2aabe2",
              borderColor: printBtnHovered ? "#1b6f94" : "#2aabe2",
              transition: "all 0.2s ease-in-out",
            }}
            onMouseEnter={() => setPrintBtnHovered(true)}
            onMouseLeave={() => setPrintBtnHovered(false)}
            onClick={handlePrint}
          >
            <i className="fa-solid fa-print me-2"></i> Print Slip
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExchangeReceiptModal;
