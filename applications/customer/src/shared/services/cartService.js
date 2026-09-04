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
    pharmacyProductId: Number(item?.pharmacy_product_id ?? 0),
    description,
    sizeLabel: item?.product?.size ? 'Size' : (item?.product?.strength ? 'Dosage' : 'Size'),
    size: item?.product?.size || item?.product?.strength || 'N/A',
    price: safeUnitPrice,
    quantity: safeQuantity,
    selected: false,
    prescriptionRequired:
      Boolean(item?.prescription_required) ||
      Boolean(item?.product?.is_prescribed) ||
      hasRxMarker(categoryName) ||
      hasRxMarker(description) ||
      hasRxMarker(item?.product?.description),
    isDiscountable:
      typeof item?.is_discountable === 'boolean'
        ? item.is_discountable
        : true,
    pharmacy: {
      id: item?.pharmacy?.id ?? null,
      pharmacyName: item?.pharmacy?.pharmacy_name || 'Unknown pharmacy',
      location: item?.pharmacy?.location || '',
      openingHour: item?.pharmacy?.opening_hour || null,
      closingHour: item?.pharmacy?.closing_hour || null,
      isActive: item?.pharmacy?.is_active ?? true,
    },
    product: item?.product || {},
    category: item?.category || {},
    availability: item?.availability || {},
    img: item?.product?.image_url || item?.product?.image_path || null,
    isAvailable: (() => {
      const isAvailFlag = item?.availability?.is_available ?? item?.is_available;
      const isExpiredFlag = item?.availability?.is_expired ?? item?.is_expired;
      const stock = item?.availability?.stock ?? item?.stock;
      
      const avail = isAvailFlag == null 
        ? true 
        : (typeof isAvailFlag === 'boolean' ? isAvailFlag : Number(isAvailFlag) === 1);
        
      const expired = isExpiredFlag != null && (typeof isExpiredFlag === 'boolean' ? isExpiredFlag : Number(isExpiredFlag) === 1);
      
      if (stock !== undefined && stock <= 0) {
        return false;
      }
      if (expired) {
        return false;
      }
      return avail;
    })(),
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

export async function addCartItem({ pharmacyId, pharmacyProductId, quantity = 1 }) {
  const payload = await apiRequest('/customer/cart/items', {
    method: 'POST',
    body: {
      pharmacy_id: toPositiveInteger(pharmacyId, 0),
      pharmacy_product_id: toPositiveInteger(pharmacyProductId, 0),
      quantity: toPositiveInteger(quantity, 1),
    },
  });

  return {
    message: payload?.message || 'Item added to cart successfully.',
    data: payload?.data || null,
  };
}

export async function removeCartItem(cartItemId) {
  const payload = await apiRequest(`/customer/cart/items/${cartItemId}`, {
    method: 'DELETE',
  });

  return {
    message: payload?.message || 'Item removed from cart.',
    data: payload?.data || null,
  };
}

export async function clearCart() {
  const payload = await apiRequest('/customer/cart/items', {
    method: 'DELETE',
  });

  return {
    message: payload?.message || 'Cart cleared.',
    data: payload?.data || null,
  };
}

export function toggleCartItemSelection(items, id) {
  return items.map((item) =>
    item.id === id && item.isAvailable !== false ? { ...item, selected: !item.selected } : item,
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
  return items.map((item) => (item.isAvailable ? { ...item, selected: selectedValue } : item));
}

function parseTimeToMinutes(timeValue) {
  if (!timeValue || typeof timeValue !== 'string') {
    return null;
  }

  const str = timeValue.trim();

  const ampmMatch = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    const hours12 = Number(ampmMatch[1]);
    const mins = Number(ampmMatch[2]);
    const period = ampmMatch[3].toUpperCase();

    if (hours12 < 1 || hours12 > 12 || mins < 0 || mins > 59) {
      return null;
    }

    const hours24 = (hours12 % 12) + (period === 'PM' ? 12 : 0);
    return (hours24 * 60) + mins;
  }

  const parts = str.split(':');
  if (parts.length >= 2) {
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (Number.isInteger(hours) && Number.isInteger(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return (hours * 60) + minutes;
    }
  }

  return null;
}

export function formatTimeToAmPm(timeValue) {
  const minutes = parseTimeToMinutes(timeValue);

  if (minutes === null) {
    return null;
  }

  const hours24 = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return `${hours12}:${String(mins).padStart(2, '0')} ${period}`;
}

export function isPharmacyOpenNow(openingHour, closingHour, now = new Date()) {
  const openingMinutes = parseTimeToMinutes(openingHour);
  const closingMinutes = parseTimeToMinutes(closingHour);

  if (openingMinutes === null || closingMinutes === null) {
    return true;
  }

  const currentMinutes = (now.getHours() * 60) + now.getMinutes();

  if (openingMinutes === closingMinutes) {
    return true;
  }

  if (openingMinutes < closingMinutes) {
    return currentMinutes >= openingMinutes && currentMinutes < closingMinutes;
  }

  return currentMinutes >= openingMinutes || currentMinutes < closingMinutes;
}

export function buildCartViewState(items) {
  const availableItems = items.filter((item) => item.isAvailable);
  const selectedItems = items.filter((item) => item.selected);
  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasPrescription = items.some((item) => item.prescriptionRequired && item.selected);
  const allSelected = availableItems.length > 0 && availableItems.every((item) => item.selected);

  const targetPharmacy = items.find((item) => item.selected || item.pharmacy?.id)?.pharmacy || items[0]?.pharmacy;
  let isPharmacyOpen = true;
  let closedPharmacyName = '';
  let pharmacyHoursLabel = '';

  if (targetPharmacy) {
    if (targetPharmacy.isActive === false) {
      isPharmacyOpen = false;
      closedPharmacyName = targetPharmacy.pharmacyName;
      pharmacyHoursLabel = 'Temporarily Closed';
    } else if (targetPharmacy.openingHour && targetPharmacy.closingHour) {
      const open = isPharmacyOpenNow(targetPharmacy.openingHour, targetPharmacy.closingHour);
      if (!open) {
        isPharmacyOpen = false;
        closedPharmacyName = targetPharmacy.pharmacyName;
        const openTime = formatTimeToAmPm(targetPharmacy.openingHour);
        const closeTime = formatTimeToAmPm(targetPharmacy.closingHour);
        pharmacyHoursLabel = openTime && closeTime ? `${openTime} – ${closeTime}` : 'Closed';
        pharmacyHoursLabel = openTime && closeTime ? `${openTime} – ${closeTime}` : '';
      }
    }
  }

  const pharmacyNames = Array.from(
    new Set(
      items
        .map((item) => item?.pharmacy?.pharmacyName)
        .filter(Boolean),
    ),
  );

  const pharmacyLocations = Array.from(
    new Set(
      items
        .map((item) => item?.pharmacy?.location)
        .filter(Boolean),
    ),
  );

  return {
    allSelected,
    hasPrescription,
    total,
    selectedCount: selectedItems.length,
    pharmacyNames,
    pharmacyLocations,
    isPharmacyOpen,
    closedPharmacyName,
    pharmacyHoursLabel,
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

