import { apiRequest } from '@shared/api/client';

function toPositiveInteger(value, fallback = 1) {
  const parsed = Number(value);

  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.floor(parsed);
  }

  return fallback;
}

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

function hasRxMarker(value) {
  return typeof value === 'string' && /prescription required|rx|prescription/i.test(value);
}

function buildProductName(product, fallback) {
  const base =
    product?.product_name ||
    product?.brand_name ||
    product?.generic_name ||
    fallback;
  const details = [product?.strength, product?.form, product?.size].filter(Boolean).join(' ');

  return details ? `${base} (${details})` : base;
}

function mapCartApiItem(item) {
  const quantity = Number(item?.quantity ?? 1);
  const safeQuantity = Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1;

  const unitPrice = Number(item?.unit_price ?? 0);
  const safeUnitPrice = Number.isFinite(unitPrice) && unitPrice >= 0 ? unitPrice : 0;

  const categoryName = item?.category?.category_name || '';
  const description = buildProductName(item?.product, 'Unnamed product');

  return {
    id: Number(item?.id ?? 0),
    cartId: Number(item?.cart_id ?? 0),
    branchProductId: Number(item?.branch_product_id ?? 0),
    description,
    size: item?.product?.strength || item?.product?.form || item?.product?.size || 'N/A',
    price: safeUnitPrice,
    quantity: safeQuantity,
    selected: false,
    prescriptionRequired:
      Boolean(item?.prescription_required) ||
      Boolean(item?.product?.is_prescribed) ||
      hasRxMarker(categoryName) ||
      hasRxMarker(description) ||
      hasRxMarker(item?.product?.description),
    branch: {
      id: item?.branch?.id ?? null,
      branchName: item?.branch?.branch_name || 'Unknown branch',
      location: item?.branch?.location || '',
    },
    product: item?.product || {},
    category: item?.category || {},
    availability: item?.availability || {},
  };
}

export async function getCartItems() {
  const payload = await apiRequest('/customer/cart/items', {
    method: 'GET',
  });

  const items = normalizeCartItems(payload).map(mapCartApiItem);

  return {
    items,
    summary: payload?.data?.summary || {
      item_count: items.length,
      total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    },
  };
}

export async function addCartItem({ branchId, branchProductId, quantity = 1 }) {
  const payload = await apiRequest('/customer/cart/items', {
    method: 'POST',
    body: {
      branch_id: toPositiveInteger(branchId, 0),
      branch_product_id: toPositiveInteger(branchProductId, 0),
      quantity: toPositiveInteger(quantity, 1),
    },
  });

  return {
    message: payload?.message || 'Item added to cart successfully.',
    data: payload?.data || null,
  };
}

export function toggleCartItemSelection(items, id) {
  return items.map((item) =>
    item.id === id ? { ...item, selected: !item.selected } : item,
  );
}

export function changeCartItemQuantity(items, id, direction) {
  return items.map((item) => {
    if (item.id !== id) {
      return item;
    }

    const currentQty = Number(item.quantity) || 1;
    const nextQty =
      direction === 'increment'
        ? currentQty + 1
        : Math.max(1, currentQty - 1);

    return {
      ...item,
      quantity: nextQty,
    };
  });
}

export function toggleAllCartItems(items, selectedValue) {
  return items.map((item) => ({ ...item, selected: selectedValue }));
}

export function buildCartViewState(items) {
  const selectedItems = items.filter((item) => item.selected);
  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasPrescription = items.some((item) => item.prescriptionRequired);
  const allSelected = items.length > 0 && items.every((item) => item.selected);

  const branchNames = Array.from(
    new Set(
      items
        .map((item) => item?.branch?.branchName)
        .filter(Boolean),
    ),
  );

  return {
    allSelected,
    hasPrescription,
    total,
    selectedCount: selectedItems.length,
    branchNames,
  };
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

