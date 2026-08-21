import { apiRequest } from "../shared/api/apiClient";

export async function fetchDiscounts(all = false) {
  const response = await apiRequest.get(`/pharmacy/discounts${all ? "?all=true" : ""}`);
  return response;
}

export async function createDiscount(data) {
  const response = await apiRequest.post("/pharmacy/discounts", data);
  return response;
}

export async function updateDiscount(id, data) {
  const response = await apiRequest.put(`/pharmacy/discounts/${id}`, data);
  return response;
}

export async function deleteDiscount(id) {
  const response = await apiRequest.delete(`/pharmacy/discounts/${id}`);
  return response;
}
