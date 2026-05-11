import { apiRequest } from '@shared/api/client';

export async function getProducts(branchId, categoryId = null, { cursor = null, perPage = null } = {}) {
  const searchParams = new URLSearchParams();

  if (categoryId !== null && categoryId !== undefined) {
    searchParams.append('category_id', String(categoryId));
  }

  if (cursor) {
    searchParams.append('cursor', cursor);
  }

  if (perPage !== null && perPage !== undefined) {
    searchParams.append('per_page', String(perPage));
  }

  const query = searchParams.toString();
  const endpoint = `/branches/${branchId}/products${query ? `?${query}` : ''}`;

  return apiRequest(endpoint, {
    method: 'GET',
  });
}

export async function getBranchCategories(branchId, forceRefresh = false) {
  const searchParams = new URLSearchParams();

  if (forceRefresh) {
    searchParams.append('force_refresh', '1');
  }

  const query = searchParams.toString();
  const endpoint = `/branches/${branchId}/categories${query ? `?${query}` : ''}`;

  return apiRequest(endpoint, {
    method: 'GET',
  });
}