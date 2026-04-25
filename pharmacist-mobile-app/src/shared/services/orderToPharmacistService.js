import { apiRequest } from '@shared/api/client';

export const updateOrderStatusByPharmacist = async (orderId, action, reason) => {
  try {
    return await apiRequest(`/pharmacist/orders/${orderId}/status`, {
      method: 'PATCH',
      body: {
        action,
        ...(reason ? { reason } : {}),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getBranchOrders = async (status) => {
  try {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const response = await apiRequest(`/pharmacist/orders${query}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
