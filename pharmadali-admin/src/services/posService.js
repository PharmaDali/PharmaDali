import { apiRequest } from "../shared/api/apiClient";

export const fetchPosProducts = async ({ search = "", page = 1, perPage = 20 } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (page) params.append("page", page);
  if (perPage) params.append("per_page", perPage);

  const response = await apiRequest.get(`/pos/products?${params.toString()}`);
  return response;
};

export const createPosOrder = async (orderData) => {
  const response = await apiRequest.post("/pos/orders", orderData);
  return response;
};

export const fetchPickupOrders = async ({ search = "", status = "all" } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status) params.append("status", status.toLowerCase());

  const response = await apiRequest.get(`/pos/pickup-orders?${params.toString()}`);
  return response;
};

export const completePickupOrder = async (orderId, paymentMethod, amountReceived = null, changeAmount = null) => {
  const response = await apiRequest.patch(`/pos/pickup-orders/${orderId}/complete`, {
    payment_method: paymentMethod,
    amount_received: amountReceived,
    change_amount: changeAmount,
  });
  return response;
};
