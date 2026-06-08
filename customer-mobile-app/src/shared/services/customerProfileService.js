import { apiRequest } from "@shared/api/client";

export const getCustomerProfile = async () => {
  const response = await apiRequest("/customer/profile");
  return response;
};

