import { apiRequest } from '@shared/api/client';

export async function placeCustomerOrder({
  paymentMethod = 'cash',
  scheduledPickupAt = null,
  pickedUpAt = null,
  note = null,
  cartItemIds = [],
} = {}) {
  const body = {
    payment_method: paymentMethod,
    scheduled_pickup_at: scheduledPickupAt,
    picked_up_at: pickedUpAt,
    note,
    cart_item_ids: Array.isArray(cartItemIds) ? cartItemIds : [],
  };

  return apiRequest('/customer/orders', {
    method: 'POST',
    body,
  });
}

export async function fetchCustomerOrders() {
  const payload = await apiRequest('/customer/orders', {
    method: 'GET',
  });

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

export async function fetchCustomerOrderDetails(orderId) {
  const numericId = Number(orderId);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    throw new Error('Invalid order id.');
  }

  const payload = await apiRequest(`/customer/orders/${numericId}`, {
    method: 'GET',
  });

  return payload?.data || null;
}

export async function cancelCustomerOrder(orderId, reason = 'Cancelled by customer') {
  const numericId = Number(orderId);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    throw new Error('Invalid order id.');
  }

  return apiRequest(`/customer/orders/${numericId}/cancel`, {
    method: 'PATCH',
    body: {
      reason: reason || 'Cancelled by customer',
    },
  });
}

export async function uploadCustomerDiscountId(orderId, imageAsset, discountType) {
  const numericId = Number(orderId);
  if (!Number.isFinite(numericId) || numericId <= 0 || !imageAsset?.uri) {
    return null;
  }

  const filename = imageAsset.fileName || `discount-id-${numericId}.jpg`;
  const mimeType = imageAsset.mimeType || 'image/jpeg';

  const formData = new FormData();
  formData.append('discount_id_image', {
    uri: imageAsset.uri,
    name: filename,
    type: mimeType,
  });

  if (discountType) {
    formData.append('discount_type', discountType);
  }

  return apiRequest(`/customer/orders/${numericId}/discount-id`, {
    method: 'POST',
    body: formData,
  });
}

export async function uploadCustomerPaymentReceipt(orderId, imageAsset) {
  const numericId = Number(orderId);
  if (!Number.isFinite(numericId) || numericId <= 0 || !imageAsset?.uri) {
    return null;
  }

  const filename = imageAsset.fileName || `payment-receipt-${numericId}.jpg`;
  const mimeType = imageAsset.mimeType || 'image/jpeg';

  const formData = new FormData();
  formData.append('payment_receipt_image', {
    uri: imageAsset.uri,
    name: filename,
    type: mimeType,
  });

  return apiRequest(`/customer/orders/${numericId}/payment-receipt`, {
    method: 'POST',
    body: formData,
  });
}

