import { useState, useEffect, useCallback, useRef } from "react";
import adminMedsIcon from "../assets/icons/admin-meds.svg";
import successfulTaskIcon from "../assets/icons/modal-icons/successful-task.svg";
import unsuccessfulTaskIcon from "../assets/icons/modal-icons/unsuccessful-task.svg";
import errorIcon from "../assets/icons/modal-icons/error.svg";
import shieldQuestionIcon from "../assets/icons/modal-icons/shield-question.svg";
import Modal from "../shared/components/Modal";
import "../assets/css/pospage.css";
import { fetchPosProducts, createPosOrder } from "../services/posService";
import { toTitleCase } from "../utils/stringUtils";
import { TableSkeleton } from "../shared/components/loading";
import { DiscountControl } from "../shared/components/DiscountSelect";
import PaymentMethodSelect from "../shared/components/PaymentMethodSelect";

function EmptyState({ minHeight = 260, iconWidth = 150, className = "", message = "Search for items" }) {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center h-100 ${className}`.trim()}
      style={{ minHeight }}
    >
      <img src={adminMedsIcon} alt="No items" width={iconWidth} className="mb-2" />
      <p className="mb-0" style={{ fontSize: 13, color: "#b5bec8" }}>
        {message}
      </p>
    </div>
  );
}

const COL_WIDTHS = ["25%", "20%", "25%", "15%", "15%"];

function ProductTable({ results, selectedId, onSelect, onScroll, loadingMore }) {
  const getGenericName = (product) => {
    if (!product) return "---";
    return toTitleCase(product.generic_name || product.product_name || "---");
  };

  const getBrandName = (product) => {
    if (!product) return "Generic";
    return toTitleCase(product.brand_name || "Generic");
  };

  const getStrength = (product) => {
    if (!product) return "---";
    const parts = [product.strength, product.form, product.size].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "---";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="rounded-top-3 overflow-hidden" style={{ background: "#48AAD9" }}>
        <table className="table mb-0 align-middle" style={{ fontSize: 13, tableLayout: "fixed" }}>
          <colgroup>
            {COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
          </colgroup>
          <thead>
            <tr style={{ background: "#96D2EE" }}>
              <th className="px-3 py-2.5 fw-semibold border-0 text-start" style={{ color: "var(--pd-text-dark, #334155)", background: "#96D2EE" }}>Generic Name</th>
              <th className="px-3 py-2.5 fw-semibold border-0 text-start" style={{ color: "var(--pd-text-dark, #334155)", background: "#96D2EE" }}>Brand Name</th>
              <th className="px-3 py-2.5 fw-semibold border-0 text-start" style={{ color: "var(--pd-text-dark, #334155)", background: "#96D2EE" }}>Strength</th>
              <th className="px-3 py-2.5 fw-semibold border-0 text-end" style={{ color: "var(--pd-text-dark, #334155)", background: "#96D2EE" }}>Price (PHP)</th>
              <th className="px-3 py-2.5 fw-semibold border-0 text-center" style={{ color: "var(--pd-text-dark, #334155)", background: "#96D2EE" }}>Stocks</th>
            </tr>
          </thead>
        </table>
      </div>
      
      <div className="pos-scroll" onScroll={onScroll} style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <table className="table table-hover mb-0" style={{ fontSize: 13, tableLayout: "fixed" }}>
          <colgroup>
            {COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
          </colgroup>
          <tbody>
            {results.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <tr
                  key={item.id}
                  className="pos-row"
                  onClick={() => onSelect(item)}
                  style={{
                    cursor: "pointer",
                    background: isSelected ? "#d9d9d9" : "transparent",
                    transition: "background-color 0.15s ease",
                  }}
                >
                  <td className="px-3 py-3 border-0 border-bottom text-start" style={{ color: "var(--pd-soft-black, #334155)", fontWeight: 500 }}>
                    {getGenericName(item.product)}
                  </td>
                  <td className="px-3 py-3 border-0 border-bottom text-start" style={{ color: "var(--pd-soft-black, #334155)" }}>
                    {getBrandName(item.product)}
                  </td>
                  <td className="px-3 py-3 border-0 border-bottom text-start" style={{ color: "var(--pd-soft-black, #334155)" }}>
                    {getStrength(item.product)}
                  </td>
                  <td className="px-3 py-3 border-0 border-bottom text-end" style={{ color: "var(--pd-soft-black, #334155)" }}>
                    {parseFloat(item.selling_price).toFixed(2)}
                  </td>
                  <td className="px-3 py-3 border-0 border-bottom text-center" style={{ color: "var(--pd-soft-black, #334155)" }}>
                    {item.stock}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {loadingMore && <div className="text-center py-2" style={{ fontSize: 12, color: "#888" }}>Loading more products...</div>}
      </div>
    </div>
  );
}

const ORDER_COL_WIDTHS = ["50%", "25%", "25%"];



function CurrentOrder({
  items,
  paymentMethod,
  discountType,
  discountPercentage,
  discountIdNumber,
  onPaymentChange,
  onDiscountTypeChange,
  onDiscountPercentageChange,
  onDiscountIdNumberChange,
  onCompleteSale,
  onRemove,
}) {
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

  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.qty * i.selling_price, 0);
  
  const discountPctNum = parseFloat(discountPercentage) || 0;
  const discountAmount = discountType !== "none" ? Math.round((subtotal * (discountPctNum / 100)) * 100) / 100 : 0;
  const netTotal = Math.max(0, subtotal - discountAmount);

  const isOrderEmpty = items.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div
        className="card border-1 shadow-sm pos-order-items-card"
        style={{ flex: "0 0 auto", minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        <table className="table mb-0" style={{ fontSize: 13, tableLayout: "fixed" }}>
          <colgroup>
            {ORDER_COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
          </colgroup>
          <thead>
            <tr>
              <th className="px-3 py-2 fw-semibold border-0 text-center">Product</th>
              <th className="px-2 py-2 fw-semibold border-0 text-center">Qty</th>
              <th className="px-3 py-2 fw-semibold border-0 text-end">Subtotal</th>
            </tr>
          </thead>
        </table>
        {isOrderEmpty ? (
          <EmptyState
            minHeight="var(--pos-order-items-viewport)"
            iconWidth={92}
            className="pos-order-empty-state"
          />
        ) : (
          <div className="pos-scroll pos-order-items-scroll" style={{ minHeight: 0, overflowY: "auto" }}>
            <table className="table mb-0" style={{ fontSize: 13, tableLayout: "fixed" }}>
              <colgroup>
                {ORDER_COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
              </colgroup>
              <tbody>
                {items.map(({ id, product, qty, selling_price }) => (
                  <tr key={id}>
                    <td className="px-3 py-2 border-0 border-bottom text-center" style={{ color: "#333" }}>
                      {getFullProductName(product)}
                    </td>
                    <td className="px-2 py-2 border-0 border-bottom text-center" style={{ color: "#333" }}>{qty}</td>
                    <td className="px-3 py-2 border-0 border-bottom text-end" style={{ color: "#333" }}>
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        <span>{(qty * selling_price).toFixed(2)}</span>
                        <button
                          onClick={() => onRemove(id)}
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#e25252", fontSize: 14, lineHeight: 1 }}
                        >&times;</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-end px-1 pt-3 pb-2 pos-order-meta">
        <div>
          <div style={{ fontSize: 12, color: "#888" }}>No. of Items</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#222" }}>{totalQty}</div>
        </div>
        <div className="text-end">
          {discountAmount > 0 && (
            <div style={{ fontSize: 11, color: "#e25252" }}>
              Discount: -PHP {discountAmount.toFixed(2)}
            </div>
          )}
          <div style={{ fontSize: 12, color: "#888" }}>Order Total</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#222" }}>PHP {netTotal.toFixed(2)}</div>
        </div>
      </div>

      {/* Reusable Discount Component */}
      <DiscountControl
        discountType={discountType}
        setDiscountType={onDiscountTypeChange}
        discountPercentage={discountPercentage}
        setDiscountPercentage={onDiscountPercentageChange}
        discountIdNumber={discountIdNumber}
        setDiscountIdNumber={onDiscountIdNumberChange}
        className="mb-2"
      />

      <PaymentMethodSelect
        paymentMethod={paymentMethod}
        setPaymentMethod={onPaymentChange}
        className="mb-2"
        title="Payment Method"
      />

      <button
        className="btn w-100 py-2 mt-auto pos-order-complete-btn"
        onClick={onCompleteSale}
        disabled={isOrderEmpty}
      >
        {isOrderEmpty ? "Sale Completed" : "Complete Sale"}
      </button>
    </div>
  );
}

function PosPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Discount feature state
  const [discountType, setDiscountType] = useState("none");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [discountIdNumber, setDiscountIdNumber] = useState("");

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isPaymentResultModalOpen, setIsPaymentResultModalOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [gcashReference, setGcashReference] = useState("");
  const [paymentResult, setPaymentResult] = useState("success");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const loadProducts = useCallback(async (searchQuery, targetPage, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await fetchPosProducts({ search: searchQuery, page: targetPage });
      const dataPayload = response?.data || response;
      const newProducts = Array.isArray(dataPayload?.data)
        ? dataPayload.data
        : (Array.isArray(dataPayload) ? dataPayload : (Array.isArray(response) ? response : []));
      const currentPage = dataPayload?.current_page || response?.current_page || 1;
      const lastPage = dataPayload?.last_page || response?.last_page || 1;

      setProducts(prev => isInitial ? newProducts : [...prev, ...newProducts]);
      setHasMore(currentPage < lastPage);
      setPage(currentPage);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadProducts(debouncedSearch, 1, true);
  }, [debouncedSearch, loadProducts]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loadingMore) {
      loadProducts(debouncedSearch, page + 1);
    }
  };

  function addToOrder(product) {
    setSelectedProduct(product);
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function removeFromOrder(productId) {
    setOrderItems((prev) => prev.filter((i) => i.id !== productId));
  }

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.qty * item.selling_price,
    0
  );

  const discountPctNum = parseFloat(discountPercentage) || 0;
  const discountAmount = discountType !== "none" ? Math.round((subtotal * (discountPctNum / 100)) * 100) / 100 : 0;
  const orderTotal = Math.max(0, subtotal - discountAmount);

  const openCompleteSaleModal = () => {
    if (orderItems.length === 0) {
      return;
    }

    setCashReceived(orderTotal.toFixed(2));
    setGcashReference("");
    setIsPaymentModalOpen(true);
  };

  const cashNumeric = Number(cashReceived);
  const changeAmount = Number.isFinite(cashNumeric) ? cashNumeric - orderTotal : 0;
  const isCashValid = Number.isFinite(cashNumeric) && cashNumeric >= orderTotal;
  const isGcashValid = /^\d{13,}$/.test(gcashReference.trim());
  const showCashError = paymentMethod === "cash" && cashReceived.trim() !== "" && !isCashValid;
  const cashShortage = showCashError ? Math.max(orderTotal - cashNumeric, 0) : 0;

  const processPayment = async () => {
    setIsProcessingPayment(true);
    try {
      const orderData = {
        items: orderItems.map(item => ({
          id: item.id,
          qty: item.qty
        })),
        payment_method: paymentMethod,
        discount_type: discountType,
        discount_percentage: discountPctNum,
        discount_id_number: discountIdNumber,
        amount_received: Number(cashReceived),
        change_amount: Math.max(changeAmount, 0),
        note: `POS Sale - ${paymentMethod.toUpperCase()}${paymentMethod === 'gcash' ? ' Ref: ' + gcashReference : ''}${discountType !== 'none' ? ' [' + discountType.toUpperCase() + ' Discount]' : ''}`
      };

      const response = await createPosOrder(orderData);
      
      if (response.status === 'success') {
        setPaymentResult("success");
        setOrderItems([]);
        setSelectedProduct(null);
        setDiscountType("none");
        setDiscountPercentage("");
        setDiscountIdNumber("");
        // Refresh product list to show updated stock
        loadProducts(debouncedSearch, 1, true);
      } else {
        setPaymentResult("failed");
      }
    } catch (error) {
      console.error("Payment failed:", error);
      setPaymentResult("failed");
    } finally {
      setIsProcessingPayment(false);
      setIsPaymentModalOpen(false);
      setIsPaymentResultModalOpen(true);
    }
  };

  const openConfirmModal = () => {
    setIsPaymentModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmContinue = () => {
    setIsConfirmModalOpen(false);
    processPayment();
  };

  const handleConfirmCancel = () => {
    setIsConfirmModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  return (
    <section>
      <header className="admin-page-header mb-4">
        <h4 className="fw-bold mb-1 admin-page-title">Point of Sale (POS)</h4>
        <p className="admin-page-subtitle">Process over-the-counter sales transactions and issue receipts.</p>
      </header>
      <div className="d-flex flex-column flex-md-row gap-4 pos-page">
      <div className="d-flex flex-column flex-grow-1 pos-pane" style={{ minWidth: 0 }}>
        <div className="card border-0 shadow-md pos-card pos-product-card">
          <div className="card-header bg-white border-0 d-flex align-items-center gap-3 flex-wrap pt-3 pb-2 px-3">
            <h6
              className="fw-bold mb-0 flex-shrink-0 pos-title"
              style={{ color: "var(--pd-soft-black-dark, #1e293b)", fontSize: 20 }}
            >
              Product List
            </h6>
            <div
              className="d-flex align-items-center gap-2 px-3 py-2 flex-grow-1 pos-search"
              style={{
                background: "#e8f0fe",
                border: "1px solid #d0deee",
                borderRadius: "8px",
                maxWidth: "500px",
              }}
            >
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ color: "#64748b", fontSize: 14 }}
              />
              <input
                type="text"
                className="border-0 bg-transparent w-100"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  fontSize: 13,
                  color: "var(--pd-soft-black, #334155)",
                  outline: "none",
                  boxShadow: "none",
                }}
              />
            </div>
          </div>
          <div className="card-body p-3 pt-3 overflow-hidden pos-product-body" style={{ flex: 1, minHeight: 0 }}>
            <div className="card border-1 shadow-md" style={{ height: "100%", overflow: "hidden" }}>
              <div className="card-body d-flex flex-column p-0" style={{ flex: 1, minHeight: 0 }}>
                {loading && products.length === 0 ? (
                  <div className="table-responsive p-3">
                    <table className="table pos-table align-middle mb-0">
                      <tbody>
                        <TableSkeleton rows={6} columns={5} showAvatar={true} />
                      </tbody>
                    </table>
                  </div>
                ) : products.length > 0 ? (
                  <ProductTable
                    results={products}
                    selectedId={selectedProduct?.id}
                    onSelect={addToOrder}
                    onScroll={handleScroll}
                    loadingMore={loadingMore}
                  />
                ) : (
                  <EmptyState message={search ? "No products found." : "Search for items"} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="d-flex flex-column pos-pane pos-order-pane"
        style={{ minWidth: 0 }}
      >
        <div className="card border-0 shadow-sm pos-card pos-order-card">
          <div className="card-header bg-white border-0 d-flex align-items-center gap-3 flex-wrap pt-4 pb-2 px-3">
            <h6
              className="fw-semibold mb-0 flex-shrink-0 pos-title"
              style={{ color: "#222", fontSize: 20 }}
            >
              Current Order
            </h6>
          </div>
          <div className="card-body p-3 pt-1 overflow-hidden pos-order-body" style={{ flex: 1, minHeight: 0 }}>
            <CurrentOrder
              items={orderItems}
              paymentMethod={paymentMethod}
              discountType={discountType}
              discountPercentage={discountPercentage}
              discountIdNumber={discountIdNumber}
              onPaymentChange={setPaymentMethod}
              onDiscountTypeChange={setDiscountType}
              onDiscountPercentageChange={setDiscountPercentage}
              onDiscountIdNumberChange={setDiscountIdNumber}
              onRemove={removeFromOrder}
              onCompleteSale={openCompleteSaleModal}
            />
          </div>
        </div>
      </div>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Receive Payment"
        size="md"
        className="pos-payment-modal"
        footer={null}
      >
        <div className="pos-payment-meta">
          <span>{paymentMethod === "cash" ? "Cash" : "GCash"}</span>
          <span>
            Order Total: <strong>PHP {orderTotal.toFixed(2)}</strong>
          </span>
        </div>

        {paymentMethod === "cash" ? (
          <>
            <label className="pos-payment-label" htmlFor="pos-cash-received">
              Enter Cash Received
            </label>
            <input
              id="pos-cash-received"
              type="number"
              min="0"
              step="0.01"
              className={`pos-payment-input ${showCashError ? "is-error" : ""}`.trim()}
              value={cashReceived}
              onChange={(event) => setCashReceived(event.target.value)}
            />
            {showCashError && (
              <div className="pos-payment-error" role="alert">
                <img src={errorIcon} alt="" className="pos-payment-error-icon" aria-hidden="true" />
                <span>Not enough payment. Please add PHP {cashShortage.toFixed(2)}.</span>
              </div>
            )}
            <div className="pos-payment-change">
              Change: <strong>PHP {Math.max(changeAmount, 0).toFixed(2)}</strong>
            </div>
          </>
        ) : (
          <>
            <label className="pos-cash-received" htmlFor="pos-cash-received">
              Enter Amount Received
            </label>
            <input
              id="pos-cash-received"
              type="number"
              inputMode="decimal"
              className={`pos-payment-input ${showCashError ? "is-error" : ""}`.trim()}
              value={cashReceived}
              onChange={(event) => setCashReceived(event.target.value)}
            />
            <label className="pos-payment-label" htmlFor="pos-gcash-reference">
              Enter GCash Reference No.
            </label>
            <input
              id="pos-gcash-reference"
              type="text"
              inputMode="numeric"
              className="pos-payment-input"
              value={gcashReference}
              onChange={(event) => setGcashReference(event.target.value.replace(/\D/g, ""))}
              placeholder="1234567891011"
            />
          </>
        )}

        <button
          type="button"
          className="pos-payment-confirm-btn"
          onClick={openConfirmModal}
          disabled={paymentMethod === "cash" ? !isCashValid : !isGcashValid}
        >
          Confirm
        </button>
      </Modal>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={handleConfirmCancel}
        size="sm"
        showCloseButton={false}
        className="pos-confirm-modal"
      >
        <div className="pos-confirm-content">
          <img src={shieldQuestionIcon} alt="" className="pos-confirm-icon" aria-hidden="true" />
          <h3 className="pos-confirm-title">Confirm this order?</h3>
          <p className="pos-confirm-text">
            Please review the details before proceeding. This action cannot be undone.
          </p>
          <div className="pos-confirm-actions">
            <button 
              type="button" 
              className="pos-confirm-primary" 
              onClick={handleConfirmContinue}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? "Processing..." : "Continue"}
            </button>
            <button 
              type="button" 
              className="pos-confirm-secondary" 
              onClick={handleConfirmCancel}
              disabled={isProcessingPayment}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isPaymentResultModalOpen}
        onClose={() => setIsPaymentResultModalOpen(false)}
        size="sm"
        showCloseButton={false}
        className="pos-payment-result-modal"
      >
        <button
          type="button"
          className="pos-result-close"
          onClick={() => setIsPaymentResultModalOpen(false)}
          aria-label="Close payment result"
        >
          <i className="fa-solid fa-xmark" />
        </button>

        <div className="pos-result-content">
          <img
            src={paymentResult === "success" ? successfulTaskIcon : unsuccessfulTaskIcon}
            alt={paymentResult === "success" ? "Payment successful" : "Payment unsuccessful"}
            className="pos-result-icon"
          />
          <p className="pos-result-text">
            Payment {paymentResult === "success" ? "Successful" : "Unsuccessful"}
          </p>
        </div>
      </Modal>
      </div>
    </section>
  );
}

export default PosPage;