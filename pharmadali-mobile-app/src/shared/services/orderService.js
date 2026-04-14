import { apiRequest } from '@shared/api/client';

export async function placeCustomerOrder({
  paymentMethod = 'cash',
  scheduledPickupAt = null,
  pickedUpAt = null,
  note = null,
} = {}) {
  const body = {
    payment_method: paymentMethod,
    scheduled_pickup_at: scheduledPickupAt,
    picked_up_at: pickedUpAt,
    note,
  };

  return apiRequest('/customer/orders', {
    method: 'POST',
    body,
  });
}
