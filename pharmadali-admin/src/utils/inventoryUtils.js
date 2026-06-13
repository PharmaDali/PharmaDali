/**
 * Format expiry days to YYYY-MM format.
 */
export const formatExpiryMonthValue = (days) => {
  if (days === null || days === undefined) return "";
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}`;
};

/**
 * Get remaining days until a given YYYY-MM month.
 */
export const getDaysUntilMonth = (value) => {
  if (!value) {
    return 0;
  }

  const [yearValue, monthValue] = value.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);

  if (!year || !month) {
    return 0;
  }

  const targetDate = new Date(year, month - 1, 1);
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = targetDate.getTime() - todayDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Safely parse a value to number or fallback.
 */
export const toNumber = (value, fallback = 0) => {
  const next = Number(value);
  return Number.isNaN(next) ? fallback : next;
};

/**
 * Estimate how many weeks left based on restock item velocity rates.
 */
export const getWeeksLeft = (item) => {
  const velocityRates = { Fast: 4, Medium: 2, Slow: 1 };
  const weeklyUsage = (velocityRates[item.velocity] ?? 2) * 7;
  const weeksLeft = Math.round(item.quantity / weeklyUsage);

  if (weeksLeft <= 1) {
    return "less than 1";
  }

  return `${weeksLeft}`;
};

/**
 * Get remaining days until a given date (YYYY-MM-DD).
 */
export const getDaysUntilDate = (value) => {
  if (!value) return 0;
  const targetDate = new Date(value);
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = targetDate.getTime() - todayDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};
