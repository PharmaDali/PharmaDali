import { apiRequest } from '@shared/api/client';

export const getCustomerProfile = async () => {
  try {
    const response = await apiRequest('/customer/profile');
    return response;
  }
  catch (error) {
    throw error;
  }
}