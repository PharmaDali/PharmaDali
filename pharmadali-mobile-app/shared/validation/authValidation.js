const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCustomerLogin({ email, password }) {
  if (!email.trim() || !password) {
    return 'Email and password are required.';
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Please enter a valid email address.';
  }

  return '';
}

export function validatePharmacistLogin({ employeeNumber, password }) {
  if (!employeeNumber.trim() || !password) {
    return 'Employee number and password are required.';
  }

  return '';
}
