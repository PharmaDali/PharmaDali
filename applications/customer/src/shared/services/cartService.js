import { apiRequest } from '@shared/api/client';
import { getManilaMinutes, formatPharmacyHoursLabel } from '@src/utils/pickupScheduleUtils';

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
    isDiscountable: (() => {
      const val = item?.is_discountable ?? item?.pharmacy_product?.is_discountable ?? item?.pharmacyProduct?.is_discountable;
      if (val === undefined || val === null) return true;
      if (typeof val === 'boolean') return val;
      if (typeof val === 'number') return val !== 0;
      if (typeof val === 'string') return val === '1' || val.toLowerCase() === 'true';
      return Boolean(val);
    })(),
    pharmacy: {
      id: item?.pharmacy?.id ?? null,
      pharmacyName: item?.pharmacy?.pharmacy_name || 'Unknown pharmacy',
      location: item?.pharmacy?.location || '',
      openingHour: item?.pharmacy?.opening_hour || null,
      closingHour: item?.pharmacy?.closing_hour || null,
      opening_hour: item?.pharmacy?.opening_hour || null,
      closing_hour: item?.pharmacy?.closing_hour || null,
      formattedOpeningHour: formatTimeToAmPm(item?.pharmacy?.opening_hour),
      formattedClosingHour: formatTimeToAmPm(item?.pharmacy?.closing_hour),
      hours: (item?.pharmacy?.opening_hour && item?.pharmacy?.closing_hour)
        ? `${formatTimeToAmPm(item?.pharmacy?.opening_hour)} – ${formatTimeToAmPm(item?.pharmacy?.closing_hour)}`
        : null,
      isActive: item?.pharmacy?.is_active ?? true,
    },
    product: item?.product || {},
    category: item?.category || {},
    availability: item?.availability || {},
    img: item?.product?.image_url || item?.product?.image_path || null,
    stock: item?.availability?.stock ?? item?.stock ?? 0,
    isAvailable: (() => {
      const isAvailFlag = item?.availability?.is_available ?? item?.is_available;
      if (isAvailFlag == null) return true;
      return typeof isAvailFlag === 'boolean' ? isAvailFlag : Number(isAvailFlag) === 1;
    })(),
    isOutOfStock: (() => {
      const isOosFlag = item?.availability?.is_out_of_stock ?? item?.is_out_of_stock;
      if (isOosFlag != null) {
        return typeof isOosFlag === 'boolean' ? isOosFlag : Number(isOosFlag) === 1;
      }
      const stock = item?.availability?.stock ?? item?.stock;
      if (stock !== undefined && stock !== null) {
        return Number(stock) <= 0;
      }
      return false;
    })(),
    isExpired: (() => {
      const isExpiredFlag = item?.availability?.is_expired ?? item?.is_expired;
      return isExpiredFlag != null && (typeof isExpiredFlag === 'boolean' ? isExpiredFlag : Number(isExpiredFlag) === 1);
    })(),
    get canCheckout() {
      return Boolean(this.isAvailable && !this.isOutOfStock && !this.isExpired);
    },
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
    item.id === id && item.canCheckout ? { ...item, selected: !item.selected } : item,
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
  return items.map((item) => (item.canCheckout ? { ...item, selected: selectedValue } : item));
}

function parseTimeToMinutes(timeValue) {
  if (!timeValue || typeof timeValue !== 'string') {
    return null;
  }

  const str = timeValue.trim();

  const ampmMatch = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (ampmMatch) {
    const hours12 = Number(ampmMatch[1]);
    const mins = Number(ampmMatch[2] || 0);
    const period = ampmMatch[3].toUpperCase();

    if (hours12 >= 1 && hours12 <= 12 && mins >= 0 && mins <= 59) {
      const hours24 = (hours12 % 12) + (period === 'PM' ? 12 : 0);
      return (hours24 * 60) + mins;
    }
  }

  const match24 = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const hours = Number(match24[1]);
    const minutes = Number(match24[2]);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
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
    return false;
  }

  const currentMinutes = getManilaMinutes(now);

  if (openingMinutes === closingMinutes) {
    return true;
  }

  if (openingMinutes < closingMinutes) {
    return currentMinutes >= openingMinutes && currentMinutes < closingMinutes;
  }

  return currentMinutes >= openingMinutes || currentMinutes < closingMinutes;
}

