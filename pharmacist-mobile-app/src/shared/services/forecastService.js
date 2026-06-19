import { apiRequest } from '@shared/api/client';

export const getDemandForecasts = async ({ granularity = 'weekly', period = 'current', limit = 10 } = {}) => {
  const query = new URLSearchParams({
    kind: 'demand',
    granularity,
    period,
    limit: String(limit),
  }).toString();

  const response = await apiRequest(`/pharmacy/forecasts?${query}`);
  return response.data || [];
};
