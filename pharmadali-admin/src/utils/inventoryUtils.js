
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

