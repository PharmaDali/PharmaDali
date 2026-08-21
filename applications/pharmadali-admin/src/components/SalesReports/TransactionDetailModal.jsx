import { useState, useEffect } from "react";
import { fetchOrderExchangeEligibility } from "../../services/itemExchangeService";

function TransactionDetailModal({ row, onClose, onOpenExchange }) {
  const [btnHovered, setBtnHovered] = useState(false);
  const [eligibilityState, setEligibilityState] = useState(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);

  useEffect(() => {
    if (!row) return;

    if (row.has_exchange || row.status === 'exchanged') {
      setEligibilityState({ eligible: false, reason: "This order has already been exchanged." });
      setLoadingEligibility(false);
      return;
    }

    let isMounted = true;
    setLoadingEligibility(true);
    const orderId = row.order_id || row.id;

    fetchOrderExchangeEligibility(orderId)
      .then((res) => {
        if (!isMounted) return;
        const eligibilityData = res?.data ?? res;
        const isSuccess = res?.success ?? true;
        if (isSuccess && eligibilityData?.eligible) {
          setEligibilityState({ eligible: true });
        } else {
          const msg = eligibilityData?.reason || res?.message || "This order is not eligible for an exchange under current store policy.";
          setEligibilityState({ eligible: false, reason: msg });
        }
      })
      .catch((err) => {
        if (isMounted) {
          const msg = err?.message || err?.data?.message || "This order is not eligible for an exchange under current store policy.";
          setEligibilityState({ eligible: false, reason: msg });
        }
      })
      .finally(() => {
        if (isMounted) setLoadingEligibility(false);
      });

    return () => {
      isMounted = false;
    };
  }, [row?.id]);

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

        <div className="d-flex justify-content-between mb-2">
          <span className="text-secondary" style={{ fontSize: "13px" }}>Order ID</span>
          <span className="fw-semibold">{row.id}</span>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="text-secondary" style={{ fontSize: "13px" }}>Status</span>
          {row.has_exchange || row.status === 'exchanged' ? (
            <span className="badge text-white shadow-sm" style={{ backgroundColor: "#2aabe2", fontSize: "12px" }}>
              <i className="fa-solid fa-right-left me-1"></i> Item Exchanged
            </span>
          ) : (
            <span className="badge bg-success shadow-sm" style={{ fontSize: "12px" }}>
              Completed
            </span>
          )}
        </div>

        {/* Items grid header */}
        <div className="report-modal-grid fw-semibold text-secondary mb-2" style={{ fontSize: "13px" }}>
          <span>Items</span>
          <span>Qty</span>
          <span>Price</span>
          <span>Subtotal</span>
        </div>
        <hr className="my-1" />

        {/* Items list */}
        <div className="mb-3">
          {row.orderItems?.map((item, index) => (
            <div key={index} className="report-modal-grid py-2 border-bottom align-items-center" style={{ fontSize: "13px" }}>
              <span className="fw-medium text-dark">{item.name}</span>
              <span>{item.qty}</span>
              <span>PHP {Number(item.price).toFixed(2)}</span>
              <span className="fw-semibold">PHP {Number(item.subtotal).toFixed(2)}</span>
            </div>
          ))}
        </div>
        
        {/* Financial calculations */}
        {hasDiscount ? (
          <>
            <div className="d-flex justify-content-between text-secondary mb-1" style={{ fontSize: "13px" }}>
              <span>GROSS SUBTOTAL</span>
              <span>PHP {grossSubtotal.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between text-success mb-1" style={{ fontSize: "13px" }}>
              <span>DISCOUNT ({discountLabel})</span>
              <span>-PHP {discountAmount.toFixed(2)}</span>
            </div>

            {row.discountIdNumber && (
              <div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: "12px" }}>
                <span>ID / SC / PWD NO.</span>
                <span>{row.discountIdNumber}</span>
              </div>
            )}
            {row.discountRemarks && (
              <div className="d-flex justify-content-between text-muted mb-1" style={{ fontSize: "12px" }}>
                <span>DISCOUNT REMARKS</span>
                <span>{row.discountRemarks}</span>
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

        {/* Exchange Action Button / Ineligible State */}
        {onOpenExchange && (
          <>
            {row.has_exchange || row.status === 'exchanged' || eligibilityState?.eligible === false ? (
              <div className="mt-3">
                <button
                  disabled
                  className="btn btn-light w-100 d-flex align-items-center justify-content-center text-muted border rounded-3 py-2 fw-medium shadow-none"
                  style={{ cursor: "not-allowed", backgroundColor: "#f8f9fa", borderColor: "#dee2e6" }}
                >
                  <i className="fa-solid fa-ban me-2 text-secondary"></i> Not Eligible for Exchange
                </button>
                <div className="small text-muted text-center mt-2" style={{ fontSize: "12px" }}>
                  <i className="fa-solid fa-circle-info me-1" style={{ color: "#2aabe2" }}></i> 
                  {row.has_exchange || row.status === 'exchanged' 
                    ? "This order has already been exchanged." 
                    : (eligibilityState?.reason || "This order is not eligible for an item exchange.")}{" "}
                  Exchange rules can be configured in <strong>Settings</strong>.
                </div>
              </div>
            ) : loadingEligibility ? (
              <div className="mt-3">
                <button
                  disabled
                  className="btn btn-light w-100 d-flex align-items-center justify-content-center text-secondary border rounded-3 py-2 fw-medium shadow-none"
                  style={{ backgroundColor: "#f8f9fa", borderColor: "#dee2e6", fontSize: "13px" }}
                >
                  <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: "#2aabe2" }} />
                  Checking Exchange Eligibility...
                </button>
              </div>
            ) : (
              <button
                className="btn w-100 mt-3 d-flex align-items-center justify-content-center fw-semibold rounded-3 shadow-sm"
                style={{
                  backgroundColor: btnHovered ? "#2aabe2" : "#ffffff",
                  color: btnHovered ? "#ffffff" : "#2aabe2",
                  border: "1.5px solid #2aabe2",
                  transition: "all 0.2s ease-in-out",
                }}
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
                onClick={() => onOpenExchange(row)}
              >
                <i className="fa-solid fa-right-left me-2"></i> Process Change Item / Exchange
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TransactionDetailModal;
