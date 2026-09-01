import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchPickupOrders, completePickupOrder } from "../services/posService";

export function usePickupOrdersCount() {
  const [readyPickupCount, setReadyPickupCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    fetchPickupOrders({ status: "ready_for_pickup" })
      .then((res) => {
        if (mounted) {
          const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
          setReadyPickupCount(list.length);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  return { readyPickupCount };
}

export const PICKUP_TABS = [
  { id: "Ready", label: "Ready", icon: "fa-box-archive" },
  { id: "Completed", label: "Completed", icon: "fa-circle-check" },
  { id: "All", label: "All", icon: "fa-boxes-stacked" },
];

export function usePickupOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Ready");
  const [activeOrder, setActiveOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isPaymentResultModalOpen, setIsPaymentResultModalOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [gcashReference, setGcashReference] = useState("");
  const [paymentResult, setPaymentResult] = useState("success");
  const [errorMessage, setErrorMessage] = useState("");

  const [discountType, setDiscountType] = useState("none");
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [discountIdNumber, setDiscountIdNumber] = useState("");

  const [newCompletedCount, setNewCompletedCount] = useState(0);

  const tabCounts = useMemo(() => {
    const ready = orders.filter((o) => o.status === "ready_for_pickup").length;
    const completed = orders.filter((o) => o.status === "completed").length;
    return {
      Ready: ready,
      Completed: completed,
      CompletedNew: newCompletedCount,
      All: orders.length,
    };
  }, [orders, newCompletedCount]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "Ready") {
      return orders.filter((o) => o.status === "ready_for_pickup");
    }
    if (statusFilter === "Completed") {
      return orders.filter((o) => o.status === "completed");
    }
    return orders;
  }, [orders, statusFilter]);

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const paginatedOrders = useMemo(
    () => filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredOrders, currentPage]
  );
  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const endPage = Math.min(totalPages, startPage + 4);

    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const handleTabChange = (tabId) => {
    setStatusFilter(tabId);
    setCurrentPage(1);
    setActiveOrder(null);
    if (tabId === "Completed") {
      setNewCompletedCount(0);
    }
  };

  const [fetchError, setFetchError] = useState(null);

  const loadOrders = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setFetchError(null);
      const response = await fetchPickupOrders({
        search,
        status: "all"
      });
      const dataArray = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);
      
      // Filter out POS walk-in transactions to only display pickup orders
      const pickupOrdersOnly = dataArray.filter(
        (o) =>
          o.order_type !== "pos" &&
          o.fulfillment_type !== "pos" &&
          o.source !== "pos" &&
          o.channel !== "pos" &&
          o.is_pos !== 1 &&
          o.is_pos !== true
      );
      setOrders(pickupOrdersOnly);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setFetchError(error?.message || "Failed to connect to API server");
      setOrders([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadOrders();
    setCurrentPage(1);
  }, [loadOrders]);

  useEffect(() => {
    if (activeOrder) {
      setPaymentMethod(activeOrder.payment_method || 'cash');
    }
  }, [activeOrder]);

  const subtotalAmount = useMemo(() => {
    if (!activeOrder) return 0;
    if (Array.isArray(activeOrder.items) && activeOrder.items.length > 0) {
      const sum = activeOrder.items.reduce((acc, item) => {
        const price = Number(item.price || item.unit_price || 0);
        const qty = Number(item.quantity || item.qty || 1);
        const itemSub = Number(item.subtotal || item.total) || (price * qty);
        return acc + itemSub;
      }, 0);
      if (sum > 0) return sum;
    }
    return Number(activeOrder.total_amount || activeOrder.payable_amount || activeOrder.total || 0);
  }, [activeOrder]);

  const computedDiscountAmount = useMemo(() => {
    if (discountType === "none") return 0;
    if (discountType === "senior" || discountType === "pwd") {
      return subtotalAmount * 0.2;
    }
    if (discountType === "employee") {
      return subtotalAmount * 0.1;
    }
    if (discountType === "custom") {
      const pct = parseFloat(discountPercentage) || 0;
      return subtotalAmount * (pct / 100);
    }
    return 0;
  }, [discountType, discountPercentage, subtotalAmount]);

  const finalPayableAmount = useMemo(() => {
    if (activeOrder && activeOrder.total_amount !== undefined) {
      return Number(activeOrder.total_amount);
    }
    return Math.max(0, subtotalAmount - computedDiscountAmount);
  }, [activeOrder, subtotalAmount, computedDiscountAmount]);

  const changeAmount = useMemo(() => {
    if (paymentMethod !== "cash") return 0;
    const received = parseFloat(cashReceived) || 0;
    return Math.max(0, received - finalPayableAmount);
  }, [cashReceived, finalPayableAmount, paymentMethod]);

  const [isPaymentEntered, setIsPaymentEntered] = useState(false);

  useEffect(() => {
    setIsPaymentEntered(false);
  }, [activeOrder]);

  const handleOpenPaymentModal = () => {
    setIsPaymentModalOpen(true);
    setCashReceived(finalPayableAmount.toFixed(2));
    setGcashReference("");
  };

  const handlePaymentModalConfirm = () => {
    if (paymentMethod === "cash") {
      const received = parseFloat(cashReceived) || 0;
      if (received < finalPayableAmount) {
        setErrorMessage(`Insufficient Cash. Required amount is PHP ${finalPayableAmount.toFixed(2)}.`);
        setPaymentResult("error");
        setIsPaymentResultModalOpen(true);
        return;
      }
    } else if (paymentMethod === "gcash") {
      if (!gcashReference.trim()) {
        setErrorMessage("Please enter a valid GCash Reference Number.");
        setPaymentResult("error");
        setIsPaymentResultModalOpen(true);
        return;
      }
    }

    setIsPaymentEntered(true);
    setIsPaymentModalOpen(false);
  };

  const handleCompleteOrderClick = () => {
    setIsConfirmModalOpen(true);
  };

  const confirmCompleteOrder = async () => {
    setIsConfirmModalOpen(false);
    setIsPaymentModalOpen(false);
    
    try {
      const parsedPayable = Number(finalPayableAmount) && !Number.isNaN(Number(finalPayableAmount)) ? Number(finalPayableAmount) : 0;
      const parsedCash = Number(cashReceived) && !Number.isNaN(Number(cashReceived)) ? Number(cashReceived) : 0;
      const amtReceived = parsedCash > 0 ? parsedCash : parsedPayable;
      const chgAmount = Math.max(0, amtReceived - parsedPayable);

      const rawMethod = typeof paymentMethod === "object" && paymentMethod !== null ? (paymentMethod.id || paymentMethod.value || "cash") : paymentMethod;
      const methodStr = String(rawMethod || "cash").toLowerCase();

      const payload = {
        payment_method: methodStr,
        amount_received: amtReceived,
        change_amount: chgAmount,
      };

      if (discountType && discountType !== "none") {
        payload.discount_type = discountType;
        const pct = discountType === "custom"
          ? (parseFloat(discountPercentage) || 0)
          : (discountType === "senior" || discountType === "pwd" ? 20 : discountType === "employee" ? 10 : 0);
        if (Number.isFinite(pct) && pct > 0) {
          payload.discount_percentage = pct;
        }
        if (discountIdNumber && String(discountIdNumber).trim()) {
          payload.discount_id_number = String(discountIdNumber).trim();
        }
      }

      await completePickupOrder(activeOrder.id, payload);

      setPaymentResult("success");
      setIsPaymentResultModalOpen(true);
      if (statusFilter !== "Completed") {
        setNewCompletedCount((prev) => prev + 1);
      }
      await loadOrders(false);
      setActiveOrder(null);
    } catch (err) {
      console.error("Complete order failed details:", err.response?.data || err);
      const responseData = err.response?.data;
      let backendMsg = responseData?.message || err.message || "Failed to complete pickup transaction.";
      if (responseData?.errors) {
        const errorKeys = Object.keys(responseData.errors);
        if (errorKeys.length > 0) {
          backendMsg = responseData.errors[errorKeys[0]][0];
        }
      }
      setErrorMessage(backendMsg);
      setPaymentResult("error");
      setIsPaymentResultModalOpen(true);
    }
  };

  return {
    orders,
    loading,
    fetchError,
    search,
    setSearch,
    statusFilter,
    activeOrder,
    setActiveOrder,
    paymentMethod,
    setPaymentMethod,
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
    errorMessage,
    discountType,
    setDiscountType,
    discountPercentage,
    setDiscountPercentage,
    discountIdNumber,
    setDiscountIdNumber,
    tabCounts,
    filteredOrders,
    paginatedOrders,
    currentPage,
    totalPages,
    visiblePageNumbers,
    handlePageChange,
    handleTabChange,
    subtotalAmount,
    computedDiscountAmount,
    finalPayableAmount,
    changeAmount,
    isPaymentEntered,
    handlePaymentModalConfirm,
    handleOpenPaymentModal,
    handleCompleteOrderClick,
    confirmCompleteOrder,
  };
}

export default usePickupOrders;
