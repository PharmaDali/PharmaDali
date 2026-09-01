import { useState, useEffect, useCallback } from "react";
import { fetchPosProducts, createPosOrder } from "../services/posService";

export function usePos() {
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

  // Discount state
  const [discountType, setDiscountType] = useState("none");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [discountIdNumber, setDiscountIdNumber] = useState("");

  // Modal states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isPaymentResultModalOpen, setIsPaymentResultModalOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [gcashReference, setGcashReference] = useState("");
  const [paymentResult, setPaymentResult] = useState("success");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Load products list from API
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

      setProducts(prev => (isInitial ? newProducts : [...prev, ...newProducts]));
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

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setProductToQuantity(product);
    setIsQuantityModalOpen(true);
  };

  const handleAddQuantityToOrder = (product, qty) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromOrder = (productId) => {
    setOrderItems((prev) => prev.filter((i) => i.id !== productId));
  };

  // Calculations
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.qty * item.selling_price,
    0
  );

  const discountPctNum = parseFloat(discountPercentage) || 0;
  const discountAmount =
    discountType !== "none"
      ? Math.round(subtotal * (discountPctNum / 100) * 100) / 100
      : 0;
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

  const processPayment = async () => {
    setIsProcessingPayment(true);
    try {
      const orderData = {
        items: orderItems.map((item) => ({
          id: item.id,
          qty: item.qty,
        })),
        payment_method: paymentMethod,
        discount_type: discountType,
        discount_percentage: discountPctNum,
        discount_id_number: discountIdNumber,
        amount_received: Number(cashReceived),
        change_amount: Math.max(changeAmount, 0),
        note: `POS Sale - ${paymentMethod.toUpperCase()}${
          paymentMethod === "gcash" ? " Ref: " + gcashReference : ""
        }${discountType !== "none" ? " [" + discountType.toUpperCase() + " Discount]" : ""}`,
      };

      const response = await createPosOrder(orderData);

      if (response.status === "success" || response.status === "Success") {
        setPaymentResult("success");
        setOrderItems([]);
        setSelectedProduct(null);
        setPaymentMethod("");
        setDiscountType("none");
        setDiscountPercentage("");
        setDiscountIdNumber("");
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

  return {
    search,
    setSearch,
    debouncedSearch,
    products,
    loading,
    loadingMore,
    selectedProduct,
    productToQuantity,
    isQuantityModalOpen,
    setIsQuantityModalOpen,
    orderItems,
    paymentMethod,
    setPaymentMethod,
    paymentError,
    discountType,
    setDiscountType,
    discountPercentage,
    setDiscountPercentage,
    discountIdNumber,
    setDiscountIdNumber,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    isPaymentResultModalOpen,
    setIsPaymentResultModalOpen,
    cashReceived,
    setCashReceived,
    gcashReference,
    setGcashReference,
    paymentResult,
    isProcessingPayment,
    orderTotal,
    handleScroll,
    handleSelectProduct,
    handleAddQuantityToOrder,
    removeFromOrder,
    handleSelectPaymentMethod,
    handleReceivePaymentConfirm,
    openCompleteSaleModal,
    handleConfirmContinue,
  };
}
