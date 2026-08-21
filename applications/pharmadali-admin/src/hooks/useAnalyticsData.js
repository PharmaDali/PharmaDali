import { useState, useEffect, useMemo } from "react";
import { fetchDemandAnalytics, fetchSalesAnalytics, fetchAnalyticsInsights } from "../services/analyticsService";
import { formatCurrency, formatNumber } from "../utils/formatUtils";
import { demandOptions, salesOptions } from "../constants/analyticsConstants";

function getPeriodInfo(timeframe, offset = 0) {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);

  if (timeframe === "weekly") {
    const dayOfWeek = now.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const currentMonday = new Date(now);
    currentMonday.setDate(now.getDate() + distanceToMonday + offset * 7);
    
    start = currentMonday;
    end = new Date(currentMonday);
    end.setDate(currentMonday.getDate() + 6);
  } else if (timeframe === "monthly") {
    start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  } else if (timeframe === "daily") {
    start = new Date(now);
    start.setDate(now.getDate() + offset);
    end = new Date(start);
  } else if (timeframe === "annually" || timeframe === "yearly") {
    start = new Date(now.getFullYear() + offset, 0, 1);
    end = new Date(now.getFullYear() + offset, 11, 31);
  }

  const startStr = start.toISOString().split("T")[0];
  const endStr = end.toISOString().split("T")[0];

  let label = "";
  if (timeframe === "weekly") {
    const startFormatted = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endFormatted = end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    label = `${startFormatted} - ${endFormatted}`;
  } else if (timeframe === "monthly") {
    label = start.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  } else if (timeframe === "daily") {
    label = start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } else if (timeframe === "annually" || timeframe === "yearly") {
    label = start.getFullYear().toString();
  }

  return {
    startDate: startStr,
    endDate: endStr,
    label,
    isCurrentPeriod: offset >= 0,
  };
}

