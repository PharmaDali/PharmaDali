import { useState, useEffect } from "react";
import { fetchOrderExchangeEligibility, processItemExchange } from "../services/itemExchangeService";
import {
  calculateReturnedTotal,
  calculateReplacementTotal,
  calculateFinancialSummary,
  formatExchangePayload,
} from "../utils/exchangeUtils";

export const useItemExchange = (order, show, onExchangeSuccess) => {
  const [step, setStep] = useState(1); // 1: Return Selection, 2: Replacement Selection, 3: Review & Payment
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [eligibilityData, setEligibilityData] = useState(null);

  const [selectedReturns, setSelectedReturns] = useState({}); // { [order_item_id]: returnQty }
  const [returnConditions, setReturnConditions] = useState({}); // { [order_item_id]: "resalable" | "damaged" | "expired" }

  const [replacementCart, setReplacementCart] = useState([]); // [{ id, product_name, selling_price, stock, qty }]
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [reason, setReason] = useState("Defective / Wrong Item");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Reset and load eligibility whenever modal opens
  useEffect(() => {
    if (show && order) {
      resetForm();
      loadEligibility();
    }
  }, [show, order?.id]);

  const resetForm = () => {
    setStep(1);
    setSelectedReturns({});
    setReturnConditions({});
    setReplacementCart([]);
    setPaymentMethod("cash");
    setAmountReceived("");
    setReason("Defective / Wrong Item");
    setNotes("");
    setErrorMsg("");
  };

  const loadEligibility = async () => {
    if (!order) return;
    try {
      setLoadingEligibility(true);
      setErrorMsg("");
      const res = await fetchOrderExchangeEligibility(order.id || order.order_number);
      const data = res.data || res;
      setEligibilityData(data);

      if (data?.items) {
        const initialReturns = {};
        const initialConditions = {};
        data.items.forEach((item) => {
          initialReturns[item.order_item_id] = 0;
          initialConditions[item.order_item_id] = "resalable";
        });
        setSelectedReturns(initialReturns);
        setReturnConditions(initialConditions);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to check order exchange eligibility.");
    } finally {
      setLoadingEligibility(false);
    }
  };

  const updateReturnQty = (orderItemId, newQty, maxQty) => {
    const validQty = Math.max(0, Math.min(Number(newQty) || 0, maxQty));
    setSelectedReturns((prev) => ({ ...prev, [orderItemId]: validQty }));
  };

  const updateReturnCondition = (orderItemId, condition) => {
    setReturnConditions((prev) => ({ ...prev, [orderItemId]: condition }));
  };

  const addReplacementItem = (product) => {
    const existing = replacementCart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.qty < product.stock) {
        setReplacementCart(
          replacementCart.map((item) =>
            item.id === product.id ? { ...item, qty: item.qty + 1 } : item
          )
        );
      }
    } else {
      if (product.stock > 0) {
        const prodName = product.product?.product_name || product.product_name || "Product";
        setReplacementCart([
          ...replacementCart,
          {
            id: product.id,
            product_name: prodName,
            selling_price: Number(product.selling_price) || 0,
            stock: product.stock,
            qty: 1,
          },
        ]);
      }
    }
  };

  const updateReplacementQty = (productId, newQty, maxStock) => {
    const validQty = Math.max(1, Math.min(Number(newQty) || 1, maxStock));
    setReplacementCart(
      replacementCart.map((item) =>
        item.id === productId ? { ...item, qty: validQty } : item
      )
    );
  };

  const removeReplacementItem = (productId) => {
    setReplacementCart(replacementCart.filter((item) => item.id !== productId));
  };

  // Financial calculations
  const eligibleItems = eligibilityData?.items || [];
  const returnedTotal = calculateReturnedTotal(selectedReturns, eligibleItems);
  const replacementTotal = calculateReplacementTotal(replacementCart);
  const financialSummary = calculateFinancialSummary(returnedTotal, replacementTotal, amountReceived);

  const hasSelectedReturns = Object.values(selectedReturns).some((q) => Number(q) > 0);
  const hasReplacementItems = replacementCart.length > 0;

  const handleSubmitExchange = async () => {
    try {
      setSubmitting(true);
      setErrorMsg("");

      const payload = formatExchangePayload({
        orderId: order.id,
        selectedReturns,
        returnConditions,
        replacementCart,
        paymentMethod,
        amountReceived,
        reason,
        notes,
      });

      const res = await processItemExchange(payload);
      const exchangeData = res.data || res;

      if (onExchangeSuccess) {
        onExchangeSuccess(exchangeData);
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to process item exchange.");
    } finally {
      setSubmitting(false);
    }
  };

  return {
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
  };
};
