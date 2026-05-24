import { apiRequest } from '@shared/api/client';

export async function getProducts(branchId, categoryId = null, { cursor = null, perPage = null, priceMin, priceMax, brands, availability, prescriptionType, sort } = {}) {
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

  if (priceMin !== undefined) searchParams.append('price_min', priceMin);
  if (priceMax !== undefined) searchParams.append('price_max', priceMax);
  if (brands && brands.length > 0) searchParams.append('brands', brands.join(','));
  if (availability) searchParams.append('availability', availability);
  if (prescriptionType) searchParams.append('prescription_type', prescriptionType);
  if (sort) searchParams.append('sort', sort);

  const query = searchParams.toString();
  const endpoint = `/branches/${branchId}/products${query ? `?${query}` : ''}`;

  return apiRequest(endpoint, {
    method: 'GET',
  });
}

export async function searchProducts(branchId, query, { cursor = null, perPage = null } = {}) {
  const searchParams = new URLSearchParams();

  if (query) {
    searchParams.append('query', query);
  }

  if (cursor) {
    searchParams.append('cursor', cursor);
  }

  if (perPage !== null && perPage !== undefined) {
    searchParams.append('per_page', String(perPage));
  }

  const queryString = searchParams.toString();
  const endpoint = `/branches/${branchId}/products${queryString ? `?${queryString}` : ''}`;

  return apiRequest(endpoint, {
    method: 'GET',
  });
}

export async function getBranchProduct(branchId, branchProductId) {
  const endpoint = `/branches/${branchId}/products/${branchProductId}`;
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