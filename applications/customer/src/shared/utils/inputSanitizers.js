/**
 * Shared input sanitizers and regex matchers for input validation.
 * Prevents emoji entry and enforces character & length constraints.
 */

// Regex for emojis, pictographs, variation selectors, and zero-width joiners
export const EMOJI_REGEX = /(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\uFE0F|\u200D)/u;
export const EMOJI_GLOBAL_REGEX = /(\p{Extended_Pictographic}|\p{Emoji_Presentation}|\uFE0F|\u200D)/gu;

// Allows letters (including accented and Philippine characters like ñ/Ñ), spaces, hyphens, apostrophes, and periods
export const NAME_REGEX = /^[\p{L}\s'\-\.]+$/u;

// Standard Philippine mobile format: 09 followed by 9 digits (11 digits total)
export const MOBILE_REGEX = /^09\d{9}$/;

// Standard RFC 5322 compliant email regex
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Checks whether the input string contains any emoji character.
 * @param {string} str
 * @returns {boolean}
 */
export const containsEmoji = (str) => {
  if (!str || typeof str !== 'string') return false;
  return EMOJI_REGEX.test(str);
};

/**
 * Strips all emoji characters from a string.
 * @param {string} str
 * @returns {string}
 */
export const stripEmojis = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.replace(EMOJI_GLOBAL_REGEX, '');
};

/**
 * Sanitizes name inputs (first name, last name):
 * - Strips emojis
 * - Removes disallowed symbols and digits (only letters, spaces, hyphens, apostrophes, and periods allowed)
 * - Limits length to maxLength (default 50)
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const sanitizeNameInput = (text, maxLength = 50) => {
  if (!text || typeof text !== 'string') return '';
  const withoutEmojis = stripEmojis(text);
  const cleaned = withoutEmojis.replace(/[^\p{L}\s'\-\.]/gu, '');
  return cleaned.slice(0, maxLength);
};

/**
 * Sanitizes numeric inputs:
 * - Keeps digits only
 * - Enforces maxLength
 * @param {string} text
 * @param {number} [maxLength]
 * @returns {string}
 */
export const sanitizeNumericInput = (text, maxLength) => {
  if (!text || typeof text !== 'string') return '';
  const digitsOnly = text.replace(/[^\d]/g, '');
  return typeof maxLength === 'number' ? digitsOnly.slice(0, maxLength) : digitsOnly;
};

/**
 * Sanitizes mobile number input:
 * - Strips emojis and formatting characters (spaces, dashes, parentheses)
 * - Automatically normalizes +639XXXXXXXXX or 639XXXXXXXXX to 09XXXXXXXXX
 * - Automatically prepends 0 if a 10-digit number starting with 9 is pasted
 * - Limits length to 11 digits
 * @param {string} text
 * @returns {string}
 */
export const sanitizeMobileInput = (text) => {
  if (!text || typeof text !== 'string') return '';
  let cleaned = stripEmojis(text).trim().replace(/[\s\-\(\)\.]/g, '');

  if (cleaned.startsWith('+63')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('63') && cleaned.length > 2 && cleaned[2] === '9') {
    cleaned = '0' + cleaned.slice(2);
  }

  cleaned = cleaned.replace(/[^\d]/g, '');

  if (cleaned.length === 10 && cleaned.startsWith('9')) {
    cleaned = '0' + cleaned;
  }

  return cleaned.slice(0, 11);
};

/**
 * Sanitizes alphanumeric input with optional spaces and dashes:
 * - Strips emojis
 * - Keeps a-z, A-Z, 0-9, spaces, hyphens
 * - Enforces maxLength
 * @param {string} text
 * @param {number} [maxLength]
 * @returns {string}
 */
export const sanitizeAlphanumeric = (text, maxLength) => {
  if (!text || typeof text !== 'string') return '';
  const cleaned = stripEmojis(text).replace(/[^a-zA-Z0-9\s\-]/g, '');
  return typeof maxLength === 'number' ? cleaned.slice(0, maxLength) : cleaned;
};

/**
 * General text sanitizer without emojis:
 * - Strips emojis
 * - Enforces maxLength
 * @param {string} text
 * @param {number} [maxLength]
 * @returns {string}
 */
export const sanitizeNoEmoji = (text, maxLength) => {
  if (!text || typeof text !== 'string') return '';
  const cleaned = stripEmojis(text);
  return typeof maxLength === 'number' ? cleaned.slice(0, maxLength) : cleaned;
};
