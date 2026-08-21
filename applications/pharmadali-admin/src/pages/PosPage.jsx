import { useState, useEffect, useCallback, useRef } from "react";
import adminMedsIcon from "../assets/icons/admin-meds.svg";
import "../assets/css/pospage.css";
import { fetchPosProducts, createPosOrder } from "../services/posService";
import { toTitleCase } from "../utils/stringUtils";
import { TableSkeleton } from "../shared/components/loading";
import { DiscountControl } from "../shared/components/DiscountSelect";
import PaymentMethodSelect from "../shared/components/PaymentMethodSelect";
import { ReceivePaymentModal, ConfirmOrderModal, PaymentResultModal } from "../shared/components/PaymentModals";
import AddQuantityModal from "../components/Pos/AddQuantityModal";

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

function CurrentOrder({
  items = [],
  paymentMethod,
  paymentError,
  cashReceived = "",
  discountType,
  discountPercentage,
  discountIdNumber,
  onPaymentChange,
  onDiscountTypeChange,
  onDiscountPercentageChange,
  onDiscountIdNumberChange,
  onRemove,
  onCompleteSale,
  onSelectPaymentMethod,
}) {
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
  const hasFulfilledPayment = cashReceived !== "" && !Number.isNaN(numericCash) && numericCash > 0;

  if (isOrderEmpty) {
    return (
      <div className="card border-1 shadow-sm rounded-4 overflow-hidden" style={{ height: "100%", minHeight: "380px", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
        <div className="card-body d-flex flex-column align-items-center justify-content-center p-0" style={{ flex: 1, minHeight: 0, height: "100%" }}>
          <EmptyState
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
        style={{ flex: "0 0 auto", height: "225px", minHeight: "225px", maxHeight: "225px", overflow: "hidden", display: "flex", flexDirection: "column", marginBottom: "0.75rem" }}
      >
        <table className="table mb-0" style={{ fontSize: 13, tableLayout: "fixed" }}>
          <colgroup>
            {ORDER_COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
          </colgroup>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th className="px-3 py-2.5 fw-semibold border-0 text-start" style={{ color: "#334155" }}>Product</th>
              <th className="px-2 py-2.5 fw-semibold border-0 text-center" style={{ color: "#334155" }}>Qty</th>
              <th className="px-3 py-2.5 fw-semibold border-0 text-end" style={{ color: "#334155" }}>Subtotal</th>
            </tr>
          </thead>
        </table>

        <div className="pos-scroll pos-order-items-scroll" style={{ height: "185px", minHeight: "185px", maxHeight: "185px", overflowY: "auto" }}>
          <table className="table table-hover mb-0" style={{ fontSize: 13, tableLayout: "fixed" }}>
            <colgroup>
              {ORDER_COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
            </colgroup>
            <tbody>
              {items.map(({ id, product, qty, selling_price }) => (
                <tr key={id}>
                  <td className="px-3 py-2 border-0 border-bottom text-start" style={{ color: "#333", fontWeight: 500 }}>
                    {getFullProductName(product)}
                  </td>
                  <td className="px-2 py-2 border-0 border-bottom text-center" style={{ color: "#333" }}>{qty}</td>
                  <td className="px-3 py-2 border-0 border-bottom text-end" style={{ color: "#333" }}>
                    <div className="d-flex align-items-center justify-content-end gap-2">
                      <span>{(qty * selling_price).toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => onRemove(id)}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#e25252", fontSize: 16, fontWeight: "bold", lineHeight: 1 }}
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
        setDiscountType={onDiscountTypeChange}
        discountPercentage={discountPercentage}
        setDiscountPercentage={onDiscountPercentageChange}
        discountIdNumber={discountIdNumber}
        setDiscountIdNumber={onDiscountIdNumberChange}
        className="mb-2"
      />

      {/* Payment Method Select */}
      <PaymentMethodSelect
        paymentMethod={paymentMethod}
        setPaymentMethod={onPaymentChange}
        onSelectPaymentMethod={onSelectPaymentMethod}
        error={paymentError}
        className="mb-2"
        title="Payment Method"
      />

      {/* Order Breakdown at bottom of Payment Method */}
      <div className="px-2 pt-2 pb-1 pos-order-breakdown mt-1" style={{ fontSize: 13, color: "#444444" }}>
        <div className="d-flex justify-content-between mb-1.5">
          <span style={{ color: "#444444" }}>No. of Items</span>
          <span style={{ color: "#444444", fontWeight: 500 }}>{totalQty}</span>
        </div>
        <div className="d-flex justify-content-between mb-1.5">
          <span style={{ color: "#444444" }}>Order Subtotal</span>
          <span style={{ color: "#444444", fontWeight: 500 }}>{subtotal.toFixed(2)}</span>
        </div>
        {discountType !== "none" && discountAmount > 0 && (
          <div className="d-flex justify-content-between mb-1.5">
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
            <div className="d-flex justify-content-between align-items-center fw-semibold mt-1.5" style={{ fontSize: 12 }}>
              <span style={{ color: "#444444" }}>Amount Paid</span>
              <span style={{ color: "#444444" }}>{numericCash.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center fw-semibold mt-1.5" style={{ fontSize: 12}}>
              <span style={{ color: "#444444" }}>Change</span>
              <span style={{ color: "#444444" }}>{Math.max(0, numericCash - netTotal).toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      <button
        className="btn w-100 py-2 mt-auto pos-order-complete-btn"
        onClick={onCompleteSale}
        disabled={isOrderEmpty || (!!paymentError && !paymentMethod)}
      >
        Complete Sale
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
  const [productToQuantity, setProductToQuantity] = useState(null);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentError, setPaymentError] = useState("");

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
    if (!debouncedSearch.trim()) {
      setProducts([]);
      setHasMore(false);
      setLoading(false);
      return;
    }
    loadProducts(debouncedSearch, 1, true);
  }, [debouncedSearch, loadProducts]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loadingMore) {
      loadProducts(debouncedSearch, page + 1);
    }
  };

  function handleSelectProduct(product) {
    setSelectedProduct(product);
    setProductToQuantity(product);
    setIsQuantityModalOpen(true);
  }

  function handleAddQuantityToOrder(product, qty) {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...product, qty }];
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

  const handleSelectPaymentMethod = (method) => {
    setPaymentMethod(method);
    setPaymentError("");
    setCashReceived(orderTotal.toFixed(2));
    setGcashReference("");
    setIsPaymentModalOpen(true);
  };

  const handleReceivePaymentConfirm = () => {
    setIsPaymentModalOpen(false);
  };

  const openCompleteSaleModal = () => {
    if (orderItems.length === 0) {
      return;
    }
    if (!paymentMethod) {
      setPaymentError("Please select a payment method");
      return;
    }
    setPaymentError("");
    setIsConfirmModalOpen(true);
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
        setPaymentMethod("");
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
      setIsConfirmModalOpen(false);
      setIsPaymentResultModalOpen(true);
    }
  };

  const handleConfirmContinue = () => {
    setIsConfirmModalOpen(false);
    processPayment();
  };

  return (
    <section>
      <div className="d-flex flex-column flex-md-row gap-4 pos-page">
      <div className="d-flex flex-column flex-grow-1 pos-pane" style={{ minWidth: 0 }}>
        <div className="card border-0 shadow-md pos-card pos-product-card rounded-4 overflow-hidden">
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
                background: "#E3EBF3",
                border: "1px solid #c9d6e4",
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
                  color: "#1f2937",
                  outline: "none",
                  boxShadow: "none",
                }}
              />
            </div>
          </div>
          <div className="card-body p-3 pt-3 overflow-hidden pos-product-body" style={{ flex: 1, minHeight: 0 }}>
            <div className="card border-1 shadow-md rounded-4 overflow-hidden" style={{ height: "100%", overflow: "hidden" }}>
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
                    onSelect={handleSelectProduct}
                    onScroll={handleScroll}
                    loadingMore={loadingMore}
                  />
                ) : (
                  <EmptyState
                    minHeight="100%"
                    iconWidth={92}
                    className="pos-order-empty-state"
                    message={debouncedSearch.trim() ? "No products found." : "Search for items"}
                  />
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
        <div className="card border-0 shadow-sm pos-card pos-order-card rounded-4 overflow-hidden">
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
              paymentError={paymentError}
              cashReceived={cashReceived}
              discountType={discountType}
              discountPercentage={discountPercentage}
              discountIdNumber={discountIdNumber}
              onPaymentChange={setPaymentMethod}
              onDiscountTypeChange={setDiscountType}
              onDiscountPercentageChange={setDiscountPercentage}
              onDiscountIdNumberChange={setDiscountIdNumber}
              onRemove={removeFromOrder}
              onCompleteSale={openCompleteSaleModal}
              onSelectPaymentMethod={handleSelectPaymentMethod}
            />
          </div>
        </div>
      </div>

      <ReceivePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentMethod={paymentMethod}
        orderTotal={orderTotal}
        cashReceived={cashReceived}
        setCashReceived={setCashReceived}
        gcashReference={gcashReference}
        setGcashReference={setGcashReference}
        onConfirm={handleReceivePaymentConfirm}
      />

      <ConfirmOrderModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onContinue={handleConfirmContinue}
        isProcessing={isProcessingPayment}
      />

      <PaymentResultModal
        isOpen={isPaymentResultModalOpen}
        onClose={() => setIsPaymentResultModalOpen(false)}
        result={paymentResult}
      />

      <AddQuantityModal
        isOpen={isQuantityModalOpen}
        onClose={() => setIsQuantityModalOpen(false)}
        product={productToQuantity}
        onAddToOrder={handleAddQuantityToOrder}
      />
      </div>
    </section>
  );
}

export default PosPage;