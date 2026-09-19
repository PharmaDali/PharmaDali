import { apiRequest } from '@shared/api/client';

export async function getPharmacyDataInSelectionPhase() {
  return apiRequest(`/pharmacies?refresh=1&t=${Date.now()}`, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
}

export async function getPharmacyById(pharmacyId) {
  if (!pharmacyId) return null;
  return apiRequest(`/pharmacies/${pharmacyId}?refresh=1&t=${Date.now()}`, {
    method: 'GET',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
}