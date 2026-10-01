import { apiRequest } from '@shared/api/client';

export const getPharmacistProfile = async () => {
	try {
		return await apiRequest('/pharmacist/profile');
	} catch (error) {
		throw error;
	}
};

export const updatePharmacistProfile = async (payload) => {
	try {
		return await apiRequest('/pharmacist/profile', {
			method: 'PUT',
			body: payload,
		});
	} catch (error) {
		throw error;
	}
};

