import { useState, useEffect, useMemo } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { fetchDashboardOverview } from "../services/dashboardService";

export function useDashboard() {
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const user = context.user;

  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async (isBackground = false) => {
    try {
      if (!isBackground && !overviewData) {
        setLoading(true);
      }
      const data = await fetchDashboardOverview();
      setOverviewData(data);
    } catch (err) {
      console.error("Failed to load dashboard overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    loadDashboard(false);

    // Silent background auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (mounted) loadDashboard(true);
    }, 30000);

    const handleUpdate = () => {
      if (mounted) loadDashboard(true);
    };

    window.addEventListener("order-status-updated", handleUpdate);

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener("order-status-updated", handleUpdate);
    };
  }, []);

  const getMetricBg = (count, type) => {
    if (type === "expired") {
      return count >= 1 ? "#F28B82" : "#96D2EE";
    }
    // expiring / low_stock
    if (count >= 6) return "#F28B82";
    if (count >= 1) return "#F9C784";
    return "#96D2EE";
  };

  const statCards = useMemo(() => {
    const cards = overviewData?.stat_cards;

    const expiringCount  = cards ? Number(cards.expiring_count  ?? 0) : 0;
    const lowStockCount  = cards ? Number(cards.low_stock_count  ?? 0) : 0;
    const expiredCount   = cards ? Number(cards.expired_count    ?? 0) : 0;

    return [
      {
        label: "Sales Today",
        value: cards
          ? Number(cards.sales_today).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : "0.00",
        prefix: "PHP",
        bg: "#96D2EE",
      },
      {
        label: "Today's Transactions",
        value: cards ? Number(cards.orders_today).toLocaleString() : "0",
        prefix: null,
        bg: "#96D2EE",
      },
      {
        label: "Expiring Items",
        value: cards ? Number(cards.expiring_count ?? 0).toLocaleString() : "0",
        value: expiringCount.toLocaleString(),
        prefix: null,
        bg: "#F9C784",
        bg: getMetricBg(expiringCount, "expiring"),
      },
      {
        label: "Low Stock Items",
        value: cards ? Number(cards.low_stock_count).toLocaleString() : "0",
        value: lowStockCount.toLocaleString(),
        prefix: null,
        bg: "#F9C784",
        bg: getMetricBg(lowStockCount, "low_stock"),
      },
      {
        label: "Stockout Risk",
        value: cards ? cards.predicted_stockout_risk : "Low",
        label: "Expired Items",
        value: expiredCount.toLocaleString(),
        prefix: null,
        bg:
          cards?.predicted_stockout_risk === "High"
            ? "#F28B82"
            : cards?.predicted_stockout_risk === "Medium"
            ? "#F9C784"
            : "#96D2EE",
        bg: getMetricBg(expiredCount, "expired"),
      },
    ];
  }, [overviewData]);

  return {
    user,
    overviewData,
    loading,
    statCards,
    navigate,
  };
}

export default useDashboard;
