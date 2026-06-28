import { apiRequest } from '../shared/api/apiClient';

export const fetchOrdersCount = async () => {
  const response = await apiRequest.get('/pharmacy/orders/count');
  return Number(response?.total_orders ?? response?.data?.total_orders ?? 0);
};

export const fetchTodayStats = async () => {
  return await apiRequest.get('/pharmacy/orders/stats');
};