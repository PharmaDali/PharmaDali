import React from "react";
import { useItemExchange } from "../../hooks/useItemExchange";
import { useProductSearch } from "../../hooks/useProductSearch";

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
              <div className="spinner-border mb-3" role="status" style={{ color: "#48aad9" }} />
              <h6 className="fw-semibold text-muted">Checking exchange eligibility...</h6>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isEligible = eligibilityData?.eligible;

  // Compute dummy/simulated exchangeData for Step 3 preview if submission hasn't happened yet
  const previewExchangeData = {
    exchange_number: "EXC-PREVIEW",
    order: order,
    order_id: order?.id,
    processed_by: { first_name: "Staff", last_name: "" },
    created_at: new Date().toISOString(),
    reason: reason || "DEFECTIVE / WRONG ITEM",
    returned_items: (eligibilityData?.items || [])
      .filter(item => (selectedReturns[item.order_item_id] || 0) > 0)
      .map(item => ({
        product_name: item.product_name,
        quantity: selectedReturns[item.order_item_id],
        condition: returnConditions[item.order_item_id] || "resalable",
        subtotal: (selectedReturns[item.order_item_id] || 0) * Number(item.unit_price_snapshot)
      })),
    replacement_items: replacementCart.map(item => ({
      pharmacy_product: { product: { product_name: item.product_name } },
      quantity: item.qty,
      unit_price_snapshot: item.selling_price,
      subtotal: item.selling_price * item.qty
    })),
    total_returned_value: returnedTotal,
    total_replacement_value: replacementTotal,
    additional_payment: financialSummary.additionalPaymentRequired,
    amount_received: Number(amountReceived || financialSummary.additionalPaymentRequired),
    change_amount: financialSummary.changeAmount,
    payment_method: paymentMethod
  };

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }}>
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable" style={{ maxWidth: "680px", width: "95%" }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "20px", overflow: "hidden" }}>
          
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
                      <table className="table exchange-table align-middle mb-0">
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
                            const returnQty = selectedReturns[item.order_item_id] || 0;
                            const condition = returnConditions[item.order_item_id] || "resalable";
                            const subtotal = returnQty * Number(item.unit_price_snapshot);

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
                                    value={String(returnQty).padStart(2, '0')}
                                    onChange={(e) => updateReturnQty(item.order_item_id, e.target.value, item.max_returnable_quantity)}
                                  />
                                </td>
                                <td style={{ width: "140px" }}>
                                  <select
                                    className="form-select form-select-sm exchange-select"
                                    value={condition}
                                    onChange={(e) => updateReturnCondition(item.order_item_id, e.target.value)}
                                  >
                                    <option value="resalable">Resalable</option>
                                    <option value="damaged">Damaged</option>
                                    <option value="expired">Expired</option>
                                  </select>
                                </td>
                                <td className="text-end fw-semibold text-dark">Php {subtotal.toFixed(2)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
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
                      <div className="input-group mb-3">
                        <span className="input-group-text bg-white border-end-0"><i className="fa-solid fa-magnifying-glass text-muted"></i></span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          placeholder="Search replacement products..."
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
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

                {/* Step 3: Review & Complete */}
                {step === 3 && (
                  <div>
                    <h5 className="exchange-step-heading mb-1">Step 3: Review & Complete</h5>
                    <p className="exchange-step-subheading mb-3">Review the official item exchange slip from active branch.</p>

                    <div className="border rounded-3 p-3 mb-3 bg-light overflow-auto" style={{ maxHeight: "360px" }}>
                      {/* Thermal receipt preview element */}
                      <div className="bg-white p-3 mx-auto shadow-sm border" style={{ maxWidth: "420px", fontFamily: "'Courier New', Courier, monospace", fontSize: "12px" }}>
                        <div className="text-center mb-2">
                          <div className="fw-bold text-uppercase fs-6">PHARMADALI PHARMACY</div>
                          <div className="fw-bold border-top border-bottom border-dark py-1 my-1">OFFICIAL ITEM EXCHANGE SLIP</div>
                          <div className="small">*** STORE POLICY: NO CASH REFUNDS ***</div>
                        </div>

                        <div className="mb-2 border-bottom border-dark pb-2">
                          <div>Exchange No: <span className="fw-bold">{previewExchangeData.exchange_number}</span></div>
                          <div>Original Order Ref: <span className="fw-bold">{order?.order_number || `#${order?.id}`}</span></div>
                          <div>Processed By: <span className="fw-bold">Staff</span></div>
                          <div>Date & Time: <span>{new Date().toLocaleString("en-PH")}</span></div>
                          <div>Reason: <span className="fw-bold text-uppercase">{reason || "DEFECTIVE / WRONG ITEM"}</span></div>
                        </div>

                        <div className="mb-2">
                          <div className="fw-bold border-bottom border-dark">[RETURNED ITEMS]</div>
                          {previewExchangeData.returned_items.map((it, idx) => (
                            <div key={idx} className="d-flex justify-content-between">
                              <span>{it.product_name} x{it.quantity}</span>
                              <span>-PHP {it.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="d-flex justify-content-between fw-bold border-top border-dark pt-1 mt-1">
                            <span>TOTAL RETURN CREDIT:</span>
                            <span>-PHP {returnedTotal.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="mb-2">
                          <div className="fw-bold border-bottom border-dark">[REPLACEMENT ITEMS]</div>
                          {previewExchangeData.replacement_items.map((it, idx) => (
                            <div key={idx} className="d-flex justify-content-between">
                              <span>{it.pharmacy_product?.product?.product_name} x{it.quantity}</span>
                              <span>PHP {it.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="d-flex justify-content-between fw-bold border-top border-dark pt-1 mt-1">
                            <span>TOTAL REPLACEMENTS:</span>
                            <span>PHP {replacementTotal.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="border-top border-dark pt-2">
                          <div className="d-flex justify-content-between"><span>Returned Credit:</span><span>-PHP {returnedTotal.toFixed(2)}</span></div>
                          <div className="d-flex justify-content-between"><span>Replacement Total:</span><span>PHP {replacementTotal.toFixed(2)}</span></div>

                          {financialSummary.isLowerValueReturn ? (
                            <div className="border border-dark p-2 my-2 text-center small">
                              <div className="fw-bold">NO CASH REFUND ISSUED</div>
                              <div>Excess Return Credit Forfeited: PHP {Math.abs(financialSummary.netDifference).toFixed(2)}</div>
                              <div className="fw-bold">CASH REFUND = PHP 0.00</div>
                            </div>
                          ) : (
                            <div className="d-flex justify-content-between fw-bold pt-1 border-top border-dark">
                              <span>ADDITIONAL PAYMENT:</span>
                              <span>PHP {financialSummary.additionalPaymentRequired.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      </div>
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
                  disabled={submitting}
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
