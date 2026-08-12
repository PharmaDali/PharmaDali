import React from "react";
import { useItemExchange } from "../hooks/useItemExchange";
import { useProductSearch } from "../hooks/useProductSearch";

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
              <div className="spinner-border text-primary mb-3" role="status" style={{ color: "#2aabe2" }} />
              <h6 className="fw-semibold text-muted">Checking exchange eligibility...</h6>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isEligible = eligibilityData?.eligible;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "18px", overflow: "hidden" }}>
          
          {/* Modal Header */}
          <div className="modal-header border-0 px-4 pt-4 pb-3" style={{ background: "#f8fafd" }}>
            <div>
              <span className="badge mb-2 px-3 py-2" style={{ backgroundColor: "#e8f0fe", color: "#2aabe2", fontWeight: 600, fontSize: "12px" }}>
                <i className="fa-solid fa-right-left me-1"></i> Order #{order?.order_number || order?.id}
              </span>
              <h5 className="modal-title fw-bold text-dark m-0" style={{ fontSize: "20px" }}>Process Item Exchange</h5>
            </div>
            <button type="button" className="btn-close shadow-none" onClick={onClose}></button>
          </div>

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
                  <i className="fa-solid fa-shield-halved me-1 text-primary" style={{ color: "#2aabe2" }}></i>
                  Store policy enforces a strict No Cash Refund rule.
                </div>
              </div>
            ) : (
              <>
                {/* Step Progress Pills */}
                <div className="d-flex align-items-center justify-content-between mb-4 px-2 py-2 rounded-3" style={{ backgroundColor: "#f8fafd" }}>
                  <div className={`flex-fill text-center py-1 rounded-2 ${step === 1 ? "bg-white shadow-sm fw-bold" : "text-muted"}`} style={{ fontSize: "13px", color: step === 1 ? "#2aabe2" : undefined }}>
                    1. Select Returned Items
                  </div>
                  <div className="px-2 text-muted"><i className="fa-solid fa-chevron-right small"></i></div>
                  <div className={`flex-fill text-center py-1 rounded-2 ${step === 2 ? "bg-white shadow-sm fw-bold" : "text-muted"}`} style={{ fontSize: "13px", color: step === 2 ? "#2aabe2" : undefined }}>
                    2. Choose Replacements
                  </div>
                  <div className="px-2 text-muted"><i className="fa-solid fa-chevron-right small"></i></div>
                  <div className={`flex-fill text-center py-1 rounded-2 ${step === 3 ? "bg-white shadow-sm fw-bold" : "text-muted"}`} style={{ fontSize: "13px", color: step === 3 ? "#2aabe2" : undefined }}>
                    3. Review & Complete
                  </div>
                </div>

                {errorMsg && (
                  <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 border-0 bg-danger-subtle text-danger">
                    {errorMsg}
                  </div>
                )}

                {/* Step 1: Return Selection */}
                {step === 1 && (
                  <div>
                    <h6 className="fw-bold mb-1 text-dark">Step 1: Select Items to Return</h6>
                    <p className="text-muted small mb-3">Choose the purchased items being returned and specify their condition.</p>

                    <div className="table-responsive border rounded-3 mb-3">
                      <table className="table table-hover align-middle mb-0" style={{ fontSize: "13px" }}>
                        <thead className="table-light">
                          <tr>
                            <th>Product Name</th>
                            <th className="text-center">Purchased</th>
                            <th className="text-center">Return Qty</th>
                            <th>Condition</th>
                            <th className="text-end">Credit Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(eligibilityData?.items || []).map((item) => {
                            const returnQty = selectedReturns[item.order_item_id] || 0;
                            const condition = returnConditions[item.order_item_id] || "resalable";
                            const subtotal = returnQty * Number(item.unit_price_snapshot);

                            return (
                              <tr key={item.order_item_id}>
                                <td className="fw-medium text-dark">{item.product_name}</td>
                                <td className="text-center">{item.purchased_quantity}</td>
                                <td className="text-center" style={{ width: "130px" }}>
                                  <input
                                    type="number"
                                    className="form-control form-control-sm text-center"
                                    min="0"
                                    max={item.max_returnable_quantity}
                                    value={returnQty}
                                    onChange={(e) => updateReturnQty(item.order_item_id, e.target.value, item.max_returnable_quantity)}
                                  />
                                </td>
                                <td style={{ width: "150px" }}>
                                  <select
                                    className="form-select form-select-sm"
                                    value={condition}
                                    onChange={(e) => updateReturnCondition(item.order_item_id, e.target.value)}
                                  >
                                    <option value="resalable">Resalable</option>
                                    <option value="damaged">Damaged</option>
                                    <option value="expired">Expired</option>
                                  </select>
                                </td>
                                <td className="text-end fw-bold text-dark">PHP {subtotal.toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded-3">
                      <span className="fw-medium text-muted small">Total Return Credit Available:</span>
                      <span className="fw-bold fs-6 text-dark" style={{ color: "#2aabe2" }}>PHP {returnedTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Step 2: Replacement Selection */}
                {step === 2 && (
                  <div>
                    <h6 className="fw-bold mb-1 text-dark">Step 2: Choose Replacement Items</h6>
                    <p className="text-muted small mb-3">Select replacement products from active branch inventory.</p>

                    <div className="row g-3">
                      {/* Left side: Search inventory */}
                      <div className="col-md-6">
                        <div className="input-group mb-2">
                          <span className="input-group-text bg-white border-end-0"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                          <input
                            type="text"
                            className="form-control border-start-0 ps-0"
                            placeholder="Search replacement products..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                          />
                        </div>

                        <div className="border rounded-3 p-2 overflow-auto" style={{ maxHeight: "260px" }}>
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
                                <div key={prod.id} className="d-flex justify-content-between align-items-center p-2 border-bottom hover-bg-light rounded-2">
                                  <div>
                                    <div className="fw-semibold text-dark small">{name}</div>
                                    <div className="text-muted" style={{ fontSize: "11px" }}>PHP {Number(prod.selling_price).toFixed(2)} | Stock: {prod.stock}</div>
                                  </div>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary py-0 px-2"
                                    style={{ borderColor: "#2aabe2", color: "#2aabe2" }}
                                    onClick={() => addReplacementItem(prod)}
                                    disabled={prod.stock <= 0}
                                  >
                                    <i className="fa-solid fa-plus me-1"></i> Add
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {/* Right side: Replacement Cart */}
                      <div className="col-md-6">
                        <h6 className="fw-bold small text-muted mb-2">Replacement Items Cart</h6>
                        <div className="border rounded-3 p-2 overflow-auto mb-2" style={{ minHeight: "220px", maxHeight: "260px" }}>
                          {replacementCart.length === 0 ? (
                            <div className="text-center py-5 text-muted small">No replacement items added yet.</div>
                          ) : (
                            replacementCart.map((item) => (
                              <div key={item.id} className="d-flex justify-content-between align-items-center p-2 border-bottom">
                                <div>
                                  <div className="fw-medium text-dark small">{item.product_name}</div>
                                  <div className="text-muted" style={{ fontSize: "11px" }}>PHP {item.selling_price.toFixed(2)} x {item.qty}</div>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                  <input
                                    type="number"
                                    className="form-control form-control-sm text-center"
                                    style={{ width: "60px" }}
                                    min="1"
                                    max={item.stock}
                                    value={item.qty}
                                    onChange={(e) => updateReplacementQty(item.id, e.target.value, item.stock)}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-sm text-danger p-0"
                                    onClick={() => removeReplacementItem(item.id)}
                                  >
                                    <i className="fa-solid fa-trash-can"></i>
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded-3">
                          <span className="small text-muted fw-medium">Replacement Total:</span>
                          <span className="fw-bold text-dark">PHP {replacementTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Review & Financial Summary */}
                {step === 3 && (
                  <div>
                    <h6 className="fw-bold mb-1 text-dark">Step 3: Review & Payment Summary</h6>
                    <p className="text-muted small mb-3">Review final balances under the pharmacy No Cash Refund Policy.</p>

                    <div className="card border-0 bg-light p-3 rounded-3 mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Returned Total Value (Credit):</span>
                        <span className="fw-semibold text-dark">PHP {returnedTotal.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted small">Replacement Total Value:</span>
                        <span className="fw-semibold text-dark">PHP {replacementTotal.toFixed(2)}</span>
                      </div>

                      <hr className="my-2" />

                      {financialSummary.isLowerValueReturn ? (
                        <div className="alert alert-info py-2 px-3 small border-0 bg-white text-dark mb-0 rounded-3" style={{ borderLeft: "4px solid #2aabe2" }}>
                          <div className="fw-bold text-primary mb-1" style={{ color: "#2aabe2" }}>
                            <i className="fa-solid fa-shield-halved me-1"></i> No Cash Refund Policy Notice
                          </div>
                          <div>
                            Replacement cost is PHP {Math.abs(financialSummary.netDifference).toFixed(2)} lower than returned value. Excess credit is non-refundable (PHP 0.00 cash refund).
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="d-flex justify-content-between fw-bold text-dark mb-2">
                            <span>Additional Payment Due:</span>
                            <span style={{ color: "#2aabe2" }}>PHP {financialSummary.additionalPaymentRequired.toFixed(2)}</span>
                          </div>

                          {financialSummary.additionalPaymentRequired > 0 && (
                            <div className="row g-2 mt-2">
                              <div className="col-md-6">
                                <label className="form-label small text-muted mb-1">Payment Method</label>
                                <select
                                  className="form-select form-select-sm"
                                  value={paymentMethod}
                                  onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                  <option value="cash">Cash</option>
                                  <option value="card">Card / E-Wallet</option>
                                </select>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label small text-muted mb-1">Amount Tendered (PHP)</label>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  placeholder={financialSummary.additionalPaymentRequired.toFixed(2)}
                                  value={amountReceived}
                                  onChange={(e) => setAmountReceived(e.target.value)}
                                />
                              </div>
                              {financialSummary.changeAmount > 0 && (
                                <div className="col-12 text-end text-success fw-bold small mt-1">
                                  Change Due: PHP {financialSummary.changeAmount.toFixed(2)}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="row g-2">
                      <div className="col-md-6">
                        <label className="form-label small text-muted mb-1">Reason for Exchange</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small text-muted mb-1">Internal Notes (Optional)</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Customer present with receipt..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Modal Footer */}
          {isEligible && (
            <div className="modal-footer border-0 px-4 pb-4 pt-2">
              <button type="button" className="btn btn-light px-4" onClick={onClose} disabled={submitting}>
                Cancel
              </button>

              {step > 1 && (
                <button type="button" className="btn btn-outline-secondary px-4 me-auto" onClick={() => setStep(step - 1)} disabled={submitting}>
                  Back
                </button>
              )}

              {step === 1 && (
                <button
                  type="button"
                  className="btn text-white px-4"
                  style={{ backgroundColor: "#2aabe2" }}
                  onClick={() => setStep(2)}
                  disabled={!hasSelectedReturns}
                >
                  Next: Choose Replacements <i className="fa-solid fa-arrow-right ms-1"></i>
                </button>
              )}

              {step === 2 && (
                <button
                  type="button"
                  className="btn text-white px-4"
                  style={{ backgroundColor: "#2aabe2" }}
                  onClick={() => setStep(3)}
                  disabled={!hasReplacementItems}
                >
                  Next: Review & Complete <i className="fa-solid fa-arrow-right ms-1"></i>
                </button>
              )}

              {step === 3 && (
                <button
                  type="button"
                  className="btn text-white px-4 fw-bold"
                  style={{ backgroundColor: "#2aabe2" }}
                  onClick={handleSubmitExchange}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Processing Exchange...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check me-1"></i> Complete Item Exchange
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
