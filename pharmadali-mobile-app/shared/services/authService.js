import { apiRequest } from '@shared/api/client';

export async function loginCustomer({ email, password }) {
  return apiRequest('/login', {
    method: 'POST',
    body: {
      email: email.trim(),
      password,
    },
  });
}

export async function loginPharmacist({ employeeNumber, password }) {
  return apiRequest('/pharmacist/login', {
    method: 'POST',
    body: {
      employee_number: employeeNumber.trim(),
      password,
    },
  });
}
