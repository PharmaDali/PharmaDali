/**
 * Determine whether an order in the pharmacist Issues view was rejected
 * (either full-order rejection or prescription-section rejection while on stand_by).
 */
export const isOrderRejected = (order) => {
  if (!order) return false;
  const apiStatus = String(order.apiStatus || order.status || '').toLowerCase();
  const reasonLower = String(order.cancellationReason ?? order.cancellation_reason ?? '')
    .toLowerCase()
    .trim();

  if (apiStatus === 'rejected') {
    return true;
  }

  if (apiStatus === 'cancelled' && reasonLower.includes('rejected by pharmacist')) {
    return true;
  }

  const hasRejectedPrescription = (order.items || []).some((item) => {
    const rxStatus = item?.prescriptionStatus ?? item?.order_item_prescription?.status ?? item?.orderItemPrescription?.status;
    return String(rxStatus || '').toLowerCase() === 'rejected';
  });

  if (apiStatus === 'stand_by' && (reasonLower.startsWith('prescription rejected:') || hasRejectedPrescription)) {
    return true;
  }

  return false;
};

/**
 * Determine whether an order can be moved out of pending (`out_pending`).
 * Only orders explicitly marked as on hold (`stand_by`) and not rejected qualify.
 */
export const isOrderOnHold = (order) => {
  if (!order) return false;
  const apiStatus = String(order.apiStatus || order.status || '').toLowerCase();
  return apiStatus === 'stand_by' && !isOrderRejected(order);
};
