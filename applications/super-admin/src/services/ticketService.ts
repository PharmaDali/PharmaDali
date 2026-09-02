import api from '../shared/api';

export const getTickets = async (params?: any) => {
  const response = await api.get('/admin/tickets', { params });
  return response.data;
};

export const getTicket = async (id: string | number) => {
  const response = await api.get(`/admin/tickets/${id}`);
  return response.data;
};

export const updateTicketStatus = async (id: string | number, status: string) => {
  const response = await api.patch(`/admin/tickets/${id}/status`, { status });
  return response.data;
};

export const sendTicketMessage = async (id: string | number, formData: FormData) => {
  const response = await api.post(`/admin/tickets/${id}/messages`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};