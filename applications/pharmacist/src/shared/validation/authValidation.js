import {
  containsEmoji,
  EMAIL_REGEX,
  MOBILE_REGEX,
  NAME_REGEX,
} from '@shared/utils/inputSanitizers';

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

  // --- Strict Emoji Check ---
  if (
    containsEmoji(firstName) ||
    containsEmoji(lastName) ||
    containsEmoji(email) ||
    containsEmoji(password) ||
    containsEmoji(confirmPassword) ||
    containsEmoji(mobileNumber) ||
    (address && containsEmoji(address))
  ) {
    return 'Input fields cannot contain emojis.';
  }

  // --- First Name Validation ---
  const trimmedFirstName = firstName.trim();
  if (trimmedFirstName.length < 2 || trimmedFirstName.length > 50) {
    return 'First name must be between 2 and 50 characters.';
  }
  if (!NAME_REGEX.test(trimmedFirstName)) {
    return 'First name can only contain letters, spaces, hyphens, and apostrophes.';
  }

  // --- Last Name Validation ---
  const trimmedLastName = lastName.trim();
  if (trimmedLastName.length < 2 || trimmedLastName.length > 50) {
    return 'Last name must be between 2 and 50 characters.';
  }
  if (!NAME_REGEX.test(trimmedLastName)) {
    return 'Last name can only contain letters, spaces, hyphens, and apostrophes.';
  }

  // --- Email Validation ---
  const trimmedEmail = email.trim();
  if (trimmedEmail.length > 100) {
    return 'Email address must not exceed 100 characters.';
  }
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return 'Please enter a valid email address.';
  }

  // --- Mobile Number Validation ---
  const trimmedMobile = mobileNumber.trim();
  if (!MOBILE_REGEX.test(trimmedMobile)) {
    return 'Please enter a valid 11-digit mobile number (e.g., 09XXXXXXXXX).';
  }

  // --- Password Validation ---
  if (password.length < 8) {
    return 'Password must be at least 8 characters.';
  }
  if (password.length > 64) {
    return 'Password must not exceed 64 characters.';
  }
  if (password !== confirmPassword) {
    return 'Password and confirm password do not match.';
  }

  // --- Date of Birth Validation ---
  if (!dateOfBirth) {
    return 'Date of birth is required.';
  }

  // --- Address Validation ---
  if (!address?.trim()) {
    return 'Address is required.';
  }
  const trimmedAddress = address.trim();
  if (trimmedAddress.length < 5 || trimmedAddress.length > 150) {
    return 'Address must be between 5 and 150 characters.';
  }

  return '';
}

export function validateCustomerLogin({ email, password }) {
  if (!email?.trim() || !password) {
    return 'Email and password are required.';
  }

  if (containsEmoji(email) || containsEmoji(password)) {
    return 'Input fields cannot contain emojis.';
  }

  if (email.trim().length > 100) {
    return 'Email address must not exceed 100 characters.';
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return 'Please enter a valid email address.';
  }

  return '';
}

export function validatePharmacistLogin({ employeeNumber, password }) {
  if (!employeeNumber?.trim() || !password) {
    return 'Employee number and password are required.';
  }

  if (containsEmoji(employeeNumber) || containsEmoji(password)) {
    return 'Input fields cannot contain emojis.';
  }

  if (employeeNumber.trim().length > 20) {
    return 'Employee number must not exceed 20 characters.';
  }

  return '';
}
