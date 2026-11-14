import { apiRequest, getStoredToken } from '@shared/api/client';
import * as SecureStore from 'expo-secure-store';

export async function registerCustomer({ credentials }){
  return apiRequest('/customer/register', {
    method: 'POST',
    body: {
      first_name: credentials.firstName.trim(),
      last_name: credentials.lastName.trim(),
      email: credentials.email.trim(),
      password: credentials.password,
      password_confirmation: credentials.confirmPassword,
      mobile_number: credentials.mobileNumber.trim(),
      date_of_birth: credentials.dateOfBirth?.trim() || null,
      address: credentials.address?.trim() || null,
    }

  })
}

export async function loginCustomer({ email, password }) {
  return apiRequest('/login', {
    method: 'POST',
    body: {
      email: email.trim(),
      password,
    },
  });
}

export async function logoutCustomer() {
  const token = await getStoredToken();
  await SecureStore.deleteItemAsync('customer_token');

  if (!token) {
    return;
  }

  const authHeaders = { Authorization: `Bearer ${token}` };

  try {
    await apiRequest('/fcm-token', {
      method: 'DELETE',
      headers: authHeaders,
    });
  } catch (e) {
    console.warn('[Auth] FCM token removal notice:', e);
  }

  try {
    await apiRequest('/logout', {
      method: 'POST',
      headers: authHeaders,
    });
  } catch (e) {
    console.warn('[Auth] Logout API notice:', e);
  }
}

export async function sendForgotPasswordOtp({ email }) {
  return apiRequest('/customer/forgot-password/send-otp', {
    method: 'POST',
    body: {
      email: email.trim(),
    },
  });
}

export async function verifyForgotPasswordOtp({ email, otp }) {
  return apiRequest('/customer/forgot-password/verify-otp', {
    method: 'POST',
    body: {
      email: email.trim(),
      otp: otp.trim(),
    },
  });
}

export async function resetPasswordWithOtp({ email, resetToken, password, passwordConfirmation }) {
  return apiRequest('/customer/forgot-password/reset-password', {
    method: 'POST',
    body: {
      email: email.trim(),
      reset_token: resetToken,
      password,
      password_confirmation: passwordConfirmation,
    },
  });
}

export async function sendCustomerChangePasswordOtp(email) {
  return apiRequest('/customer/change-password/send-otp', {
    method: 'POST',
    body: {
      email: email.trim(),
    },
  });
}

export async function verifyCustomerChangePasswordOtp(email, otp) {
  return apiRequest('/customer/change-password/verify-otp', {
    method: 'POST',
    body: {
      email: email.trim(),
      otp: otp.trim(),
    },
  });
}

export async function resetCustomerPassword({ email, resetToken, password, passwordConfirmation }) {
  return apiRequest('/customer/change-password/reset-password', {
    method: 'POST',
    body: {
      email: email.trim(),
      reset_token: resetToken,
      password,
      password_confirmation: passwordConfirmation,
    },
  });
}


