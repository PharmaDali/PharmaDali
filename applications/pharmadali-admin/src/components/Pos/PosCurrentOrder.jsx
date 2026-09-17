import React from "react";
import { usePosContext } from "../../context/PosContext";
import { DiscountControl } from "../../shared/components/DiscountSelect";
import PaymentMethodSelect from "../../shared/components/PaymentMethodSelect";
import { toTitleCase } from "../../utils/stringUtils";

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
    totalQty,
    subtotal,
    discountableSubtotal,
    hasDiscountableItems,
    discountAmount,
    orderTotal: netTotal,
    isItemDiscountable,
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
    printAfterPayment,
    shouldPrintReceipt,
    setShouldPrintReceipt,
  } = usePosContext();

  const isOrderEmpty = items.length === 0;

  const numericCash = Number(cashReceived);
  const hasFulfilledPayment =
    cashReceived !== "" && !Number.isNaN(numericCash) && numericCash > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div
        className="card border-1 shadow-sm pos-order-items-card rounded-4 overflow-hidden"
        style={{
          flex: "0 0 auto",
          maxHeight: "225px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          marginBottom: "0.75rem",
        }}
      >
        <div
          className="pos-scroll pos-order-table-scroll pos-order-items-scroll"
          style={{
            maxHeight: "225px",
            overflowX: "auto",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <table
            className="table table-hover mb-0 align-middle"
            style={{ fontSize: 13, minWidth: "380px", width: "100%", tableLayout: "fixed" }}
          >
            <colgroup>
              <col style={{ width: "40%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "24%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
              <tr style={{ background: "#eef7fc" }}>
                <th
                  className="px-3 py-2 fw-semibold border-0 text-start text-nowrap"
                  style={{
                    color: "#334155",
                    background: "#eef7fc",
                    whiteSpace: "nowrap",
                  }}
                >
                  Product
                </th>
                <th
                  className="px-2 py-2 fw-semibold border-0 text-center text-nowrap"
                  style={{
                    color: "#334155",
                    background: "#eef7fc",
                    whiteSpace: "nowrap",
                  }}
                >
                  Qty
                </th>
                <th
                  className="px-2 py-2 fw-semibold border-0 text-end text-nowrap"
                  style={{
                    color: "#334155",
                    background: "#eef7fc",
                    whiteSpace: "nowrap",
                  }}
                >
                  Price (PHP)
                </th>
                <th
                  className="px-3 py-2 fw-semibold border-0 text-end text-nowrap"
                  style={{
                    color: "#334155",
                    background: "#eef7fc",
                    whiteSpace: "nowrap",
                  }}
                >
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {isOrderEmpty ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-4 border-0 text-muted"
                    style={{ height: "140px", verticalAlign: "middle" }}
                  >
                    <span style={{ fontSize: "13px", color: "#888888" }}>
                      No items added
                    </span>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isDiscountable = isItemDiscountable ? isItemDiscountable(item) : true;
                  return (
                    <tr key={item.id}>
                      <td
                        className="px-3 py-2 border-0 border-bottom text-start text-truncate"
                        style={{ color: "#333", fontWeight: 500 }}
                      >
                        <div className="d-flex align-items-center gap-1">
                          <span className="text-truncate">{getFullProductName(item.product)}</span>
                          {!isDiscountable && (
                            <span
                              className="badge bg-secondary-subtle text-secondary fw-normal flex-shrink-0"
                              style={{ fontSize: "9px" }}
                              title="Non-discountable product"
                            >
                              Non-discountable
                            </span>
                          )}
                        </div>
                      </td>
                      <td
                        className="px-2 py-2 border-0 border-bottom text-center"
                        style={{ color: "#333" }}
                      >
                        {item.qty}
                      </td>
                      <td
                        className="px-2 py-2 border-0 border-bottom text-end"
                        style={{ color: "#333" }}
                      >
                        {parseFloat(item.selling_price).toFixed(2)}
                      </td>
                      <td
                        className="px-3 py-2 border-0 border-bottom text-end"
                        style={{ color: "#333" }}
                      >
                        <div className="d-flex align-items-center justify-content-end gap-2">
                          <span>{(item.qty * item.selling_price).toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => removeFromOrder(item.id)}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isOrderEmpty && (
        <DiscountControl
          discountType={discountType}
          setDiscountType={setDiscountType}
          discountPercentage={discountPercentage}
          setDiscountPercentage={setDiscountPercentage}
          discountIdNumber={discountIdNumber}
          setDiscountIdNumber={setDiscountIdNumber}
          className="mb-2"
          disabled={!hasDiscountableItems}
        />
      )}

      <PaymentMethodSelect
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        onSelectPaymentMethod={handleSelectPaymentMethod}
        error={paymentError}
        disabled={isOrderEmpty}
        className="mb-2"
        title="Payment Method"
      />

      <div
        className="px-2 pt-2 pb-1 pos-order-breakdown mt-1 d-none d-md-block"
        style={{ fontSize: 13, color: "#444444" }}
      >
        <div className="d-flex justify-content-between mb-1">
          <span style={{ color: "#444444" }}>No. of Items</span>
          <span style={{ color: "#444444", fontWeight: 500 }}>{totalQty}</span>
        </div>
        <div className="d-flex justify-content-between mb-1">
          <span style={{ color: "#444444" }}>Order Subtotal</span>
          <span style={{ color: "#444444", fontWeight: 500 }}>
            {subtotal.toFixed(2)}
          </span>
        </div>
        {discountType !== "none" && discountAmount > 0 && (
          <div className="d-flex justify-content-between mb-1">
            <span style={{ color: "#444444" }}>
              Discount ({getDiscountLabel(discountType)})
            </span>
            <span style={{ color: "#444444", fontWeight: 500 }}>
              -{discountAmount.toFixed(2)}
            </span>
          </div>
        )}
        <div
          style={{
            height: "1px",
            backgroundColor: "#D9D9D9",
            margin: "8px 0",
            width: "100%",
          }}
        />
        <div
          className="d-flex justify-content-between align-items-center fw-semibold"
          style={{ fontSize: 13 }}
        >
          <span style={{ color: "#444444" }}>Total Due</span>
          <span style={{ color: "#444444" }}>{netTotal.toFixed(2)}</span>
        </div>
        {hasFulfilledPayment && (
          <>
            <div
              className="d-flex justify-content-between align-items-center fw-semibold mt-1"
              style={{ fontSize: 12 }}
            >
              <span style={{ color: "#444444" }}>Amount Paid</span>
              <span style={{ color: "#444444" }}>{numericCash.toFixed(2)}</span>
            </div>
            <div
              className="d-flex justify-content-between align-items-center fw-semibold mt-1"
              style={{ fontSize: 12 }}
            >
              <span style={{ color: "#444444" }}>Change</span>
              <span style={{ color: "#444444" }}>
                {Math.max(0, numericCash - netTotal).toFixed(2)}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="mt-auto w-100 flex-shrink-0">
        {!printAfterPayment && (
          <div className="d-none d-md-flex align-items-center gap-2 mt-3 mb-1 px-1 text-secondary" style={{ fontSize: "12px" }}>
            <input
              type="checkbox"
              id="posDesktopPrintReceipt"
              className="form-check-input mt-0"
              style={{ width: "15px", height: "15px", cursor: "pointer" }}
              checked={shouldPrintReceipt}
              onChange={(e) => setShouldPrintReceipt(e.target.checked)}
            />
            <label htmlFor="posDesktopPrintReceipt" className="user-select-none mb-0 fw-medium text-dark" style={{ cursor: "pointer" }}>
              Print thermal receipt after sale
            </label>
          </div>
        )}

        <button
          type="button"
          className="btn w-100 py-2 mt-1 pos-order-complete-btn d-none d-md-block"
          onClick={openCompleteSaleModal}
          disabled={isOrderEmpty || (!!paymentError && !paymentMethod)}
        >
          Complete Sale
        </button>
      </div>
    </div>
  );
}
