export const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const formatStockLeft = (stock, { compact = false } = {}) => {
  if (stock === undefined || stock === null || stock === '') return null;
  const num = Number(stock);
  if (Number.isNaN(num)) return null;
  if (num <= 0) return 'Out of stock';
  if (num === 1) return compact ? '1 left' : '1 stock left';
  if (num <= 10) return compact ? `Only ${num} left` : `Only ${num} stocks left`;
  return `${num} stocks left`;
};

export const getStockTextColor = (stock) => {
  const num = Number(stock);
  if (num <= 0) {
    return '#DC2626';
  }
  if (num <= 10) {
    return '#D97706';
  }
  return '#64748B';
};

export const getStockStatusColor = (stock) => ({
  dot: getStockTextColor(stock),
  text: getStockTextColor(stock),
  badgeBg: '#F3F4F6',
  badgeText: getStockTextColor(stock),
});