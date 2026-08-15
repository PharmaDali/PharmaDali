import { useState, useEffect, useMemo } from "react";
import { fetchDemandAnalytics, fetchSalesAnalytics } from "../../../services/analyticsService";
import { formatCurrency, formatNumber } from "../../../utils/formatUtils";

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

  // Load Table Data independently
  useEffect(() => {
    let mounted = true;

    const loadTableData = async () => {
      setTableLoading(true);
      try {
        if (isDemand) {
          const res = await fetchDemandAnalytics(tableDemandTimeframe, periodInfo.startDate, periodInfo.endDate);
          if (mounted) {
            setDemandData((res?.data || []).map(item => ({
              product: item.product_name,
              value: formatNumber(item.total_quantity_sold),
              delta: item.quantity_delta
            })));
          }
        } else {
          const res = await fetchDemandAnalytics(tableSalesTimeframe, periodInfo.startDate, periodInfo.endDate);
          if (mounted) {
            setSalesData((res?.data || []).sort((a, b) => b.total_revenue - a.total_revenue).map(item => ({
              product: item.product_name,
              value: formatCurrency(item.total_revenue),
              delta: item.revenue_delta
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
            const tsData = res?.data || [];
            setChartTimeseries({
              labels: tsData.map(item => item.period),
              values: tsData.map(item => Number(item.orders_count))
            });
          }
        } else {
          const res = await fetchSalesAnalytics(chartSalesTimeframe);
          if (mounted) {
            const tsData = res?.data || [];
            setChartTimeseries({
              labels: tsData.map(item => item.period),
              values: tsData.map(item => Number(item.revenue))
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
    activeTab,
    setActiveTab,
    
    // BI Metrics
    currentMetrics,

    // Table props
    tableTimeframe: activeTableTimeframe,
    setTableTimeframe: handleSetTableTimeframe,
    demandData,
    salesData,
    tableLoading,
    periodInfo,
    onPrevPeriod: handlePrevPeriod,
    onNextPeriod: handleNextPeriod,

    // Chart props
    chartTimeframe: activeChartTimeframe,
    setChartTimeframe: handleSetChartTimeframe,
    chartTimeseries,
    chartLoading,

    isDemand
  };
}
