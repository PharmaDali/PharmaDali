/**
 * Formats a value as Philippine Peso (PHP).
 * @param {number|string} val
 * @returns {string} 
 */
export const formatCurrency = (val) => {
  return `PHP ${Number(val).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Formats a value with a units suffix.
 * @param {number|string} val
 * @returns {string} 
 */
export const formatNumber = (val) => {
  return `${Number(val).toLocaleString()} units`;
};
