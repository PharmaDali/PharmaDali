import { apiRequest } from "../shared/api/apiClient";

export const fetchOrderExchangeEligibility = async (orderId) => {
  const response = await apiRequest.get(`/pos/orders/${orderId}/exchange-eligibility`);
  return response;
};

export const processItemExchange = async (exchangeData) => {
  const response = await apiRequest.post("/pos/exchanges", exchangeData);
  return response;
};

export const fetchExchangeDetails = async (exchangeId) => {
  const response = await apiRequest.get(`/pos/exchanges/${exchangeId}`);
  return response;
};

export const fetchExchangeHistory = async ({ search = "", page = 1 } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (page) params.append("page", page);

  const response = await apiRequest.get(`/pos/exchanges?${params.toString()}`);
  return response;
};
