import { apiRequest } from "../shared/api/apiClient";

export const fetchPosProducts = async ({ search = "", page = 1, perPage = 20 } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (page) params.append("page", page);
  if (perPage) params.append("per_page", perPage);

  const response = await apiRequest.get(`/pos/products?${params.toString()}`);
  return response;
};
