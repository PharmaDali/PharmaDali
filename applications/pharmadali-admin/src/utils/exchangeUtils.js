/**
 * Calculate total value of selected items for return.
 * @param {Object} selectedReturns - Map of order_item_id -> return quantity
 * @param {Array} eligibleItems - List of order items eligible for return
 * @returns {number} Round total value of returned items
 */
export const calculateReturnedTotal = (selectedReturns, eligibleItems = []) => {
  let total = 0;
  eligibleItems.forEach((item) => {
    const qty = Number(selectedReturns[item.order_item_id]) || 0;
    if (qty > 0) {
      total += (Number(item.unit_price_snapshot) || 0) * qty;
    }
  });
  return Math.round(total * 100) / 100;
};

/**
 * Calculate total value of replacement items in cart.
 * @param {Array} replacementCart - List of replacement items ({ id, selling_price, qty })
 * @returns {number} Round total value of replacement items
 */
export const calculateReplacementTotal = (replacementCart = []) => {
  let total = 0;
  replacementCart.forEach((item) => {
    const price = Number(item.selling_price) || 0;
    const qty = Number(item.qty) || 0;
    total += price * qty;
  });
  return Math.round(total * 100) / 100;
};

/**
 * Calculate financial summary breakdown adhering to No Cash Refund policy.
 * @param {number} returnedTotal - Total credit from returned items
 * @param {number} replacementTotal - Total cost of replacement items
 * @param {number|string} amountReceivedInput - Cash amount tendered by customer
 * @returns {Object} Financial summary breakdown
 */
export const calculateFinancialSummary = (returnedTotal = 0, replacementTotal = 0, amountReceivedInput = 0) => {
  const netDifference = Math.round((replacementTotal - returnedTotal) * 100) / 100;
  const additionalPaymentRequired = netDifference > 0 ? netDifference : 0;
  const isLowerValueReturn = netDifference < 0;
  const excessCreditForfeited = isLowerValueReturn ? Math.abs(netDifference) : 0;

  const amountReceivedNum = Number(amountReceivedInput) || 0;
  const changeAmount = additionalPaymentRequired > 0
    ? Math.max(0, Math.round((amountReceivedNum - additionalPaymentRequired) * 100) / 100)
    : 0;

  return {
    netDifference,
    additionalPaymentRequired,
    isLowerValueReturn,
    excessCreditForfeited,
    changeAmount,
  };
};

/**
 * Format exchange API payload.
 */
export const formatExchangePayload = ({
  orderId,
  selectedReturns,
  returnConditions,
  replacementCart,
  paymentMethod = "cash",
  amountReceived = 0,
  reason = "Item Exchange",
  notes = "",
}) => {
  const returned_items = Object.entries(selectedReturns)
    .filter(([_, qty]) => Number(qty) > 0)
    .map(([orderItemId, qty]) => ({
      order_item_id: Number(orderItemId),
      quantity: Number(qty),
      condition: returnConditions[orderItemId] || "resalable",
    }));

  const replacement_items = replacementCart.map((item) => ({
    pharmacy_product_id: item.id,
    quantity: Number(item.qty),
  }));

  return {
    order_id: orderId,
    returned_items,
    replacement_items,
    payment_method: paymentMethod,
    amount_received: Number(amountReceived) || 0,
    reason,
    notes,
  };
};
