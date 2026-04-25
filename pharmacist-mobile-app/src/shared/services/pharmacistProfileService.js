import { apiRequest } from '@shared/api/client';

export const getPharmacistProfile = async () => {
	try {
		return await apiRequest('/pharmacist/profile');
	} catch (error) {
		throw error;
	}
};
