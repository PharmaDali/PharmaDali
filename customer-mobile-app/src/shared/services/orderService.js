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

