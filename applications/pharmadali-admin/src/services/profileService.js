import { apiRequest } from "../shared/api/apiClient";

export const getAdminProfile = async () => {
  const response = await apiRequest.get("/admin/profile");
  return response.data;
};

export const updateAdminProfile = async (payload) => {
  const response = await apiRequest.patch("/admin/profile", payload);
  return response.data;
};

export const updateAdminPharmacy = async (payload) => {
  const response = await apiRequest.patch("/admin/pharmacy", payload);
  return response.pharmacy;
};
