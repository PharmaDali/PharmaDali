import { apiRequest } from "../shared/api/apiClient";

export const createTicket = async (payload) => {
  const response = await apiRequest.post("/admin/tickets", payload);
  return response;
};