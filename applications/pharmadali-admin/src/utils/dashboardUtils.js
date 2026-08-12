export const maxChartValue = (valueList) => {
  const maxValue = Math.max(...(valueList || []), 0);
  if (maxValue === 0) return 10;
  
  // Add 25% top headroom so peak data points and line markers are never clipped
  const paddedMax = maxValue * 1.25;
  
  if (paddedMax <= 100) return Math.ceil(paddedMax / 10) * 10;
  if (paddedMax <= 1000) return Math.ceil(paddedMax / 100) * 100;
  return Math.ceil(paddedMax / 1000) * 1000;
};

export const formatSalesLabel = (dateString, granularity) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return dateString;
  }
  if (granularity === "monthly") {
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
};
