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

export const updatePharmacistDutyStatus = async (isOnDuty) => {
	try {
		return await apiRequest('/pharmacist/duty-status', {
			method: 'PATCH',
			body: { is_on_duty: Boolean(isOnDuty) },
		});
	} catch (error) {
		throw error;
	}
};


