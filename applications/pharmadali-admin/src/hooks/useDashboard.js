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

  const statCards = useMemo(() => {
    const cards = overviewData?.stat_cards;

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
        label: "Orders Today",
        value: cards ? Number(cards.orders_today).toLocaleString() : "0",
        prefix: null,
        bg: "#96D2EE",
      },
      {
        label: "Expiring Items",
        value: cards ? Number(cards.expiring_count ?? 0).toLocaleString() : "0",
        prefix: null,
        bg: "#F9C784",
      },
      {
        label: "Low Stock Items",
        value: cards ? Number(cards.low_stock_count).toLocaleString() : "0",
        prefix: null,
        bg: "#F9C784",
      },
      {
        label: "Predicted Stockout Risk",
        value: cards ? cards.predicted_stockout_risk : "Low",
        prefix: null,
        bg:
          cards?.predicted_stockout_risk === "High"
            ? "#F28B82"
            : cards?.predicted_stockout_risk === "Medium"
            ? "#F9C784"
            : "#96D2EE",
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
