import { apiRequest } from '@shared/api/client';

export async function getBranchDataInSelectionPhase() {
  return apiRequest('/branches', {
    method: 'GET',
  });
}