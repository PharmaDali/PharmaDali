import { apiRequest } from '@shared/api/client';

export async function getProducts(branchId) {
  return apiRequest(`/branches/${branchId}/products`, {
    method: 'GET',
  });
}