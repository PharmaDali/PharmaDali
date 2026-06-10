import { apiRequest } from "../shared/api/apiClient";

export const fetchInventoryMetrics = async () => {
  const response = await apiRequest.get("/branch/inventory/metrics");
  return response.data;
};

export const fetchInventoryProducts = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.category) params.append("category", filters.category);
  if (filters.price_range) params.append("price_range", filters.price_range);
  if (filters.stock_range) params.append("stock_range", filters.stock_range);
  if (filters.status) params.append("status", filters.status);

  const response = await apiRequest.get(`/branch/inventory/products?${params.toString()}`);
  return response.data;
};

export const fetchInventoryLogs = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.action) params.append("action", filters.action);
  if (filters.date_range) params.append("date_range", filters.date_range);

  const response = await apiRequest.get(`/branch/inventory/logs?${params.toString()}`);
  return response.data;
};

export const createInventoryProduct = async (productData) => {
  const response = await apiRequest.post("/products", productData);
  return response.data;
};
