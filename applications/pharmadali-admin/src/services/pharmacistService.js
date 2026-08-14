import { apiRequest } from "../shared/api/apiClient";

export const fetchPharmacists = async () => {
  const res = await apiRequest.get("/pharmacists");
  return Array.isArray(res) ? res : (res?.data || []);
};

export const createPharmacist = async (data) => {
  const res = await apiRequest.post("/pharmacist/register", data);
  return res?.data || res;
};

export const updatePharmacist = async (id, data) => {
  const res = await apiRequest.put(`/pharmacists/${id}`, data);
  return res?.data || res;
};

export const deletePharmacist = async (id) => {
  const res = await apiRequest.delete(`/pharmacists/${id}`);
  return res?.data || res;
};

export const updatePharmacistPermissions = async (id, permissions) => {
  const res = await apiRequest.put(`/pharmacists/${id}/permissions`, { permissions });
  return res?.data || res;
};
