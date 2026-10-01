import { apiRequest } from "@shared/api/client";

export const getCustomerProfile = async () => {
  const response = await apiRequest("/customer/profile");
  return response;
};

export const updateCustomerProfile = async (payload) => {
  const response = await apiRequest("/customer/profile", {
    method: "PUT",
    body: payload,
  });
  return response;
};


