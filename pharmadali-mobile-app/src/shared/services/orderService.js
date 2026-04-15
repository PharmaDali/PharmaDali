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
