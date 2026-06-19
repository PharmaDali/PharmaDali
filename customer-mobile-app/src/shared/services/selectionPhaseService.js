import { apiRequest } from '@shared/api/client';

export async function getPharmacyDataInSelectionPhase() {
  return apiRequest('/pharmacies', {
    method: 'GET',
  });
}