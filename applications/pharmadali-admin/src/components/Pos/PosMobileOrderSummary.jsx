import React, { useState } from "react";
import { usePosContext } from "../../context/PosContext";

const getDiscountLabel = (type) => {
  if (!type || type === "none") return "";
  if (type === "senior") return "Senior Citizen";
  if (type === "pwd") return "PWD";
  if (type === "employee") return "Employee";
  if (type === "custom") return "Custom Policy";
  return type.charAt(0).toUpperCase() + type.slice(1);
};

export default function PosMobileOrderSummary() {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    orderItems: items,
    paymentMethod,
    paymentError,
    cashReceived,
    discountType,
    discountPercentage,
    openCompleteSaleModal,
  } = usePosContext();

  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.qty * item.selling_price,
    0
  );
  const discountPctNum = parseFloat(discountPercentage) || 0;
  const discountAmount =
    discountType !== "none"
      ? Math.round(subtotal * (discountPctNum / 100) * 100) / 100
      : 0;
  const netTotal = Math.max(0, subtotal - discountAmount);
  const isOrderEmpty = items.length === 0;

  const numericCash = Number(cashReceived);
  const hasFulfilledPayment =
    cashReceived !== "" && !Number.isNaN(numericCash) && numericCash > 0;

  return (
    <div className="d-block d-md-none">
      {isExpanded && (
        <div
          className="pos-mobile-summary-backdrop"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <div
        className={`pos-mobile-summary-container ${isExpanded ? "expanded" : "collapsed"
          }`}
      >
        {isExpanded && (
          <div
            className="d-flex justify-content-center py-1 cursor-pointer"
            onClick={() => setIsExpanded(false)}
          >
            <div className="pos-mobile-drag-handle" />
          </div>
        )}

        <div
          className="d-flex align-items-center justify-content-between px-3 py-2 pos-mobile-summary-header cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="fw-semibold pos-mobile-summary-title">
            Order Summary
          </span>
          <div className="d-flex align-items-center gap-2">
            {!isExpanded && (
              <span className="fw-bold pos-mobile-summary-total">
                {netTotal.toFixed(2)}
              </span>
            )}
            <i
              className={`fa-solid ${isExpanded ? "fa-chevron-down" : "fa-chevron-up"
                } pos-mobile-summary-icon`}
            />
          </div>
        </div>

        {isExpanded && (
          <div className="px-3 pt-2 pb-3 pos-mobile-summary-body">
            <div
              className="d-flex justify-content-between mb-2 text-muted"
              style={{ fontSize: 13 }}
            >
              <span>No. of Items</span>
              <span className="fw-medium text-dark">{totalQty}</span>
            </div>
            <div
              className="d-flex justify-content-between mb-2 text-muted"
              style={{ fontSize: 13 }}
            >
              <span>Order Subtotal</span>
              <span className="fw-medium text-dark">{subtotal.toFixed(2)}</span>
            </div>
            {discountType !== "none" && discountAmount > 0 && (
              <div
                className="d-flex justify-content-between mb-2 text-muted"
                style={{ fontSize: 13 }}
              >
                <span>Discount ({getDiscountLabel(discountType)})</span>
                <span className="fw-medium text-dark">
                  -{discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="my-2 border-top border-secondary-subtle" />

            <div
              className="d-flex justify-content-between align-items-center fw-bold mb-2"
              style={{ fontSize: 14, color: "#1e293b" }}
            >
              <span>Total Due</span>
              <span>{netTotal.toFixed(2)}</span>
            </div>

            {hasFulfilledPayment && (
              <>
                <div
                  className="d-flex justify-content-between align-items-center fw-semibold text-muted mb-1"
                  style={{ fontSize: 12 }}
                >
                  <span>Amount Paid</span>
                  <span className="text-dark">{numericCash.toFixed(2)}</span>
                </div>
                <div
                  className="d-flex justify-content-between align-items-center fw-semibold text-muted mb-2"
                  style={{ fontSize: 12 }}
                >
                  <span>Change</span>
                  <span className="text-dark">
                    {Math.max(0, numericCash - netTotal).toFixed(2)}
                  </span>
                </div>
              </>
            )}

            <button
              type="button"
              className="btn w-100 py-2.5 mt-2 pos-order-complete-btn fw-semibold"
              onClick={() => {
                setIsExpanded(false);
                openCompleteSaleModal();
              }}
              disabled={isOrderEmpty || (!!paymentError && !paymentMethod)}
            >
              Complete Sale
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
