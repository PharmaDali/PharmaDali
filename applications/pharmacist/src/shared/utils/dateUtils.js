/**
 * Formats a date string to mm-dd-yyyy format.
 * @param {string|Date} dateValue - The date string or Date object to format.
 * @returns {string} - The formatted date string (mm-dd-yyyy).
 */
export const formatDateToMMDDYYYY = (dateValue) => {
  if (!dateValue) return null;
  
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return null;

  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}-${day}-${year}`;
};

/**
 * Formats a date value to "Mon DD, YYYY, h:mm A" (e.g. "Sep 25, 2026, 2:30 PM").
 * @param {string|Date} dateValue
 * @returns {string|null}
 */
export const formatShortDateTime12h = (dateValue) => {
  if (!dateValue) return null;

  let date;
  if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'string') {
    let str = dateValue.trim();
    // Default to Asia/Manila (+08:00) if no timezone offset is provided
    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(str)) {
      str = str.replace(' ', 'T') + '+08:00';
    }
    date = new Date(str);
  } else {
    date = new Date(dateValue);
  }

  if (isNaN(date.getTime())) return null;

  try {
    return date.toLocaleString('en-US', {
      timeZone: 'Asia/Manila',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    // Fallback if Intl timezone is not supported
    const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = SHORT_MONTHS[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    return `${month} ${day}, ${year}, ${hours}:${minutes} ${ampm}`;
  }
};

/**
 * Formats a date value to "Mon DD, YYYY" (e.g. "Sep 25, 2026").
 * @param {string|Date} dateValue
 * @returns {string|null}
 */
export const formatShortDate = (dateValue) => {
  if (!dateValue) return null;

  let date;
  if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'string') {
    let str = dateValue.trim();
    if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(str)) {
      str = str.replace(' ', 'T') + '+08:00';
    }
    date = new Date(str);
  } else {
    date = new Date(dateValue);
  }

  if (isNaN(date.getTime())) return null;

  try {
    return date.toLocaleDateString('en-US', {
      timeZone: 'Asia/Manila',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = SHORT_MONTHS[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  }
};
