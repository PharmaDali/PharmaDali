import { useState, useEffect, useCallback, useRef } from "react";
import adminMedsIcon from "../assets/icons/admin-meds.svg";
import successfulTaskIcon from "../assets/icons/modal-icons/successful-task.svg";
import unsuccessfulTaskIcon from "../assets/icons/modal-icons/unsuccessful-task.svg";
import errorIcon from "../assets/icons/modal-icons/error.svg";
import shieldQuestionIcon from "../assets/icons/modal-icons/shield-question.svg";
import Modal from "../components/Modal";
import "../assets/css/pospage.css";
import { fetchPosProducts } from "../services/posService";
import { toTitleCase } from "../utils/stringUtils";

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

const COL_WIDTHS = ["40%", "30%", "30%"];

function ProductTable({ results, selectedId, onSelect, onScroll, loadingMore }) {
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

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      
      <table className="table mb-0" style={{ fontSize: 13, tableLayout: "fixed" }}>
        <colgroup>
          {COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
        </colgroup>
        <thead>
          <tr style={{ background: "#96D2EE" }}>
            <th className="px-3 py-2 fw-semibold border-0 text-center" style={{ color: "#555", background: "#96D2EE" }}>Product Name</th>
            <th className="px-3 py-2 fw-semibold border-0 text-end" style={{ color: "#555", background: "#96D2EE" }}>Price (PHP)</th>
            <th className="px-3 py-2 fw-semibold border-0 text-center" style={{ color: "#555", background: "#96D2EE" }}>Stocks</th>
          </tr>
        </thead>
      </table>
      
      <div className="pos-scroll" onScroll={onScroll} style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <table className="table table-hover mb-0" style={{ fontSize: 13, tableLayout: "fixed" }}>
          <colgroup>
            {COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
          </colgroup>
          <tbody>
            {results.map((item) => (
              <tr
                key={item.id}
                className="pos-row"
                onClick={() => onSelect(item)}
                style={{
                  cursor: "pointer",
                  background: selectedId === item.id ? "#e8f0fe" : "white",
                }}
              >
                <td className="py-3 border-0 border-bottom text-center" style={{ color: "#333", borderLeft: selectedId === item.id ? "4px solid #96D2EE" : "4px solid transparent", paddingLeft: 8, paddingRight: 12 }}>
                  {getFullProductName(item.product)}
                </td>
                <td className="px-3 py-3 border-0 border-bottom text-end" style={{ color: "#333" }}>{parseFloat(item.selling_price).toFixed(2)}</td>
                <td className="px-3 py-3 border-0 border-bottom text-center" style={{ color: "#333" }}>{item.stock}</td>
              </tr>
            ))}
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
  onPaymentChange,
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
  const orderTotal = items.reduce((s, i) => s + i.qty * i.selling_price, 0);
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
              <th className="px-3 py-2 fw-semibold border-0 text-center" style={{ color: "#555", background: "#96D2EE" }}>Product</th>
              <th className="px-2 py-2 fw-semibold border-0 text-center" style={{ color: "#555", background: "#96D2EE" }}>Qty</th>
              <th className="px-3 py-2 fw-semibold border-0 text-end" style={{ color: "#555", background: "#96D2EE" }}>Subtotal</th>
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
          <div style={{ fontSize: 22, fontWeight: 700, color: "#222" }}>{totalQty}</div>
        </div>
        <div className="text-end">
          <div style={{ fontSize: 12, color: "#888" }}>Order Total</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#222" }}>PHP {orderTotal.toFixed(2)}</div>
        </div>
      </div>

      <div className="pb-2 pos-order-payment-wrap">
        <div className="pos-order-payment-title">Payment Method</div>
        <div className="d-flex gap-2 pos-payment-actions">
          <button
            className="btn flex-grow-1 py-2"
            style={{
              fontSize: 13,
              background: paymentMethod === "cash" ? "#2aabe2" : "white",
              color: paymentMethod === "cash" ? "white" : "#555",
              border: "1.5px solid #dde3ec",
              borderRadius: "var(--pd-radius-md)",
            }}
            onClick={() => onPaymentChange("cash")}
          >Cash</button>
          <button
            className="btn flex-grow-1 py-2"
            style={{
              fontSize: 13,
              background: paymentMethod === "gcash" ? "#2aabe2" : "white",
              color: paymentMethod === "gcash" ? "white" : "#555",
              border: "1.5px solid #dde3ec",
              borderRadius: "var(--pd-radius-md)",
            }}
            onClick={() => onPaymentChange("gcash")}
          >GCash</button>
        </div>
      </div>

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
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isPaymentResultModalOpen, setIsPaymentResultModalOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [gcashReference, setGcashReference] = useState("");
  const [paymentResult, setPaymentResult] = useState("success");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const loadProducts = useCallback(async (searchQuery, targetPage, isInitial = false) => {
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const response = await fetchPosProducts({ search: searchQuery, page: targetPage });
      const newProducts = response.data;
      
      setProducts(prev => isInitial ? newProducts : [...prev, ...newProducts]);
      setHasMore(response.current_page < response.last_page);
      setPage(response.current_page);
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

  const orderTotal = orderItems.reduce(
    (sum, item) => sum + item.qty * item.selling_price,
    0
  );

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

  const processPayment = () => {
    const isSuccess = paymentMethod === "cash"
      ? isCashValid
      : isGcashValid;

    setPaymentResult(isSuccess ? "success" : "failed");
    setIsPaymentModalOpen(false);
    setIsPaymentResultModalOpen(true);

    if (isSuccess) {
      setOrderItems([]);
      setSelectedProduct(null);
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
    <div className="d-flex flex-column flex-md-row gap-4 pos-page">
      <div className="d-flex flex-column flex-grow-1 pos-pane" style={{ minWidth: 0 }}>
        <div className="card border-0 shadow-md pos-card pos-product-card">
          <div className="card-header bg-white border-0 d-flex align-items-center gap-3 flex-wrap pt-3 pb-2 px-3">
            <h6
              className="fw-semibold mb-0 flex-shrink-0 pos-title"
              style={{ color: "#222", fontSize: 20 }}
            >
              Product List
            </h6>
            <div
              className="d-flex align-items-center gap-3 px-3 py-2 flex-grow-1 flex-md-grow-0 pos-search"
              style={{
                background: "#f4f7fb",
                border: "1.5px solid #dde3ec",
                borderRadius: "var(--pd-radius-md)",
                width: 300,
              }}
            >
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ color: "#9ca3af", fontSize: 13 }}
              />
              <input
                type="text"
                className="border-0 bg-transparent w-100"
                placeholder="Search for Medicine name or brand"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  fontSize: 13,
                  color: "#374151",
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
                  <div className="d-flex justify-content-center align-items-center h-100">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
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
              onPaymentChange={setPaymentMethod}
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
            <button type="button" className="pos-confirm-primary" onClick={handleConfirmContinue}>
              Continue
            </button>
            <button type="button" className="pos-confirm-secondary" onClick={handleConfirmCancel}>
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
  );
}

export default PosPage;