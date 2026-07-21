export const maxChartValue = (valueList) => {
  const maxValue = Math.max(...valueList, 0);
  return Math.max(10, Math.ceil(maxValue / 10) * 10);
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
