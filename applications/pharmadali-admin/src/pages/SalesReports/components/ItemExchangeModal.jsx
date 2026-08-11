import React, { useState, useEffect, useMemo } from "react";
import { fetchOrderExchangeEligibility, processItemExchange } from "../../../services/itemExchangeService";
import { fetchPosProducts } from "../../../services/posService";

function ItemExchangeModal({ order, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Return items, 2: Replacement items, 3: Summary & Pay
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [eligibility, setEligibility] = useState(null);

  // Step 1: Returned items state: map order_item_id -> { selected, quantity, condition }
  const [selectedReturns, setSelectedReturns] = useState({});

  // Step 2: Replacement items product search & cart state: map pharmacy_product_id -> { product, quantity }
  const [productSearch, setProductSearch] = useState("");
  const [availableProducts, setAvailableProducts] = useState([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [replacementCart, setReplacementCart] = useState({});

  // Step 3: Payment & Reason
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [reason, setReason] = useState("Customer Exchange");
  const [notes, setNotes] = useState("");

  // Load order eligibility on open
  useEffect(() => {
    if (!order?.id) return;
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchOrderExchangeEligibility(order.id)
      .then((res) => {
        if (!isMounted) return;
        const isSuccess = res?.success ?? true;
        const eligibilityData = res?.data ?? res;

        if (isSuccess && eligibilityData?.eligible) {
          setEligibility(eligibilityData);
          // Initialize returns map
          const initReturns = {};
          (eligibilityData.items || []).forEach((item) => {
            if (item.max_returnable_quantity > 0) {
              initReturns[item.order_item_id] = {
                selected: false,
                quantity: 1,
                condition: "resalable",
              };
            }
          });
          setSelectedReturns(initReturns);
        } else {
          const msg = eligibilityData?.reason || res?.message || "This order is not eligible for an item exchange under current store rules.";
          setEligibility({ eligible: false, reason: msg });
        }
      })
      .catch((err) => {
        if (isMounted) {
          const msg = err.message || err.data?.message || "This order is not eligible for an item exchange under current store rules.";
          setEligibility({ eligible: false, reason: msg });
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [order?.id]);

  // Load available POS products when in step 2
  useEffect(() => {
    if (step !== 2) return;
    let isMounted = true;
    setSearchingProducts(true);

    const timer = setTimeout(() => {
      fetchPosProducts({ search: productSearch, perPage: 12 })
        .then((res) => {
          if (!isMounted) return;
          setAvailableProducts(res.data?.data || res.data || []);
        })
        .catch((err) => {
          console.error("Failed to load products for exchange:", err);
        })
        .finally(() => {
          if (isMounted) setSearchingProducts(false);
        });
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [step, productSearch]);

  // Financial Computations
  const totalReturnedValue = useMemo(() => {
    if (!eligibility?.items) return 0;
    let total = 0;
    eligibility.items.forEach((item) => {
      const state = selectedReturns[item.order_item_id];
      if (state?.selected && state.quantity > 0) {
        total += state.quantity * item.unit_price_snapshot;
      }
    });
    return Math.round(total * 100) / 100;
  }, [eligibility, selectedReturns]);

  const totalReplacementValue = useMemo(() => {
    let total = 0;
    Object.values(replacementCart).forEach(({ product, quantity }) => {
      if (quantity > 0) {
        total += quantity * Number(product.selling_price || 0);
      }
    });
    return Math.round(total * 100) / 100;
  }, [replacementCart]);

  const additionalPaymentRequired = useMemo(() => {
    const diff = totalReplacementValue - totalReturnedValue;
    return diff > 0 ? Math.round(diff * 100) / 100 : 0;
  }, [totalReturnedValue, totalReplacementValue]);

  const changeAmount = useMemo(() => {
    if (additionalPaymentRequired <= 0) return 0;
    const rec = parseFloat(amountReceived) || 0;
    return rec >= additionalPaymentRequired ? Math.round((rec - additionalPaymentRequired) * 100) / 100 : 0;
  }, [amountReceived, additionalPaymentRequired]);

  // Handlers for Step 1 Returns
  const handleToggleReturnItem = (orderItemId) => {
    setSelectedReturns((prev) => ({
      ...prev,
      [orderItemId]: {
        ...prev[orderItemId],
        selected: !prev[orderItemId]?.selected,
      },
    }));
  };

  const handleReturnQtyChange = (orderItemId, qty, maxQty) => {
    const val = Math.max(1, Math.min(maxQty, parseInt(qty) || 1));
    setSelectedReturns((prev) => ({
      ...prev,
      [orderItemId]: {
        ...prev[orderItemId],
        quantity: val,
      },
    }));
  };

  const handleReturnConditionChange = (orderItemId, condition) => {
    setSelectedReturns((prev) => ({
      ...prev,
      [orderItemId]: {
        ...prev[orderItemId],
        condition,
      },
    }));
  };

  // Handlers for Step 2 Replacement Cart
  const handleAddReplacementItem = (product) => {
    setReplacementCart((prev) => {
      const existing = prev[product.id]?.quantity || 0;
      const newQty = existing + 1;
      if (newQty > product.stock) return prev;
      return {
        ...prev,
        [product.id]: {
          product,
          quantity: newQty,
        },
      };
    });
  };

  const handleUpdateReplacementQty = (productId, qty, maxStock) => {
    const val = parseInt(qty) || 0;
    setReplacementCart((prev) => {
      if (val <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          quantity: Math.min(maxStock, val),
        },
      };
    });
  };

  const handleRemoveReplacementItem = (productId) => {
    setReplacementCart((prev) => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  // Final Submit
  const handleSubmitExchange = async () => {
    setSubmitting(true);
    setError(null);

    // Format returned items
    const returnedItemsPayload = [];
    Object.entries(selectedReturns).forEach(([orderItemId, itemState]) => {
      if (itemState.selected && itemState.quantity > 0) {
        returnedItemsPayload.push({
          order_item_id: parseInt(orderItemId),
          quantity: itemState.quantity,
          condition: itemState.condition,
        });
      }
    });

    // Format replacement items
    const replacementItemsPayload = [];
    Object.values(replacementCart).forEach(({ product, quantity }) => {
      if (quantity > 0) {
        replacementItemsPayload.push({
          pharmacy_product_id: product.id,
          quantity,
        });
      }
    });

    const payload = {
      order_id: order.id,
      returned_items: returnedItemsPayload,
      replacement_items: replacementItemsPayload,
      payment_method: paymentMethod,
      amount_received: additionalPaymentRequired > 0 ? (parseFloat(amountReceived) || 0) : 0,
      reason,
      notes,
    };

    try {
      const res = await processItemExchange(payload);
      const isSuccess = res?.success ?? true;
      const exchangeData = res?.data ?? res;
      if (isSuccess) {
        onSuccess(exchangeData);
      } else {
        setError(res?.message || "Exchange failed.");
      }
    } catch (err) {
      setError(err.message || err.data?.message || "Failed to process exchange.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!order) return null;

  return (
    <div
      className="modal d-flex align-items-center justify-content-center"
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 p-4 position-relative overflow-auto shadow-lg"
        style={{ maxWidth: 850, width: "95%", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn-close position-absolute top-0 end-0 m-3" onClick={onClose} />

        {/* Title Header matching PharmaDali Theme */}
        <div className="d-flex align-items-center mb-3">
          <div
            className="rounded-circle me-3 d-flex align-items-center justify-content-center shadow-sm"
            style={{ width: 44, height: 44, backgroundColor: "#e8f0fe", flexShrink: 0 }}
          >
            <i className="fa-solid fa-right-left fs-5 m-0 p-0" style={{ color: "#2aabe2", lineHeight: 1 }}></i>
          </div>
          <div>
            <h4 className="fw-bold mb-0" style={{ color: "#2aabe2" }}>Item Exchange (Change Item)</h4>
            <small className="text-muted">Order #{order.order_number} &bull; No Cash Refund Policy</small>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status" style={{ color: "#2aabe2" }}>
              <span className="visually-hidden">Loading order details...</span>
            </div>
            <p className="text-muted mt-2 mb-0" style={{ fontSize: "14px" }}>Verifying order exchange eligibility...</p>
          </div>
        ) : !eligibility?.eligible ? (
          /* User Friendly Non-Eligible Screen matching PharmaDali brand theme */
          <div className="text-center py-3 px-2">
            <div className="p-4 rounded-4 shadow-sm border" style={{ backgroundColor: "#e8f0fe", borderColor: "#c2dbfe" }}>
              <div
                className="rounded-circle bg-white shadow-sm mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{ width: 68, height: 68 }}
              >
                <i className="fa-solid fa-calendar-xmark fs-2 m-0 p-0" style={{ color: "#2aabe2", lineHeight: 1 }}></i>
              </div>
              <h5 className="fw-bold mb-2 text-dark">Order Not Eligible for Change Item</h5>
              <p className="text-dark mb-3" style={{ fontSize: "14px", maxWidth: 520, margin: "0 auto" }}>
                {eligibility?.reason || "This order cannot be exchanged under current pharmacy store policy."}
              </p>
              
              <div className="alert alert-info py-2 px-3 mb-4 mx-auto text-start border-0 shadow-sm" style={{ maxWidth: 540, backgroundColor: "#ffffff", color: "#1b6f94", fontSize: "13px" }}>
                <i className="fa-solid fa-circle-info me-2 fs-6" style={{ color: "#2aabe2" }}></i>
                <strong>Pharmacy Setting Option:</strong> You can adjust the item exchange time window limit or policy in <strong>Pharmacy Settings</strong> to make orders eligible.
              </div>

              <button
                className="btn text-white px-4 py-2 fw-semibold rounded-3 shadow-sm"
                style={{ backgroundColor: "#2aabe2", borderColor: "#2aabe2" }}
                onClick={onClose}
              >
                Close Window
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step Wizard Progress Bar */}
            <div className="d-flex justify-content-between position-relative mb-4 px-4">
              <div className="progress position-absolute top-50 start-0 end-0 w-100" style={{ height: 3, zIndex: 0, marginTop: "-1px" }}>
                <div className="progress-bar" style={{ width: step === 1 ? "0%" : step === 2 ? "50%" : "100%", backgroundColor: "#2aabe2" }}></div>
              </div>

              <div
                className={`step-badge rounded-circle fw-bold text-center z-1 shadow-sm ${step >= 1 ? 'text-white' : 'bg-light text-secondary'}`}
                style={{ width: 34, height: 34, lineHeight: "34px", backgroundColor: step >= 1 ? "#2aabe2" : undefined, fontSize: "14px" }}
              >
                1
              </div>
              <div
                className={`step-badge rounded-circle fw-bold text-center z-1 shadow-sm ${step >= 2 ? 'text-white' : 'bg-light text-secondary'}`}
                style={{ width: 34, height: 34, lineHeight: "34px", backgroundColor: step >= 2 ? "#2aabe2" : undefined, fontSize: "14px" }}
              >
                2
              </div>
              <div
                className={`step-badge rounded-circle fw-bold text-center z-1 shadow-sm ${step >= 3 ? 'text-white' : 'bg-light text-secondary'}`}
                style={{ width: 34, height: 34, lineHeight: "34px", backgroundColor: step >= 3 ? "#2aabe2" : undefined, fontSize: "14px" }}
              >
                3
              </div>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center rounded-3" style={{ fontSize: "13px" }}>
                <i className="fa-solid fa-circle-exclamation me-2"></i>
                <div>{error}</div>
              </div>
            )}

            {/* STEP 1: Select Items to Return */}
            {step === 1 && (
              <div>
                <h6 className="fw-bold text-dark mb-1" style={{ fontSize: "15px" }}>Step 1: Select Items to Return / Exchange</h6>
                <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
                  Select the items the customer is returning, specify return quantity, and mark item condition.
                </p>

                <div className="table-responsive mb-3 border rounded-3 overflow-hidden shadow-sm">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: "13px" }}>
                    <thead style={{ backgroundColor: "#e8f0fe", color: "#1b6f94" }}>
                      <tr>
                        <th style={{ width: 40 }}></th>
                        <th>Product Item</th>
                        <th className="text-center">Purchased</th>
                        <th className="text-center" style={{ width: 110 }}>Return Qty</th>
                        <th className="text-center" style={{ width: 150 }}>Condition</th>
                        <th className="text-end">Unit Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(eligibility.items || []).map((item) => {
                        const state = selectedReturns[item.order_item_id] || {};
                        const isDisabled = item.max_returnable_quantity <= 0;

                        return (
                          <tr key={item.order_item_id} className={state.selected ? "table-active" : ""}>
                            <td>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={!!state.selected}
                                disabled={isDisabled}
                                onChange={() => handleToggleReturnItem(item.order_item_id)}
                              />
                            </td>
                            <td>
                              <div className="fw-semibold text-dark">{item.product_name}</div>
                              <small className="text-muted">
                                {item.already_returned_quantity > 0
                                  ? `${item.already_returned_quantity} previously returned`
                                  : `Max returnable: ${item.max_returnable_quantity}`}
                              </small>
                            </td>
                            <td className="text-center fw-medium">{item.purchased_quantity}</td>
                            <td className="text-center">
                              <input
                                type="number"
                                className="form-control form-control-sm text-center rounded-2"
                                min="1"
                                max={item.max_returnable_quantity}
                                disabled={!state.selected || isDisabled}
                                value={state.quantity || 1}
                                onChange={(e) => handleReturnQtyChange(item.order_item_id, e.target.value, item.max_returnable_quantity)}
                              />
                            </td>
                            <td className="text-center">
                              <select
                                className="form-select form-select-sm rounded-2"
                                disabled={!state.selected || isDisabled}
                                value={state.condition || "resalable"}
                                onChange={(e) => handleReturnConditionChange(item.order_item_id, e.target.value)}
                              >
                                <option value="resalable">Resalable (Restock IN)</option>
                                <option value="damaged">Damaged (Waste)</option>
                                <option value="expired">Expired (Waste)</option>
                              </select>
                            </td>
                            <td className="text-end fw-semibold" style={{ color: "#2aabe2" }}>
                              ₱{item.unit_price_snapshot.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="d-flex justify-content-between align-items-center p-3 rounded-3 border shadow-sm" style={{ backgroundColor: "#e8f0fe", borderColor: "#c2dbfe" }}>
                  <div>
                    <span className="text-secondary d-block" style={{ fontSize: "12px" }}>Total Return Credit Value</span>
                    <span className="fs-4 fw-bold text-danger">₱{totalReturnedValue.toFixed(2)}</span>
                  </div>
                  <button
                    className="btn text-white px-4 py-2 fw-semibold rounded-3 shadow-sm"
                    style={{ backgroundColor: "#2aabe2", borderColor: "#2aabe2" }}
                    disabled={totalReturnedValue <= 0}
                    onClick={() => setStep(2)}
                  >
                    Next: Select Replacements <i className="fa-solid fa-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Select Replacement Items */}
            {step === 2 && (
              <div>
                <h6 className="fw-bold text-dark mb-1" style={{ fontSize: "15px" }}>Step 2: Select Replacement Products</h6>
                <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
                  Search and add replacement items from current active inventory stock.
                </p>

                <div className="row g-3">
                  {/* Left: Product Search & Grid */}
                  <div className="col-md-7">
                    <div className="input-group mb-3 shadow-sm">
                      <span className="input-group-text bg-white border-end-0">
                        <i className="fa-solid fa-magnifying-glass" style={{ color: "#2aabe2" }}></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0 ps-0"
                        placeholder="Search product name, brand, generic..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                      />
                    </div>

                    <div className="border rounded-3 p-2 overflow-auto shadow-sm" style={{ maxHeight: 320, backgroundColor: "#fafcfe" }}>
                      {searchingProducts ? (
                        <div className="text-center py-4 text-muted" style={{ fontSize: "13px" }}>
                          Searching available products...
                        </div>
                      ) : availableProducts.length === 0 ? (
                        <div className="text-center py-4 text-muted" style={{ fontSize: "13px" }}>
                          No products found.
                        </div>
                      ) : (
                        <div className="row g-2">
                          {availableProducts.map((p) => {
                            const name = p.product?.product_name || "Product";
                            const price = Number(p.selling_price || 0);
                            const inCart = replacementCart[p.id]?.quantity || 0;

                            return (
                              <div key={p.id} className="col-6">
                                <div className="card h-100 shadow-sm border-0 p-2 position-relative rounded-3" style={{ backgroundColor: "#ffffff" }}>
                                  <div className="fw-semibold text-truncate" style={{ fontSize: "13px" }} title={name}>
                                    {name}
                                  </div>
                                  <div className="d-flex justify-content-between align-items-center mt-1">
                                    <span className="fw-bold" style={{ fontSize: "13px", color: "#2aabe2" }}>
                                      ₱{price.toFixed(2)}
                                    </span>
                                    <span className="badge bg-light text-muted border" style={{ fontSize: "10px" }}>
                                      Stock: {p.stock}
                                    </span>
                                  </div>
                                  <button
                                    className="btn btn-sm mt-2 w-100 fw-semibold rounded-2"
                                    style={{
                                      fontSize: "12px",
                                      backgroundColor: inCart > 0 ? "#2aabe2" : "#e8f0fe",
                                      color: inCart > 0 ? "#ffffff" : "#1b6f94",
                                      borderColor: "#2aabe2"
                                    }}
                                    disabled={p.stock <= inCart}
                                    onClick={() => handleAddReplacementItem(p)}
                                  >
                                    <i className="fa-solid fa-plus me-1"></i> Add {inCart > 0 ? `(${inCart})` : ""}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Replacement Cart */}
                  <div className="col-md-5">
                    <div className="card h-100 border rounded-3 p-3 shadow-sm" style={{ backgroundColor: "#e8f0fe", borderColor: "#c2dbfe" }}>
                      <h6 className="fw-bold mb-2" style={{ fontSize: "14px", color: "#1b6f94" }}>
                        <i className="fa-solid fa-cart-shopping me-2" style={{ color: "#2aabe2" }}></i> Replacement Cart
                      </h6>

                      <div className="overflow-auto mb-3 bg-white p-2 rounded-3 border" style={{ maxHeight: 210 }}>
                        {Object.keys(replacementCart).length === 0 ? (
                          <div className="text-center text-muted py-4" style={{ fontSize: "12px" }}>
                            No replacement items added yet. Select products from the left panel.
                          </div>
                        ) : (
                          Object.values(replacementCart).map(({ product, quantity }) => (
                            <div key={product.id} className="d-flex align-items-center justify-content-between py-2 border-bottom" style={{ fontSize: "12px" }}>
                              <div className="me-2" style={{ flex: 1 }}>
                                <div className="fw-semibold text-truncate">{product.product?.product_name}</div>
                                <div className="text-muted">₱{Number(product.selling_price).toFixed(2)} each</div>
                              </div>

                              <div className="d-flex align-items-center gap-1">
                                <input
                                  type="number"
                                  className="form-control form-control-sm text-center rounded-2"
                                  style={{ width: 50 }}
                                  min="1"
                                  max={product.stock}
                                  value={quantity}
                                  onChange={(e) => handleUpdateReplacementQty(product.id, e.target.value, product.stock)}
                                />
                                <button className="btn btn-link text-danger p-0 ms-1" onClick={() => handleRemoveReplacementItem(product.id)}>
                                  <i className="fa-solid fa-trash-can"></i>
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="mt-auto border-top pt-2">
                        <div className="d-flex justify-content-between text-muted" style={{ fontSize: "12px" }}>
                          <span>Returned Credit:</span>
                          <span className="text-danger fw-semibold">-₱{totalReturnedValue.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between text-muted" style={{ fontSize: "12px" }}>
                          <span>Replacements Total:</span>
                          <span className="text-dark fw-semibold">₱{totalReplacementValue.toFixed(2)}</span>
                        </div>

                        <div className="d-flex gap-2 mt-3">
                          <button className="btn btn-outline-secondary btn-sm rounded-3" onClick={() => setStep(1)}>
                            <i className="fa-solid fa-arrow-left me-1"></i> Back
                          </button>
                          <button
                            className="btn text-white btn-sm flex-fill fw-semibold rounded-3 shadow-sm"
                            style={{ backgroundColor: "#2aabe2", borderColor: "#2aabe2" }}
                            disabled={Object.keys(replacementCart).length === 0}
                            onClick={() => setStep(3)}
                          >
                            Next: Review & Pay <i className="fa-solid fa-arrow-right ms-1"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Financial Summary & Process */}
            {step === 3 && (
              <div>
                <h6 className="fw-bold text-dark mb-2" style={{ fontSize: "15px" }}>Step 3: Review Financial Breakdown & Confirm</h6>

                {/* Financial comparison card */}
                <div className="card border rounded-3 p-3 mb-3 shadow-sm" style={{ backgroundColor: "#e8f0fe", borderColor: "#c2dbfe" }}>
                  <div className="row g-2" style={{ fontSize: "14px" }}>
                    <div className="col-6">
                      <span className="text-secondary d-block" style={{ fontSize: "12px" }}>Returned Items Value Credit</span>
                      <span className="fs-5 fw-bold text-danger">-₱{totalReturnedValue.toFixed(2)}</span>
                    </div>
                    <div className="col-6 text-end">
                      <span className="text-secondary d-block" style={{ fontSize: "12px" }}>Replacement Items Total</span>
                      <span className="fs-5 fw-bold text-dark">₱{totalReplacementValue.toFixed(2)}</span>
                    </div>
                  </div>

                  <hr className="my-2" />

                  {additionalPaymentRequired > 0 ? (
                    <div className="d-flex justify-content-between align-items-center bg-white p-3 rounded-3 border border-primary shadow-sm">
                      <div>
                        <span className="fw-bold" style={{ fontSize: "14px", color: "#2aabe2" }}>
                          Additional Payment Due (Replacement &gt; Credit)
                        </span>
                        <small className="d-block text-muted" style={{ fontSize: "12px" }}>
                          Customer pays remaining price difference.
                        </small>
                      </div>
                      <span className="fs-4 fw-bold" style={{ color: "#2aabe2" }}>
                        ₱{additionalPaymentRequired.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <div className="alert alert-warning mb-0 py-2 rounded-3 border-0 shadow-sm" style={{ fontSize: "13px", backgroundColor: "#fff8e6", color: "#8a6d3b" }}>
                      <i className="fa-solid fa-triangle-exclamation me-2 text-warning"></i>
                      <strong>No Cash Refund Policy Active:</strong> Replacement cost (₱{totalReplacementValue.toFixed(2)}) is less than returned credit (₱{totalReturnedValue.toFixed(2)}). Excess credit of ₱{(totalReturnedValue - totalReplacementValue).toFixed(2)} is non-refundable. Cash Refund = <strong>₱0.00</strong>.
                    </div>
                  )}
                </div>

                {/* Payment Fields if Additional Payment Required */}
                {additionalPaymentRequired > 0 && (
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Payment Method</label>
                      <select
                        className="form-select form-select-sm rounded-2"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        <option value="cash">Cash</option>
                        <option value="e_wallet">E-Wallet (GCash / Maya)</option>
                        <option value="card">Credit / Debit Card</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Amount Received (₱)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm rounded-2"
                        placeholder={`Min: ₱${additionalPaymentRequired.toFixed(2)}`}
                        min={additionalPaymentRequired}
                        step="0.01"
                        value={amountReceived}
                        onChange={(e) => setAmountReceived(e.target.value)}
                      />
                      {parseFloat(amountReceived) > 0 && (
                        <small className="text-success fw-bold d-block mt-1" style={{ fontSize: "12px" }}>
                          Change: ₱{changeAmount.toFixed(2)}
                        </small>
                      )}
                    </div>
                  </div>
                )}

                {/* Reason and Notes */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Exchange Reason</label>
                    <select
                      className="form-select form-select-sm rounded-2"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    >
                      <option value="Customer Exchange">Customer Preference / Change of Mind</option>
                      <option value="Defective / Damaged Item">Defective / Damaged Packaging</option>
                      <option value="Wrong Item Purchased">Wrong Dosage / Item Purchased</option>
                      <option value="Expired Product">Expired Product</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold" style={{ fontSize: "13px" }}>Remarks / Notes (Optional)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm rounded-2"
                      placeholder="Additional notes for exchange receipt..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="d-flex justify-content-between pt-2 border-top">
                  <button className="btn btn-outline-secondary btn-sm rounded-3" onClick={() => setStep(2)}>
                    <i className="fa-solid fa-arrow-left me-1"></i> Back to Cart
                  </button>

                  <button
                    className="btn text-white px-4 fw-semibold rounded-3 shadow-sm"
                    style={{ backgroundColor: "#2aabe2", borderColor: "#2aabe2" }}
                    disabled={submitting || (additionalPaymentRequired > 0 && (parseFloat(amountReceived) || 0) < additionalPaymentRequired)}
                    onClick={handleSubmitExchange}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Processing Exchange...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-circle-check me-1"></i> Confirm &amp; Complete Exchange
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ItemExchangeModal;
