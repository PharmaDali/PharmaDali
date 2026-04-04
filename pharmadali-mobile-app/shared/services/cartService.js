import { apiRequest } from '@shared/api/client';

function normalizeCartItems(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.data?.items)) {
    return payload.data.items;
  }

  return [];
}

export async function getCartItemCount() {
  const payload = await apiRequest('/customer/cart/items/count', {
    method: 'GET',
  });

  const directCount = Number(payload?.data?.count);

  if (Number.isFinite(directCount) && directCount >= 0) {
    return directCount;
  }

  const items = normalizeCartItems(payload);

  return items.reduce((total, item) => {
    const qty = Number(item?.quantity ?? 1);
    return total + (Number.isFinite(qty) && qty > 0 ? qty : 1);
  }, 0);
}
