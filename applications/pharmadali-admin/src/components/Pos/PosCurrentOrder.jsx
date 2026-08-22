import React from "react";
import { usePosContext } from "../../context/PosContext";
import PosEmptyState from "./PosEmptyState";
import { DiscountControl } from "../../shared/components/DiscountSelect";
import PaymentMethodSelect from "../../shared/components/PaymentMethodSelect";
import { toTitleCase } from "../../utils/stringUtils";

const ORDER_COL_WIDTHS = ["50%", "25%", "25%"];

const getFullProductName = (product) => {
  if (!product) return "---";
  const parts = [
    product.product_name,
    product.generic_name,
    product.brand_name ? `(${product.brand_name})` : null,
    product.form,
    product.strength,
    product.size,
  ];
  return toTitleCase(parts.filter(Boolean).join(" "));
};

const getDiscountLabel = (type) => {
  if (!type || type === "none") return "";
  if (type === "senior") return "Senior Citizen";
  if (type === "pwd") return "PWD";
  if (type === "employee") return "Employee";
  if (type === "custom") return "Custom Policy";
  return type.charAt(0).toUpperCase() + type.slice(1);
};

export default function PosCurrentOrder() {
  const {
    orderItems: items,
    paymentMethod,
    setPaymentMethod,
    paymentError,
    cashReceived,
    discountType,
    setDiscountType,
    discountPercentage,
    setDiscountPercentage,
    discountIdNumber,
    setDiscountIdNumber,
    removeFromOrder,
    openCompleteSaleModal,
    handleSelectPaymentMethod,
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

  if (isOrderEmpty) {
    return (
      <div
        className="card border-1 shadow-sm rounded-4 overflow-hidden"
        style={{
          height: "100%",
          minHeight: "380px",
          border: "1px solid #e2e8f0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="card-body d-flex flex-column align-items-center justify-content-center p-0"
          style={{ flex: 1, minHeight: 0, height: "100%" }}
        >
          <PosEmptyState
            minHeight="100%"
            iconWidth={100}
            className="pos-order-empty-state"
            message="Search for items"
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div
        className="card border-1 shadow-sm pos-order-items-card rounded-4 overflow-hidden"
        style={{
          flex: "0 0 auto",
          height: "225px",
          minHeight: "225px",
          maxHeight: "225px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          marginBottom: "0.75rem",
        }}
      >
        <table className="table mb-0" style={{ fontSize: 13, tableLayout: "fixed" }}>
          <colgroup>
            {ORDER_COL_WIDTHS.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th className="px-3 py-2 fw-semibold border-0 text-start" style={{ color: "#334155" }}>
                Product
              </th>
              <th className="px-2 py-2 fw-semibold border-0 text-center" style={{ color: "#334155" }}>
                Qty
              </th>
              <th className="px-3 py-2 fw-semibold border-0 text-end" style={{ color: "#334155" }}>
                Subtotal
              </th>
            </tr>
          </thead>
        </table>

        <div
          className="pos-scroll pos-order-items-scroll"
          style={{ height: "185px", minHeight: "185px", maxHeight: "185px", overflowY: "auto" }}
        >
          <table className="table table-hover mb-0" style={{ fontSize: 13, tableLayout: "fixed" }}>
            <colgroup>
              {ORDER_COL_WIDTHS.map((w, i) => (
                <col key={i} style={{ width: w }} />
              ))}
            </colgroup>
            <tbody>
              {items.map(({ id, product, qty, selling_price }) => (
                <tr key={id}>
                  <td className="px-3 py-2 border-0 border-bottom text-start" style={{ color: "#333", fontWeight: 500 }}>
                    {getFullProductName(product)}
                  </td>
                  <td className="px-2 py-2 border-0 border-bottom text-center" style={{ color: "#333" }}>
                    {qty}
                  </td>
                  <td className="px-3 py-2 border-0 border-bottom text-end" style={{ color: "#333" }}>
                    <div className="d-flex align-items-center justify-content-end gap-2">
                      <span>{(qty * selling_price).toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => removeFromOrder(id)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          color: "#e25252",
                          fontSize: 16,
                          fontWeight: "bold",
                          lineHeight: 1,
                        }}
                        title="Remove item"
                      >
                        &times;
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reusable Discount Component */}
      <DiscountControl
        discountType={discountType}
        setDiscountType={setDiscountType}
        discountPercentage={discountPercentage}
        setDiscountPercentage={setDiscountPercentage}
        discountIdNumber={discountIdNumber}
        setDiscountIdNumber={setDiscountIdNumber}
        className="mb-2"
      />

      {/* Payment Method Select */}
      <PaymentMethodSelect
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onSelectPaymentMethod={handleSelectPaymentMethod}
        error={paymentError}
        className="mb-2"
        title="Payment Method"
      />

      {/* Order Breakdown at bottom of Payment Method */}
      <div className="px-2 pt-2 pb-1 pos-order-breakdown mt-1" style={{ fontSize: 13, color: "#444444" }}>
        <div className="d-flex justify-content-between mb-1">
          <span style={{ color: "#444444" }}>No. of Items</span>
          <span style={{ color: "#444444", fontWeight: 500 }}>{totalQty}</span>
        </div>
        <div className="d-flex justify-content-between mb-1">
          <span style={{ color: "#444444" }}>Order Subtotal</span>
          <span style={{ color: "#444444", fontWeight: 500 }}>{subtotal.toFixed(2)}</span>
        </div>
        {discountType !== "none" && discountAmount > 0 && (
          <div className="d-flex justify-content-between mb-1">
            <span style={{ color: "#444444" }}>Discount ({getDiscountLabel(discountType)})</span>
            <span style={{ color: "#444444", fontWeight: 500 }}>-{discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div style={{ height: "1px", backgroundColor: "#D9D9D9", margin: "8px 0", width: "100%" }} />
        <div className="d-flex justify-content-between align-items-center fw-semibold" style={{ fontSize: 13 }}>
          <span style={{ color: "#444444" }}>Total Due</span>
          <span style={{ color: "#444444" }}>{netTotal.toFixed(2)}</span>
        </div>
        {hasFulfilledPayment && (
          <>
            <div className="d-flex justify-content-between align-items-center fw-semibold mt-1" style={{ fontSize: 12 }}>
              <span style={{ color: "#444444" }}>Amount Paid</span>
              <span style={{ color: "#444444" }}>{numericCash.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center fw-semibold mt-1" style={{ fontSize: 12 }}>
              <span style={{ color: "#444444" }}>Change</span>
              <span style={{ color: "#444444" }}>{Math.max(0, numericCash - netTotal).toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        className="btn w-100 py-2 mt-auto pos-order-complete-btn"
        onClick={openCompleteSaleModal}
        disabled={isOrderEmpty || (!!paymentError && !paymentMethod)}
      >
        Complete Sale
      </button>
    </div>
  );
}
