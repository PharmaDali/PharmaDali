import { apiRequest } from '@shared/api/client';

export async function loginPharmacist({ employeeNumber, password }) {
  return apiRequest('/pharmacist/login', {
    method: 'POST',
    body: {
      employee_number: employeeNumber.trim(),
      password,
    },
  });
}
