import { apiRequest } from '@shared/api/client';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export async function loginPharmacist({ employeeNumber, password }) {
  return apiRequest('/pharmacist/login', {
    method: 'POST',
    body: {
      employee_number: employeeNumber.trim(),
      password,
    },
  });
}

export async function logoutPharmacist() {
  try {
    await apiRequest('/logout', { method: 'POST' });
  } catch (error) {
    // Ignore network errors so token deletion and client redirect always proceed
  } finally {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem('pharmacist_token');
      } catch {}
    } else {
      try {
        await SecureStore.deleteItemAsync('pharmacist_token');
      } catch {}
    }
  }
}
