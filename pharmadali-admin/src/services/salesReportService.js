import { apiRequest } from "../shared/api/apiClient";

export const fetchSalesSummary = async () => {
  const data = await apiRequest.get("/pharmacy/reports/sales/summary");
  return data;
};

export const fetchSalesList = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.start_date) params.append("start_date", filters.start_date);
  if (filters.end_date) params.append("end_date", filters.end_date);
  if (filters.per_page) params.append("per_page", filters.per_page);
  if (filters.page) params.append("page", filters.page);

  const data = await apiRequest.get(`/pharmacy/reports/sales?${params.toString()}`);
  return data;
};
