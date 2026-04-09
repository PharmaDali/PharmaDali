import { apiRequest } from '../shared/api/apiClient';

export const fetchOrdersCount = async () => {
  try {
    const response = await apiRequest.get('/branch/orders/count');
    return Number(response?.total_orders ?? 0);
  } catch {
    const response = await apiRequest.get('/admin/orders/count');
    return Number(response?.total_orders ?? 0);
  }
};