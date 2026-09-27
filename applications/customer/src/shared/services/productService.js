import { apiRequest } from '@shared/api/client';

export async function getProducts(pharmacyId, categoryId = null, { cursor = null, perPage = null, priceMin, priceMax, brands, availability, prescriptionType, sort } = {}) {
  const searchParams = new URLSearchParams();

  if (categoryId !== null && categoryId !== undefined && String(categoryId).trim() !== '' && String(categoryId).toLowerCase() !== 'null') {
    searchParams.append('category_id', String(categoryId));
  }

  if (cursor) {
    searchParams.append('cursor', cursor);
  }

  if (perPage !== null && perPage !== undefined) {
    searchParams.append('per_page', String(perPage));
  }

  if (priceMin !== undefined && priceMin !== null && priceMin !== '' && Number(priceMin) > 0) {
    searchParams.append('price_min', priceMin);
  }
  if (priceMax !== undefined && priceMax !== null && priceMax !== '' && Number(priceMax) < 5000) {
    searchParams.append('price_max', priceMax);
  }
  if (brands && brands.length > 0) {
    searchParams.append('brands', Array.isArray(brands) ? brands.join(',') : brands);
  }
  if (availability && String(availability).trim() !== '') {
    searchParams.append('availability', availability);
  }
  if (prescriptionType && String(prescriptionType).trim() !== '') {
    searchParams.append('prescription_type', prescriptionType);
  }
  if (sort && String(sort).trim() !== '') {
    searchParams.append('sort', sort);
  }

  const query = searchParams.toString();
  const endpoint = `/pharmacies/${pharmacyId}/products${query ? `?${query}` : ''}`;

  return apiRequest(endpoint, {
    method: 'GET',
  });
}

export async function searchProducts(pharmacyId, query, { cursor = null, perPage = null } = {}) {
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
  const endpoint = `/pharmacies/${pharmacyId}/products${queryString ? `?${queryString}` : ''}`;

  return apiRequest(endpoint, {
    method: 'GET',
  });
}

export async function fetchSearchSuggestions(pharmacyId, query) {
  const searchParams = new URLSearchParams();
  searchParams.append('query', query);
  searchParams.append('suggestions', '1');
  const endpoint = `/pharmacies/${pharmacyId}/products?${searchParams.toString()}`;
  return apiRequest(endpoint, { method: 'GET' });
}


export async function getPharmacyProduct(pharmacyId, pharmacyProductId) {
  const endpoint = `/pharmacies/${pharmacyId}/products/${pharmacyProductId}`;
  return apiRequest(endpoint, {
    method: 'GET',
  });
}

export async function getPharmacyCategories(pharmacyId, forceRefresh = false) {
  const searchParams = new URLSearchParams();

  if (forceRefresh) {
    searchParams.append('force_refresh', '1');
  }

  const query = searchParams.toString();
  const endpoint = `/pharmacies/${pharmacyId}/categories${query ? `?${query}` : ''}`;

  return apiRequest(endpoint, {
    method: 'GET',
  });
}

export async function getHeroRecommendations(pharmacyId, { page = 1, perPage = 10 } = {}) {
  const searchParams = new URLSearchParams();
  searchParams.append('pharmacy_id', String(pharmacyId));
  if (page) searchParams.append('page', String(page));
  if (perPage) searchParams.append('per_page', String(perPage));

  const endpoint = `/customer/recommendations/hero?${searchParams.toString()}`;
  return apiRequest(endpoint, {
    method: 'GET',
  });
}
