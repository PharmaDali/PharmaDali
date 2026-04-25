const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^09\d{9}$/;

export function validateCustomerRegistration(credentials = {}) {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    mobileNumber,
    dateOfBirth,
    address,
  } = credentials;

  if (
    !firstName?.trim() ||
    !lastName?.trim() ||
    !email?.trim() ||
    !password ||
    !confirmPassword ||
    !mobileNumber?.trim()
  ) {
    return 'Please complete all required fields.';
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Please enter a valid email address.';
  }

  if (!MOBILE_REGEX.test(mobileNumber.trim())) {
    return 'Please enter a valid mobile number (e.g., 09XXXXXXXXX).';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }

  if (password !== confirmPassword) {
    return 'Password and confirm password do not match.';
  }

  if (!dateOfBirth) {
    return 'Date of birth is required.';
  }

  if (!address?.trim()) {
    return 'Address is required.';
  }

  return '';
}

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
