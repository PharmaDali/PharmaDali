/**
 * Formats a date string to mm-dd-yyyy format.
 * @param {string|Date} dateValue - The date string or Date object to format.
 * @returns {string} - The formatted date string (mm-dd-yyyy).
 */
export const formatDateToMMDDYYYY = (dateValue) => {
  if (!dateValue) return 'N/A';
  
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return 'N/A';

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}-${day}-${year}`;
};
