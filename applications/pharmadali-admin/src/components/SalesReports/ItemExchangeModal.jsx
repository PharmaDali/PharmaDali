import React from "react";
import { useItemExchange } from "../../hooks/useItemExchange";
import { useProductSearch } from "../../hooks/useProductSearch";
import SelectDropdown from "../../shared/components/SelectDropdown";

export function ItemExchangeModal({ order, onClose, onSuccess }) {
  const {
    step,
    setStep,
    loadingEligibility,
    eligibilityData,
    selectedReturns,
    returnConditions,
    replacementCart,
    paymentMethod,
    setPaymentMethod,
    amountReceived,
    setAmountReceived,
    setExactPayment,
    addCashDenomination,
    reason,
    setReason,
    notes,
    setNotes,
    submitting,
    errorMsg,
    setErrorMsg,
    updateReturnQty,
    updateReturnCondition,
    addReplacementItem,
    updateReplacementQty,
    removeReplacementItem,
    returnedTotal,
    replacementTotal,
    financialSummary,
    hasSelectedReturns,
    hasReplacementItems,
    handleSubmitExchange,
  } = useItemExchange(order, true, (exchangeData) => {
    if (onSuccess) {
      onSuccess(exchangeData);
    }
  });

  const { query, setQuery, products: availableProducts, loading: searchingProducts } = useProductSearch("");

  if (loadingEligibility) {
    return (
      <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "16px" }}>
            <div className="modal-body text-center py-5">
              <div className="spinner-border mb-3" role="status" style={{ color: "#48aad9" }} />
              <h6 className="fw-semibold text-muted">Checking exchange eligibility...</h6>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isEligible = eligibilityData?.eligible;

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
        zIndex: 1055,
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
        style={{ maxWidth: "680px", width: "95%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content border-0 shadow-lg"
          style={{
            borderRadius: "20px",
            overflow: "hidden",
            fontFamily: "var(--pd-font-family, 'Poppins', sans-serif)",
          }}
        >
          
          {/* Modal Header */}
          <div className="modal-header border-0 px-4 pt-4 pb-2 align-items-start">
            <div>
              <div className="exchange-order-badge mb-2">
                <i className="fa-solid fa-right-left me-1"></i> {order?.order_number || order?.id}
              </div>
              <h4 className="modal-title fw-bold" style={{ color: "#48aad9", fontSize: "22px" }}>Process Item Exchange</h4>
            </div>
            <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
          </div>

          <hr className="my-1 mx-4" style={{ borderColor: "#e2e8f0" }} />

          {/* Modal Body */}
          <div className="modal-body px-4 py-3">
            {!isEligible ? (
              <div className="text-center py-4">
                <div className="mb-3">
                  <i className="fa-solid fa-circle-xmark text-danger" style={{ fontSize: "48px" }}></i>
                </div>
                <h6 className="fw-bold text-dark mb-2">Order Not Eligible for Exchange</h6>
                <p className="text-muted small mx-auto" style={{ maxWidth: "420px" }}>
                  {eligibilityData?.reason || "This transaction is not eligible for exchange under store policy."}
                </p>
                <div className="alert alert-secondary py-2 px-3 small mx-auto" style={{ maxWidth: "420px" }}>
                  <i className="fa-solid fa-shield-halved me-1" style={{ color: "#48aad9" }}></i>
                  Store policy enforces a strict No Cash Refund rule.
                </div>
              </div>
            ) : (
              <>
                {/* Stepper Header */}
                <div className="exchange-stepper-container mb-4">
                  <div className="exchange-stepper-line" />
                  
                  {/* Step 1 */}
                  <div className={`exchange-step-item ${step >= 1 ? "active" : ""}`}>
                    <div className={`exchange-step-circle ${step >= 1 ? "active" : ""}`}>1</div>
                    <span className="exchange-step-label">Select Returned Items</span>
                  </div>

                  {/* Step 2 */}
                  <div className={`exchange-step-item ${step >= 2 ? "active" : ""}`}>
                    <div className={`exchange-step-circle ${step >= 2 ? "active" : ""}`}>2</div>
                    <span className="exchange-step-label">Choose Replacements</span>
                  </div>

                  {/* Step 3 */}
                  <div className={`exchange-step-item ${step >= 3 ? "active" : ""}`}>
                    <div className={`exchange-step-circle ${step >= 3 ? "active" : ""}`}>3</div>
                    <span className="exchange-step-label">Review & Complete</span>
                  </div>
                </div>

                <hr className="mb-4" style={{ borderColor: "#e2e8f0" }} />

                {errorMsg && (
                  <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 border-0 bg-danger-subtle text-danger">
                    {errorMsg}
                  </div>
                )}

                {/* Step 1: Return Selection */}
                {step === 1 && (
                  <div>
                    <h5 className="exchange-step-heading mb-1">Step 1: Select Items to Return</h5>
                    <p className="exchange-step-subheading mb-3">Choose the purchased items being returned and specify their condition.</p>

                    <div className="exchange-card-box mb-3">
                      <div className="table-responsive">
                        <table className="table exchange-table align-middle mb-0" style={{ minWidth: "400px" }}>
                        <thead>
                          <tr>
                            <th>Product Name</th>
                            <th className="text-center">Return Qty</th>
                            <th>Condition</th>
                            <th className="text-end">Credit Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(eligibilityData?.items || []).map((item) => {
                            const returnQty = selectedReturns[item.order_item_id] !== undefined
                              ? selectedReturns[item.order_item_id]
                              : (item.max_returnable_quantity ?? item.purchased_quantity ?? 0);
                            const condition = returnConditions[item.order_item_id] || "resalable";
                            const numReturnQty = Number(returnQty) || 0;
                            const subtotal = numReturnQty * Number(item.unit_price_snapshot);

                            return (
                              <tr key={item.order_item_id}>
                                <td>
                                  <div className="fw-semibold text-dark">{item.product_name}</div>
                                  <div className="text-muted" style={{ fontSize: "11px" }}>Purchased: {item.purchased_quantity}</div>
                                </td>
                                <td className="text-center" style={{ width: "90px" }}>
                                  <input
                                    type="number"
                                    className="form-control form-control-sm text-center exchange-qty-input"
                                    min="0"
                                    max={item.max_returnable_quantity}
                                    value={returnQty}
                                    onChange={(e) => updateReturnQty(item.order_item_id, e.target.value, item.max_returnable_quantity)}
                                  />
                                </td>
                                <td style={{ width: "140px" }}>
                                  <SelectDropdown
                                    selectClassName="form-select-sm exchange-select"
                                    value={condition}
                                    onChange={(val) => updateReturnCondition(item.order_item_id, val)}
                                    options={[
                                      { label: "Resalable", value: "resalable" },
                                      { label: "Damaged", value: "damaged" },
                                      { label: "Expired", value: "expired" },
                                    ]}
                                  />
                                </td>
                                <td className="text-end fw-semibold text-dark">Php {subtotal.toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      </div>
                    </div>

                    <div className="exchange-credit-summary-bar">
                      <span className="fw-medium text-dark">Total Return Credit Available:</span>
                      <span className="fw-bold text-dark fs-6">PHP {returnedTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Step 2: Replacement Selection */}
                {step === 2 && (
                  <div>
                    <h5 className="exchange-step-heading mb-1">Step 2: Choose Replacements</h5>
                    <p className="exchange-step-subheading mb-3">Select replacement products from active branch inventory.</p>

                    <div className="exchange-card-box mb-3 p-3">
                      <div className="exchange-search-group input-group mb-3">
                        <span className="input-group-text exchange-search-icon-text">
                          <i className="fa-solid fa-magnifying-glass"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control exchange-search-input"
                          placeholder="Search replacement products..."
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                          <button
                            type="button"
                            className="btn exchange-search-clear-btn"
                            onClick={() => setQuery("")}
                            title="Clear search"
                          >
                            <i className="fa-solid fa-circle-xmark"></i>
                          </button>
                        )}
                      </div>

                      <div className="overflow-auto" style={{ maxHeight: "200px" }}>
                        {searchingProducts ? (
                          <div className="text-center py-3 text-muted small">
                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                            Searching products...
                          </div>
                        ) : availableProducts.length === 0 ? (
                          <div className="text-center py-3 text-muted small">No products found.</div>
                        ) : (
                          availableProducts.map((prod) => {
                            const name = prod.product?.product_name || prod.product_name || "Product";
                            return (
                              <div key={prod.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                <div>
                                  <div className="fw-bold text-uppercase text-dark" style={{ fontSize: "12px" }}>{name}</div>
                                  <div className="text-muted" style={{ fontSize: "11px" }}>PHP {Number(prod.selling_price).toFixed(2)} | Stock: {prod.stock}</div>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary rounded-2 px-3 py-1 fw-semibold"
                                  style={{ borderColor: "#48aad9", color: "#48aad9", fontSize: "12px" }}
                                  onClick={() => addReplacementItem(prod)}
                                  disabled={prod.stock <= 0}
                                >
                                  + Add
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <h6 className="fw-bold text-muted mb-2" style={{ fontSize: "13px" }}>Replacement Items Cart</h6>
                    <div className="exchange-card-box p-3 mb-3" style={{ minHeight: "150px", maxHeight: "220px", overflowY: "auto" }}>
                      {replacementCart.length === 0 ? (
                        <div className="text-center py-4 text-muted small">No replacement items added yet.</div>
                      ) : (
                        replacementCart.map((item) => (
                          <div key={item.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                            <div>
                              <div className="fw-bold text-uppercase text-dark" style={{ fontSize: "12px" }}>{item.product_name}</div>
                              <div className="text-muted" style={{ fontSize: "11px" }}>PHP {item.selling_price.toFixed(2)} x{item.qty}</div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <input
                                type="number"
                                className="form-control form-control-sm text-center exchange-qty-input"
                                style={{ width: "55px" }}
                                min="1"
                                max={item.stock}
                                value={item.qty}
                                onChange={(e) => updateReplacementQty(item.id, e.target.value, item.stock)}
                              />
                              <button
                                type="button"
                                className="btn btn-sm text-danger p-1"
                                onClick={() => removeReplacementItem(item.id)}
                              >
                                <i className="fa-regular fa-trash-can" style={{ fontSize: "15px" }}></i>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="exchange-credit-summary-bar">
                      <span className="fw-medium text-dark" style={{ fontSize: "13px" }}>Replacement Total:</span>
                      <span className="fw-bold text-dark fs-6">PHP {replacementTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Step 3: Review Breakdown & Complete */}
                {step === 3 && (
                  <div>
                    <h5 className="exchange-step-heading mb-1">Step 3: Review Breakdown & Settlement</h5>
                    <p className="exchange-step-subheading mb-3">Review the transaction breakdown and complete payment settlement.</p>

                    {/* Exchange Reason & Notes */}
                    <div className="card border-0 shadow-sm rounded-3 mb-3 p-3 bg-light">
                      <div className="row g-2">
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold text-dark mb-1">Reason for Exchange *</label>
                          <SelectDropdown
                            selectClassName="form-select-sm"
                            value={reason}
                            onChange={(val) => setReason(val)}
                            options={[
                              { label: "Defective / Wrong Item", value: "Defective / Wrong Item" },
                              { label: "Damaged Packaging", value: "Damaged Packaging" },
                              { label: "Customer Preference / Wrong Product", value: "Customer Preference / Wrong Product" },
                              { label: "Near Expiry / Expired Item", value: "Near Expiry / Expired Item" },
                              { label: "Adverse Reaction / Medical Reason", value: "Adverse Reaction / Medical Reason" },
                              { label: "Other", value: "Other" },
                            ]}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold text-dark mb-1">Notes / Remarks (Optional)</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Add any specific exchange notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Transaction Breakdown Tables */}
                    <div className="mb-3 overflow-auto" style={{ maxHeight: "360px" }}>
                      {/* Returned Items Card */}
                      <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: "13px" }}>
                            <i className="fa-solid fa-arrow-rotate-left text-danger"></i>
                            Items Being Returned
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
                                  <th className="text-end">Price</th>
                                  <th className="text-end">Credit</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(eligibilityData?.items || [])
                                  .filter((item) => (Number(selectedReturns[item.order_item_id]) || 0) > 0)
                                  .map((item) => {
                                    const qty = Number(selectedReturns[item.order_item_id]) || 0;
                                    const price = Number(item.unit_price_snapshot || 0);
                                    const sub = qty * price;
                                    const cond = returnConditions[item.order_item_id] || "resalable";

                                    return (
                                      <tr key={item.order_item_id}>
                                        <td className="fw-medium text-dark">{item.product_name}</td>
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
                                        <td className="text-end fw-bold text-danger">-PHP {sub.toFixed(2)}</td>
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
                      <div className="mb-2">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2" style={{ fontSize: "13px" }}>
                            <i className="fa-solid fa-boxes-stacked" style={{ color: "#48aad9" }}></i>
                            Replacement Items Selected
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
                                  <th className="text-end">Price</th>
                                  <th className="text-end">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {replacementCart.map((item) => {
                                  const qty = Number(item.qty) || 0;
                                  const price = Number(item.selling_price || 0);
                                  const sub = qty * price;

                                  return (
                                    <tr key={item.id}>
                                      <td className="fw-medium text-dark">{item.product_name}</td>
                                      <td className="text-center fw-semibold">{qty}</td>
                                      <td className="text-end text-muted">PHP {price.toFixed(2)}</td>
                                      <td className="text-end fw-bold text-dark">PHP {sub.toFixed(2)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                              <tfoot className="table-light border-top">
                                <tr>
                                  <td colSpan="3" className="fw-bold text-dark">
                                    Total Replacements Cost
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
                    </div>

                    {/* Settlement & Interactive Payment Card */}
                    <div className="exchange-card-box p-3 bg-light mb-3">
                      <div className="d-flex justify-content-between text-muted small mb-1">
                        <span>Total Return Credit:</span>
                        <span className="fw-bold text-danger">-PHP {returnedTotal.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between text-muted small mb-2">
                        <span>Total Replacements Cost:</span>
                        <span className="fw-bold text-dark">PHP {replacementTotal.toFixed(2)}</span>
                      </div>

                      <hr className="my-2" style={{ borderColor: "#e2e8f0" }} />

                      {financialSummary.additionalPaymentRequired > 0 ? (
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="fw-bold text-dark fs-6">Additional Amount Due:</span>
                            <span className="fw-bold fs-5" style={{ color: "#48aad9" }}>
                              PHP {financialSummary.additionalPaymentRequired.toFixed(2)}
                            </span>
                          </div>

                          {/* Payment Method Selector */}
                          <div className="mb-3">
                            <label className="form-label small fw-semibold text-dark mb-1">Payment Method</label>
                            <div className="d-flex gap-2">
                              {["cash", "gcash", "card"].map((method) => (
                                <button
                                  key={method}
                                  type="button"
                                  className={`btn btn-sm px-3 py-1 rounded-3 text-uppercase fw-semibold ${
                                    paymentMethod === method
                                      ? "btn-primary shadow-sm"
                                      : "btn-outline-secondary"
                                  }`}
                                  style={paymentMethod === method ? { backgroundColor: "#48aad9", borderColor: "#48aad9" } : {}}
                                  onClick={() => setPaymentMethod(method)}
                                >
                                  {method}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Amount Tendered Input */}
                          <div className="mb-3">
                            <label className="form-label small fw-semibold text-dark mb-1">
                              Amount Tendered / Received (PHP) *
                            </label>
                            <div className="input-group input-group-sm mb-2">
                              <span className="input-group-text fw-bold bg-white text-muted">PHP</span>
                              <input
                                type="number"
                                step="any"
                                min="0"
                                className="form-control form-control-sm fw-bold fs-6"
                                placeholder={financialSummary.additionalPaymentRequired.toFixed(2)}
                                value={amountReceived}
                                onChange={(e) => setAmountReceived(e.target.value)}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-primary fw-semibold"
                                style={{ borderColor: "#48aad9", color: "#48aad9" }}
                                onClick={setExactPayment}
                              >
                                Exact Amount
                              </button>
                            </div>

                            {/* Quick Denomination Pills */}
                            <div className="d-flex flex-wrap gap-1">
                              <span className="small text-muted me-1 align-self-center" style={{ fontSize: "11px" }}>Quick:</span>
                              {[20, 50, 100, 200, 500, 1000].map((denom) => (
                                <button
                                  key={denom}
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary py-0 px-2 rounded-2"
                                  style={{ fontSize: "11px" }}
                                  onClick={() => addCashDenomination(denom)}
                                >
                                  +{denom}
                                </button>
                              ))}
                              {amountReceived !== "" && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-link text-danger py-0 px-2 text-decoration-none"
                                  style={{ fontSize: "11px" }}
                                  onClick={() => setAmountReceived("")}
                                >
                                  Clear
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Live Change Box */}
                          {Number(amountReceived || 0) >= financialSummary.additionalPaymentRequired ? (
                            <div className="alert alert-success d-flex justify-content-between align-items-center py-2 px-3 mb-0 rounded-3 border-0">
                              <span className="small fw-semibold">
                                <i className="fa-solid fa-circle-check me-1"></i> Change Due to Customer:
                              </span>
                              <span className="fw-bold fs-6">
                                PHP {financialSummary.changeAmount.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <div className="alert alert-warning py-2 px-3 mb-0 rounded-3 border-0 small text-warning-emphasis">
                              <i className="fa-solid fa-triangle-exclamation me-1"></i>
                              {amountReceived === "" ? (
                                <span>Please enter amount tendered or click <strong>Exact Amount</strong>.</span>
                              ) : (
                                <span>
                                  Amount entered is short by{" "}
                                  <strong>PHP {(financialSummary.additionalPaymentRequired - Number(amountReceived)).toFixed(2)}</strong>.
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ) : financialSummary.isLowerValueReturn ? (
                        <div className="alert alert-warning d-flex align-items-start gap-2 py-2 px-3 mb-0 rounded-3 border-0 small text-warning-emphasis">
                          <i className="fa-solid fa-shield-halved mt-1 fs-5"></i>
                          <div>
                            <strong>No Cash Refund Policy:</strong> Replacements total less than returned credit.
                            Excess return credit of <strong>PHP {financialSummary.excessCreditForfeited.toFixed(2)}</strong> is forfeited. Cash refund: <strong>PHP 0.00</strong>.
                          </div>
                        </div>
                      ) : (
                        <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mb-0 rounded-3 border-0 small">
                          <i className="fa-solid fa-circle-check text-success fs-5"></i>
                          <div>
                            <strong>Equal Value Exchange:</strong> Returned credit matches replacement cost. No additional payment required. Balance is <strong>PHP 0.00</strong>.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer */}
          {isEligible && (
            <div className="modal-footer border-0 px-4 pb-4 pt-2 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-cancel-step px-4"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>

              {step > 1 && (
                <button
                  type="button"
                  className="btn btn-back-step px-4"
                  onClick={() => setStep(step - 1)}
                  disabled={submitting}
                >
                  Back
                </button>
              )}

              {step === 1 && (
                <button
                  type="button"
                  className="btn btn-primary-step px-4"
                  onClick={() => setStep(2)}
                  disabled={!hasSelectedReturns}
                >
                  Choose Replacements <i className="fa-solid fa-arrow-right ms-1"></i>
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  className="btn btn-primary-step px-4"
                  onClick={() => setStep(3)}
                  disabled={!hasReplacementItems}
                >
                  Review & Complete <i className="fa-solid fa-arrow-right ms-1"></i>
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  className="btn btn-primary-step px-4"
                  onClick={handleSubmitExchange}
                  disabled={
                    submitting ||
                    (financialSummary.additionalPaymentRequired > 0 &&
                      Number(amountReceived || 0) < financialSummary.additionalPaymentRequired)
                  }
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Processing Exchange...
                    </>
                  ) : (
                    <>
                      Complete Item Exchange <i className="fa-solid fa-arrow-right ms-1"></i>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ItemExchangeModal;
