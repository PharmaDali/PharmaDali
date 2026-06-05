import { apiRequest } from "../shared/api/apiClient";

export const fetchPharmacists = async () => {
  return await apiRequest.get("/pharmacists");
};

export const createPharmacist = async (data) => {
  return await apiRequest.post("/pharmacist/register", data);
};
