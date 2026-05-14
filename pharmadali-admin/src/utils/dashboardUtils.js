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

export const buildSalesSeriesFromForecastRows = (rows, granularity, fallbackSeries) => {
  const history = rows
    .filter((row) => row?.period === "history")
    .sort((a, b) => new Date(a.ds) - new Date(b.ds))
    .slice(-5);

  const current = rows.find((row) => row?.period === "current");
  const next = rows.find((row) => row?.period === "next");

  const labels = history.map((row) => formatSalesLabel(row.ds, granularity));
  const values = history.map((row) => Number(row.forecast_value));
  const forecastIndex = labels.length;

  if (current?.ds) {
    labels.push(`Forecast ${formatSalesLabel(current.ds, granularity)}`);
    values.push(Number(current.forecast_value));
  }

  if (next?.ds) {
    labels.push(`Forecast ${formatSalesLabel(next.ds, granularity)}`);
    values.push(Number(next.forecast_value));
  }

  if (labels.length === 0) {
    return fallbackSeries;
  }

  return {
    labels,
    values,
    forecastStartIndex: current || next ? forecastIndex : null,
  };
};

const normalizeProductName = (value) => value.replace(/^\d+_/, "");

export const buildTopSellingInsight = (rows) => {
  const filtered = rows.filter((row) => row?.period === "current");
  const candidates = filtered.length > 0 ? filtered : rows;

  const topRow = candidates
    .filter((row) => row?.unique_id && Number.isFinite(Number(row?.forecast_value)))
    .sort((a, b) => Number(b.forecast_value) - Number(a.forecast_value))[0];

  if (!topRow) {
    return null;
  }

  const units = Math.round(Number(topRow.forecast_value));

  return {
    name: normalizeProductName(topRow.unique_id),
    units: Number.isFinite(units) ? units.toLocaleString() : "0",
  };
};

export const calculateSalesGrowthFromForecastRows = (rows) => {
  const history = rows
    .filter((row) => row?.period === "history")
    .sort((a, b) => new Date(a.ds) - new Date(b.ds));

  if (history.length < 2) {
    return null;
  }

  const prevValue = Number(history[history.length - 2]?.forecast_value);
  const lastValue = Number(history[history.length - 1]?.forecast_value);

  if (!Number.isFinite(prevValue) || !Number.isFinite(lastValue) || prevValue <= 0) {
    return null;
  }

  const percent = ((lastValue - prevValue) / prevValue) * 100;
  const rounded = Math.round(percent);
  const label = `${rounded > 0 ? "+" : ""}${rounded}%`;

  return {
    percent: rounded,
    label,
  };
};

export const buildHighestDemandForecast = (currentRows, nextRows) => {
  const nextTop = nextRows
    .filter((row) => row?.unique_id && Number.isFinite(Number(row?.forecast_value)))
    .sort((a, b) => Number(b.forecast_value) - Number(a.forecast_value))[0];

  if (!nextTop) {
    return null;
  }

  const currentMatch = currentRows
    .filter((row) => row?.unique_id === nextTop.unique_id)
    .sort((a, b) => Number(b.forecast_value) - Number(a.forecast_value))[0];

  const nextValue = Number(nextTop.forecast_value);
  const currentValue = Number(currentMatch?.forecast_value);
  const canCompare = Number.isFinite(nextValue) && Number.isFinite(currentValue) && currentValue > 0;
  const percent = canCompare ? Math.round(((nextValue - currentValue) / currentValue) * 100) : null;
  const label = percent !== null ? `${percent > 0 ? "+" : ""}${percent}%` : null;

  return {
    name: normalizeProductName(nextTop.unique_id),
    percent,
    label,
  };
};
