import api from '../shared/api';

export interface PharmacyPayload {
  pharmacy_name: string;
  location: string;
  contact_number: string;
  email?: string;
  is_active: boolean;
  admin_first_name?: string;
  admin_last_name?: string;
  admin_email?: string;
  admin_mobile_number?: string;
}

export const getPharmacies = async () => {
  const response = await api.get('/pharmacies');
  return response.data;
};

export const createPharmacy = async (payload: PharmacyPayload) => {
  const response = await api.post('/pharmacies', payload);
  return response.data;
};

export const updatePharmacy = async (id: number | string, payload: PharmacyPayload) => {
  const response = await api.put(`/pharmacies/${id}`, payload);
  return response.data;
};

export const deletePharmacy = async (id: number | string) => {
  const response = await api.delete(`/pharmacies/${id}`);
  return response.data;
};
