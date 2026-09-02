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

export const sendAdminChangePasswordOtp = async (payload) => {
  return await apiRequest.post("/admin/change-password/send-otp", payload);
};

export const verifyAdminChangePasswordOtp = async (payload) => {
  return await apiRequest.post("/admin/change-password/verify-otp", payload);
};

export const updateAdminPasswordWithOtp = async (payload) => {
  return await apiRequest.post("/admin/change-password/reset-password", payload);
};
