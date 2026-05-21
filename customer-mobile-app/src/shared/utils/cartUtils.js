import { addCartItem, getCartItems } from '@shared/services/cartService';
import { notifyCartCountUpdated } from '@shared/services/cartCountEvents';

let cartBranchProductIds = null;

export async function initializeCartProductIdsCache() {
  try {
    const { items } = await getCartItems();
    cartBranchProductIds = new Set(items.map((item) => Number(item.branchProductId)));
  } catch {
    cartBranchProductIds = new Set();
  }
}

export function resetCartProductIdsCache() {
  cartBranchProductIds = null;
}

function parsePositiveInteger(value) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.floor(parsed);
}

export async function addBranchProductToCart({
  branchId,
  branchProductId,
  quantity = 1,
  validationMessages = {},
}) {
  const normalizedBranchId = parsePositiveInteger(branchId);
  const normalizedBranchProductId = parsePositiveInteger(branchProductId);

  if (!normalizedBranchProductId) {
    return {
      ok: false,
      errorMessage: validationMessages.missingProduct || 'Please select a product and try again.',
    };
  }

  if (!normalizedBranchId) {
    return {
      ok: false,
      errorMessage: validationMessages.missingBranch || 'Please select a branch first.',
    };
  }

  // Check if the product is already in the cart using the cache. If the cache is not initialized, fetch from server.
  let isAlreadyInCart = false;
  if (cartBranchProductIds !== null) {
    isAlreadyInCart = cartBranchProductIds.has(normalizedBranchProductId);
  } else {
    try {
      const { items } = await getCartItems();
      cartBranchProductIds = new Set(items.map((item) => Number(item.branchProductId)));
      isAlreadyInCart = cartBranchProductIds.has(normalizedBranchProductId);
    } catch {
      cartBranchProductIds = new Set();
    }
  }

  // Optimistically increment the local cart count badge ONLY if it's a new unique product
  if (!isAlreadyInCart) {
    notifyCartCountUpdated({ type: 'increment', quantity: 1 });
  }

  try {
    const result = await addCartItem({
      branchId: normalizedBranchId,
      branchProductId: normalizedBranchProductId,
      quantity,
    });

    if (cartBranchProductIds !== null) {
      cartBranchProductIds.add(normalizedBranchProductId);
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
