import { apiRequest } from '@shared/api/client';

export const getCustomerProfile = async () => {
  try {
    const response = await apiRequest.get('/customer/profile');
    return response.data;
  }
  catch (error) {
    throw error;
  }
}