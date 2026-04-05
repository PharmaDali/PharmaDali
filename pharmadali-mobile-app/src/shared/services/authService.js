import { apiRequest } from '@shared/api/client';

export async function registerCustomer({ credentials }){
  return apiRequest('/register', {
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

export async function registerPharmacist({ credentials }) {
  return apiRequest('/register', {
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
      role: 'pharmacist',
      employee_number: credentials.employeeNumber.trim(),
      license_number: credentials.licenseNumber.trim(),
    },
  });
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

export async function loginPharmacist({ employeeNumber, password }) {
  return apiRequest('/pharmacist/login', {
    method: 'POST',
    body: {
      employee_number: employeeNumber.trim(),
      password,
    },
  });
}
