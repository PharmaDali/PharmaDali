import { addCartItem, getCartItems } from '@shared/services/cartService';
import { notifyCartCountUpdated } from '@shared/services/cartCountEvents';

let cartPharmacyProductIds = null;

export async function initializeCartProductIdsCache() {
  try {
    const { items } = await getCartItems();
    cartPharmacyProductIds = new Set(items.map((item) => Number(item.pharmacyProductId)));
  } catch {
    cartPharmacyProductIds = new Set();
  }
}

export function resetCartProductIdsCache() {
  cartPharmacyProductIds = null;
}

function parsePositiveInteger(value) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.floor(parsed);
}

export async function addPharmacyProductToCart({
  pharmacyId,
  pharmacyProductId,
  quantity = 1,
  validationMessages = {},
}) {
  const normalizedPharmacyId = parsePositiveInteger(pharmacyId);
  const normalizedPharmacyProductId = parsePositiveInteger(pharmacyProductId);

  if (!normalizedPharmacyProductId) {
    return {
      ok: false,
      errorMessage: validationMessages.missingProduct || 'Please select a product and try again.',
    };
  }

  if (!normalizedPharmacyId) {
    return {
      ok: false,
      errorMessage: validationMessages.missingPharmacy || 'Please select a pharmacy first.',
    };
  }

  // Check if the product is already in the cart using the cache. If the cache is not initialized, fetch from server.
  let isAlreadyInCart = false;
  if (cartPharmacyProductIds !== null) {
    isAlreadyInCart = cartPharmacyProductIds.has(normalizedPharmacyProductId);
  } else {
    try {
      const { items } = await getCartItems();
      cartPharmacyProductIds = new Set(items.map((item) => Number(item.pharmacyProductId)));
      isAlreadyInCart = cartPharmacyProductIds.has(normalizedPharmacyProductId);
    } catch {
      cartPharmacyProductIds = new Set();
    }
  }

  // Optimistically increment the local cart count badge ONLY if it's a new unique product
  if (!isAlreadyInCart) {
    notifyCartCountUpdated({ type: 'increment', quantity: 1 });
  }

  try {
    const result = await addCartItem({
      pharmacyId: normalizedPharmacyId,
      pharmacyProductId: normalizedPharmacyProductId,
      quantity,
    });

    if (cartPharmacyProductIds !== null) {
      cartPharmacyProductIds.add(normalizedPharmacyProductId);
    }

    // Re-sync with exact server count on success
    notifyCartCountUpdated();

    return {
      ok: true,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    // Rollback the optimistic count change on error by refetching from server
    notifyCartCountUpdated();

    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : 'Please try again.',
    };
  }
}