export function useAnalyticsData() {
  const [activeTab, setActiveTab] = useState("demand");

  // Table-specific filtering state
  const [tableDemandTimeframe, setTableDemandTimeframe] = useState("monthly");
  const [tableSalesTimeframe, setTableSalesTimeframe] = useState("daily");
  const [demandOffset, setDemandOffset] = useState(0);
  const [salesOffset, setSalesOffset] = useState(0);

  // Chart-specific filtering state
  const [chartDemandTimeframe, setChartDemandTimeframe] = useState("monthly");
  const [chartSalesTimeframe, setChartSalesTimeframe] = useState("daily");
  
  const [demandData, setDemandData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [chartTimeseries, setChartTimeseries] = useState({ labels: [], values: [] });
  
  const [tableLoading, setTableLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);

  // Gemini AI Insight state
  const [insightText, setInsightText] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightSource, setInsightSource] = useState("gemini");

  const isDemand = activeTab === "demand";

  // Active table calculations
  const activeTableTimeframe = isDemand ? tableDemandTimeframe : tableSalesTimeframe;
  const activeOffset = isDemand ? demandOffset : salesOffset;
  const periodInfo = getPeriodInfo(activeTableTimeframe, activeOffset);

  // Active chart calculations
  const activeChartTimeframe = isDemand ? chartDemandTimeframe : chartSalesTimeframe;

  // Handlers for Table
  const handleSetTableTimeframe = (tf) => {
    if (isDemand) {
      setTableDemandTimeframe(tf);
      setDemandOffset(0);
    } else {
      setTableSalesTimeframe(tf);
      setSalesOffset(0);
    }
  };

  const handlePrevPeriod = () => {
    if (isDemand) {
      setDemandOffset((prev) => prev - 1);
    } else {
      setSalesOffset((prev) => prev - 1);
    }
  };

  const handleNextPeriod = () => {
    if (isDemand) {
      setDemandOffset((prev) => Math.min(0, prev + 1));
    } else {
      setSalesOffset((prev) => Math.min(0, prev + 1));
    }
  };

  // Handlers for Chart
  const handleSetChartTimeframe = (tf) => {
    if (isDemand) {
      setChartDemandTimeframe(tf);
    } else {
      setChartSalesTimeframe(tf);
    }
  };

function extractList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  if (Array.isArray(res?.items)) return res.items;
  return [];
}

  // Load Table Data independently
  useEffect(() => {
    let mounted = true;

    const loadTableData = async () => {
      setTableLoading(true);
      try {
        if (isDemand) {
          const res = await fetchDemandAnalytics(tableDemandTimeframe, periodInfo.startDate, periodInfo.endDate);
          if (mounted) {
            const list = extractList(res);
            setDemandData(list.map(item => ({
              product: item.product_name || item.name || "Unknown Product",
              value: formatNumber(item.total_quantity_sold || item.quantity || 0),
              delta: item.quantity_delta || 0
            })));
          }
        } else {
          const res = await fetchDemandAnalytics(tableSalesTimeframe, periodInfo.startDate, periodInfo.endDate);
          if (mounted) {
            const list = extractList(res);
            setSalesData(list.slice().sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0)).map(item => ({
              product: item.product_name || item.name || "Unknown Product",
              value: formatCurrency(item.total_revenue || item.revenue || 0),
              delta: item.revenue_delta || 0
            })));
          }
        }
      } catch (err) {
        console.error("Failed to load table analytics data:", err);
      } finally {
        if (mounted) setTableLoading(false);
      }
    };

    loadTableData();

    return () => {
      mounted = false;
    };
  }, [activeTab, tableDemandTimeframe, tableSalesTimeframe, demandOffset, salesOffset, isDemand, periodInfo.startDate, periodInfo.endDate]);

  // Load Chart Data independently
  useEffect(() => {
    let mounted = true;

    const loadChartData = async () => {
      setChartLoading(true);
      try {
        if (isDemand) {
          const res = await fetchSalesAnalytics(chartDemandTimeframe);
          if (mounted) {
            const tsData = extractList(res);
            setChartTimeseries({
              labels: tsData.map(item => item.period || item.label || ""),
              values: tsData.map(item => Number(item.orders_count || item.quantity || 0))
            });
          }
        } else {
          const res = await fetchSalesAnalytics(chartSalesTimeframe);
          if (mounted) {
            const tsData = extractList(res);
            setChartTimeseries({
              labels: tsData.map(item => item.period || item.label || ""),
              values: tsData.map(item => Number(item.revenue || item.total || 0))
            });
          }
        }
      } catch (err) {
        console.error("Failed to load chart analytics data:", err);
      } finally {
        if (mounted) setChartLoading(false);
      }
    };

    loadChartData();

    return () => {
      mounted = false;
    };
  }, [activeTab, chartDemandTimeframe, chartSalesTimeframe, isDemand]);

  // Load Gemini AI Insight independently
  useEffect(() => {
    let mounted = true;

    const loadInsight = async () => {
      setInsightLoading(true);
      try {
        const type = isDemand ? "demand" : "sales";
        const res = await fetchAnalyticsInsights(type);
        if (mounted && res) {
          setInsightText(res.insight || res.data?.insight || "");
          setInsightSource(res.source || res.data?.source || "gemini");
        }
      } catch (err) {
        console.error("Failed to load Gemini AI insight:", err);
      } finally {
        if (mounted) setInsightLoading(false);
      }
    };

    loadInsight();

    return () => {
      mounted = false;
    };
  }, [activeTab, isDemand]);

  // Compute BI Metrics
  const demandMetrics = useMemo(() => {
    const totalVolume = demandData.reduce((acc, item) => {
      const val = parseFloat(String(item.value).replace(/,/g, "")) || 0;
      return acc + val;
    }, 0);
    const topItem = demandData[0]?.product || "N/A";
    const avgDaily = (totalVolume / 30).toFixed(1);
    const trendingUp = demandData.filter((item) => (item.delta || 0) > 0).length;

    return [
      { label: "Total Demand Volume", value: totalVolume.toLocaleString(), subtitle: "Total units in period" },
      { label: "Peak Demand Item", value: topItem, subtitle: "Highest volume product" },
      { label: "Avg. Daily Consumption", value: `${avgDaily} units/day`, subtitle: "Stock velocity rate" },
      { label: "High Growth Items", value: `${trendingUp} items`, subtitle: "Products with rising demand" },
    ];
  }, [demandData]);

  const salesMetrics = useMemo(() => {
    const totalRevenue = salesData.reduce((acc, item) => {
      const num = parseFloat(String(item.value).replace(/[^\d.]/g, "")) || 0;
      return acc + num;
    }, 0);
    const topItem = salesData[0]?.product || "N/A";
    const avgRevenue = salesData.length > 0 ? totalRevenue / salesData.length : 0;
    const growthCount = salesData.filter((item) => (item.delta || 0) > 0).length;

    return [
      { label: "Total Sales Revenue", prefix: "PHP", value: totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 }), subtitle: "Total revenue in period" },
      { label: "Top Grossing Product", value: topItem, subtitle: "Highest revenue generator" },
      { label: "Avg. Revenue / Product", prefix: "PHP", value: avgRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 }), subtitle: "Average product performance" },
      { label: "Revenue Growth Items", value: `${growthCount} items`, subtitle: "Products with sales increase" },
    ];
  }, [salesData]);

  const currentMetrics = isDemand ? demandMetrics : salesMetrics;

  return {
    tab: {
      active: activeTab,
      setActive: setActiveTab,
      isDemand,
    },
    metrics: {
      data: currentMetrics,
      loading: tableLoading,
    },
    insight: {
      text: insightText,
      loading: insightLoading,
      source: insightSource,
    },
    table: {
      data: isDemand ? demandData : salesData,
      columnLabel: isDemand ? "Demand" : "Sales",
      tableTitle: isDemand ? "Top Demand Products" : "Top Sales Products",
      timeframe: activeTableTimeframe,
      onTimeframeChange: handleSetTableTimeframe,
      timeframeOptions: isDemand ? demandOptions : salesOptions,
      loading: tableLoading,
      periodInfo,
      onPrevPeriod: handlePrevPeriod,
      onNextPeriod: handleNextPeriod,
    },
    chart: {
      chartData: chartTimeseries,
      chartTitle: isDemand ? "Demand Trend Chart" : "Sales Trend Chart",
      isCurrency: !isDemand,
      timeframe: activeChartTimeframe,
      onTimeframeChange: handleSetChartTimeframe,
      timeframeOptions: isDemand ? demandOptions : salesOptions,
      loading: chartLoading,
      chartType: isDemand ? "bar" : "line",
    },

    // Legacy flat keys for backward compatibility
    activeTab,
    setActiveTab,
    currentMetrics,
    tableTimeframe: activeTableTimeframe,
    setTableTimeframe: handleSetTableTimeframe,
    demandData,
    salesData,
    tableLoading,
    periodInfo,
    onPrevPeriod: handlePrevPeriod,
    onNextPeriod: handleNextPeriod,
    chartTimeframe: activeChartTimeframe,
    setChartTimeframe: handleSetChartTimeframe,
    chartTimeseries,
    chartLoading,
    insightText,
    insightLoading,
    insightSource,
    isDemand,
  };
}
