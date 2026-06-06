import { apiRequest } from "../shared/api/apiClient";

export const fetchPharmacists = async () => {
  return await apiRequest.get("/pharmacists");
};

export const createPharmacist = async (data) => {
  return await apiRequest.post("/pharmacist/register", data);
};

export const updatePharmacist = async (id, data) => {
  return await apiRequest.put(`/pharmacists/${id}`, data);
};

export const deletePharmacist = async (id) => {
  return await apiRequest.delete(`/pharmacists/${id}`);
};
