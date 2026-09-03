import api from '../shared/api';

export interface PharmacyPayload {
  pharmacy_name: string;
  location: string;
  contact_number: string;
  is_active: boolean;
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
