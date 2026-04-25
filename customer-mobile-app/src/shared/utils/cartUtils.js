import { addCartItem } from '@shared/services/cartService';
import { notifyCartCountUpdated } from '@shared/services/cartCountEvents';

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

  try {
    const result = await addCartItem({
      branchId: normalizedBranchId,
      branchProductId: normalizedBranchProductId,
      quantity,
    });

    notifyCartCountUpdated();

    return {
      ok: true,
      message: result.message,
      data: result.data,
    };
  } catch (error) {
    return {
      ok: false,
      errorMessage: error instanceof Error ? error.message : 'Please try again.',
    };
  }
}
