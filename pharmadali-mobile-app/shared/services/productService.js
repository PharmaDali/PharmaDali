import { apiRequest } from '@shared/api/client';

export async function getProducts(branchId, categoryId = null) {
  const searchParams = new URLSearchParams();

  if (categoryId !== null && categoryId !== undefined) {
    searchParams.append('category_id', String(categoryId));
  }

  const query = searchParams.toString();
  const endpoint = `/branches/${branchId}/products${query ? `?${query}` : ''}`;

  return apiRequest(endpoint, {
    method: 'GET',
  });
}

export async function getBranchCategories(branchId) {
  return apiRequest(`/branches/${branchId}/categories`, {
    method: 'GET',
  });
}