export function buildCartViewState(items, selectedPharmacyFallback = null) {
  const availableItems = items.filter((item) => item.canCheckout);
  const selectedItems = items.filter((item) => item.selected);
  const total = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const hasPrescription = items.some((item) => item.prescriptionRequired && item.selected);
  const allSelected = availableItems.length > 0 && availableItems.every((item) => item.selected);

  const itemPharmacy = items.find((item) => (item.selected && item.pharmacy?.id) || item.pharmacy?.id)?.pharmacy || items[0]?.pharmacy;
  const targetPharmacy = itemPharmacy || (selectedPharmacyFallback ? {
    id: selectedPharmacyFallback.id ?? selectedPharmacyFallback.pharmacy_id,
    pharmacyName: selectedPharmacyFallback.name || selectedPharmacyFallback.pharmacy_name || 'Selected pharmacy',
    location: selectedPharmacyFallback.address || selectedPharmacyFallback.location || '',
    openingHour: selectedPharmacyFallback.opening_hour || selectedPharmacyFallback.openingHour || selectedPharmacyFallback.formattedOpeningHour,
    closingHour: selectedPharmacyFallback.closing_hour || selectedPharmacyFallback.closingHour || selectedPharmacyFallback.formattedClosingHour,
    opening_hour: selectedPharmacyFallback.opening_hour || selectedPharmacyFallback.openingHour || selectedPharmacyFallback.formattedOpeningHour,
    closing_hour: selectedPharmacyFallback.closing_hour || selectedPharmacyFallback.closingHour || selectedPharmacyFallback.formattedClosingHour,
    formattedOpeningHour: selectedPharmacyFallback.formattedOpeningHour,
    formattedClosingHour: selectedPharmacyFallback.formattedClosingHour,
    isActive: selectedPharmacyFallback.isActive ?? selectedPharmacyFallback.is_active ?? selectedPharmacyFallback.isOperating,
    isOpen: selectedPharmacyFallback.isOpen,
    hours: selectedPharmacyFallback.hours,
  } : null);

  const hoursLabel =
    formatPharmacyHoursLabel(targetPharmacy) ||
    formatPharmacyHoursLabel(selectedPharmacyFallback) ||
    formatPharmacyHoursLabel(itemPharmacy) ||
    '';

  let isPharmacyOpen = true;
  let closedPharmacyName = '';
  let pharmacyHoursLabel = '';

  const activeSource = targetPharmacy || selectedPharmacyFallback;

  if (activeSource) {
    const rawIsActive = activeSource.isActive ?? activeSource.is_active ?? activeSource.isOperating;
    const isInactive = rawIsActive === false || rawIsActive === 0 || rawIsActive === '0';

    const effectiveOpenHour =
      targetPharmacy?.openingHour ||
      targetPharmacy?.opening_hour ||
      selectedPharmacyFallback?.openingHour ||
      selectedPharmacyFallback?.opening_hour;

    const effectiveCloseHour =
      targetPharmacy?.closingHour ||
      targetPharmacy?.closing_hour ||
      selectedPharmacyFallback?.closingHour ||
      selectedPharmacyFallback?.closing_hour;

    if (isInactive) {
      isPharmacyOpen = false;
      closedPharmacyName = activeSource.pharmacyName || activeSource.name || 'Pharmacy';
      pharmacyHoursLabel = hoursLabel || 'Temporarily Closed';
    } else if (effectiveOpenHour && effectiveCloseHour) {
      const open = isPharmacyOpenNow(effectiveOpenHour, effectiveCloseHour);
      if (!open) {
        isPharmacyOpen = false;
        closedPharmacyName = activeSource.pharmacyName || activeSource.name || 'Pharmacy';
        pharmacyHoursLabel = hoursLabel || `${formatTimeToAmPm(effectiveOpenHour)} – ${formatTimeToAmPm(effectiveCloseHour)}`;
      }
    } else if (activeSource.isOpen === false) {
      isPharmacyOpen = false;
      closedPharmacyName = activeSource.pharmacyName || activeSource.name || 'Pharmacy';
      pharmacyHoursLabel = hoursLabel || '';
    }
  } else if (selectedPharmacyFallback?.isOpen === false) {
    isPharmacyOpen = false;
    closedPharmacyName = selectedPharmacyFallback?.name || selectedPharmacyFallback?.pharmacy_name || 'Pharmacy';
    pharmacyHoursLabel = hoursLabel || '';
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

