import { apiRequest } from '@shared/api/client';

export const updateOrderStatusByPharmacist = async (orderId, action, reason, section = null) => {
  try {
    return await apiRequest(`/pharmacist/orders/${orderId}/status`, {
      method: 'PATCH',
      body: {
        action,
        ...(reason ? { reason } : {}),
        ...(section ? { section } : {}),
      },
    });
  } catch (error) {
    throw error;
  }
};

export const getPharmacyOrders = async (params = {}) => {
  try {
    let queryParams = new URLSearchParams();

    if (typeof params === 'string') {
      queryParams.append('status', params);
    } else if (typeof params === 'object' && params !== null) {
      if (params.tab) queryParams.append('tab', params.tab);
      if (params.status) queryParams.append('status', params.status);
      if (params.page) queryParams.append('page', params.page);
      if (params.perPage) queryParams.append('per_page', params.perPage);
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const response = await apiRequest(`/pharmacist/orders${queryString}`);

    if (response && Array.isArray(response.data) && response.current_page !== undefined) {
      return {
        items: response.data,
        currentPage: response.current_page,
        lastPage: response.last_page,
        total: response.total,
        hasMore: Boolean(response.has_more),
      };
    }

    const rawData = response?.data || response || [];
    return {
      items: Array.isArray(rawData) ? rawData : [],
      currentPage: 1,
      lastPage: 1,
      total: Array.isArray(rawData) ? rawData.length : 0,
      hasMore: false,
    };
  } catch (error) {
    throw error;
  }
};
