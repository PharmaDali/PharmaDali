import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, Navigate } from "react-router-dom";
import { fetchDashboardOverview, fetchSalesTrend } from "../services/dashboardService";
import { maxChartValue } from "../utils/dashboardUtils";
import "../assets/css/dashboard.css";
import { SingleStatCardSkeleton, QuickInsightSkeleton, ChartSkeleton, WavingDots } from "../components/loading";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const EMPTY_QUICK_INSIGHTS = [
  { category: "Top Selling", main: "No data", right: "0", rightSub: "units sold" },
  { category: "Top Category", main: "No data", right: "--", rightSub: "of total sales" },
  { category: "Sales Growth", main: "0%", right: "0%", rightSub: "vs last period" },
  { category: "Profit Today", main: "PHP 0.00", right: "30%", rightSub: "margin" },
];

function StatCard({ label, value, prefix, bg, loading }) {
  return (
    <div
      className="rounded-3 p-3 h-100 dashboard-stat-card"
      style={{ background: bg }}
    >
      <div style={{ fontSize: 13, color: "#334155", marginBottom: 4 }}>{label}</div>
      <div className="dashboard-stat-value" style={{ fontWeight: 900, lineHeight: 2, color: "#334155", fontSize: 32 }}>
        {loading ? (
          <WavingDots />
        ) : (
          <>
            {prefix && <span style={{ fontSize: 18, fontWeight: 900, verticalAlign: "middle", marginRight: 5 }}>{prefix}</span>}
            {value}
          </>
        )}
      </div>
    </div>
  );
}

function InsightRows({ items, rowClassName, rightClassName }) {
  return (
    <div className="d-flex flex-column gap-0">
      {items.map((item, index) => (
        <div key={`${item.category}-${item.main}`}>
          {index > 0 && <hr className="my-2" />}
          <div className={`d-flex justify-content-between align-items-start ${rowClassName}`}>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.category}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#334155" }}>{item.main}</div>
            </div>
            <div className={`text-end ${rightClassName}`}>
              {item.right && (
                <span style={{ fontSize: 15, fontWeight: 700, color: "#334155" }}>{item.right}</span>
              )}
              <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: item.right ? 4 : 0 }}>
                {item.rightSub}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SalesTrend({ initialTrend, loading }) {
  const [range, setRange] = useState("Daily");
  const [trendData, setTrendData] = useState(initialTrend?.Daily || null);

  useEffect(() => {
    if (initialTrend && initialTrend[range]) {
      setTrendData(initialTrend[range]);
    } else {
      let mounted = true;
      fetchSalesTrend(range)
        .then((res) => {
          if (mounted && res) {
            setTrendData(res);
          }
        })
        .catch(console.error);
      return () => { mounted = false; };
    }
  }, [range, initialTrend]);

  if (loading && !trendData) {
    return <ChartSkeleton height={220} title="Sales Trend Overview" />;
  }

  const labels = trendData?.labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const values = trendData?.values || [0, 0, 0, 0, 0, 0, 0];

  const data = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: "#2aabe2",
        borderWidth: 2.5,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#2aabe2",
        pointBorderWidth: 2.5,
        pointRadius: 5.5,
        pointHoverRadius: 7.5,
        pointHoverBackgroundColor: "#ffffff",
        pointHoverBorderColor: "#2aabe2",
        pointHoverBorderWidth: 3,
        fill: true,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "rgba(42, 171, 226, 0.12)";
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(42, 171, 226, 0.22)");
          gradient.addColorStop(1, "rgba(42, 171, 226, 0.01)");
          return gradient;
        },
        tension: 0,
        clip: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 15,
        right: 10,
        bottom: 5,
        left: 5,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleFont: { size: 12, weight: "600" },
        bodyFont: { size: 13, weight: "700" },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (ctx) => ` PHP ${Number(ctx.parsed.y).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(241, 245, 249, 0.8)", drawBorder: false },
        ticks: { color: "#888888", font: { size: 12, weight: "500" } },
      },
      y: {
        border: { display: false },
        grid: { color: "rgba(241, 245, 249, 0.8)", drawBorder: false },
        min: 0,
        max: maxChartValue(values),
        ticks: {
          color: "#888888",
          font: { size: 11 },
          callback: (val) => (val >= 1000 ? `${val / 1000}k` : val),
        },
      },
    },
  };

  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 h-100 dashboard-panel">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="fw-bold mb-0" style={{ fontSize: 16, color: "#2aabe2" }}>Sales Trend Overview</h6>
        <div className="position-relative d-inline-block">
          <select
            className="form-select form-select-sm dashboard-range-select"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
      </div>
      <div className="dashboard-chart-wrap" style={{ height: 220 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

function QuickInsights({ items, loading }) {
  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 h-100 dashboard-panel">
      <h6 className="fw-bold mb-3" style={{ fontSize: 16, color: "#2aabe2" }}>Quick Insights</h6>
      {loading ? (
        <QuickInsightSkeleton count={4} />
      ) : (
        <InsightRows
          items={items && items.length > 0 ? items : EMPTY_QUICK_INSIGHTS}
          rowClassName="quick-insight-row"
          rightClassName="quick-insight-right"
        />
      )}
    </div>
  );
}

function parseLowStock(item) {
  const name = item.name || "Unknown Product";
  let stock = item.stock ?? item.quantity ?? item.current_stock;
  let weeks = item.weeks;

  if (stock === undefined && item.note) {
    const matchStock = item.note.match(/\((\d+)\s+left\)/);
    if (matchStock) {
      stock = parseInt(matchStock[1], 10);
    }
  }

  if (!weeks && item.note) {
    if (item.note.includes("less than 1 day") || item.note.includes("less than 1 week")) {
      weeks = "< 1 week";
    } else {
      const matchDays = item.note.match(/(\d+)\s+days?\s+supply/);
      if (matchDays) {
        const d = parseInt(matchDays[1], 10);
        const w = Math.max(1, Math.ceil(d / 7));
        weeks = w === 1 ? "< 1 week" : `${w} weeks`;
      }
    }
  }

  if (weeks && weeks.includes("supply")) {
    weeks = weeks.replace(/\s+supply/, "").trim();
  }

  return {
    name,
    stockText: stock !== undefined ? `${stock} left` : "Low stock",
    weeksText: weeks || "< 1 week",
  };
}

function parseExpiring(item) {
  const name = item.name || "Unknown Product";
  let stock = item.stock ?? item.quantity;
  let weeks = item.weeks || item.days;

  if (!weeks && item.expiry_date) {
    const diffDays = Math.ceil((new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    if (!isNaN(diffDays) && diffDays > 0) {
      const w = Math.max(1, Math.ceil(diffDays / 7));
      weeks = w === 1 ? "1 week left" : `${w} weeks left`;
    }
  }

  if (weeks && !weeks.includes("week")) {
    const d = parseInt(weeks, 10);
    if (!isNaN(d)) {
      const w = Math.max(1, Math.ceil(d / 7));
      weeks = w === 1 ? "1 week left" : `${w} weeks left`;
    }
  }

  return {
    name,
    stockText: stock !== undefined ? `${stock} left` : null,
    weeksText: weeks || "Expiring soon",
  };
}

function InventoryHealth({ data, onKnowMore }) {
  const lowStock = (data?.low_stock ?? []).slice(0, 5);
  const expiringSoon = (data?.expiring_soon ?? []).slice(0, 5);

  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 h-100 d-flex flex-column dashboard-panel">
      <h6 className="fw-bold mb-3" style={{ fontSize: 16, color: "#2aabe2" }}>Inventory Health</h6>
      
      <div className="d-flex flex-column flex-md-row gap-4 flex-grow-1" style={{ minHeight: 0 }}>
        {/* Low Stock Items Section */}
        <div style={{ flex: 1 }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span style={{ fontSize: 14, color: "#1e293b", fontWeight: 700 }}>
              Low Stock Items
            </span>
          </div>
          {lowStock.length === 0 ? (
            <div style={{ fontSize: 13, color: "#888", padding: "16px 0" }}>No low stock alerts</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-borderless align-middle mb-0" style={{ fontSize: 12 }}>
                <thead>
                  <tr style={{ color: "#64748b", borderBottom: "1.5px solid #e2e8f0" }}>
                    <th style={{ fontWeight: 600, paddingBottom: 6, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>Product Name</th>
                    <th className="text-center" style={{ fontWeight: 600, paddingBottom: 6, width: "100px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>Units Left</th>
                    <th className="text-end" style={{ fontWeight: 600, paddingBottom: 6, width: "120px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>Weeks Left</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((rawItem, index) => {
                    const item = parseLowStock(rawItem);
                    return (
                      <tr key={item.name + index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td className="fw-semibold py-2 text-truncate" style={{ color: "#334155", maxWidth: 160 }} title={item.name}>
                          {item.name}
                        </td>
                        <td className="text-center py-2">
                          <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1" style={{ fontSize: 11 }}>
                            {item.stockText}
                          </span>
                        </td>
                        <td className="text-end py-2">
                          <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle px-2 py-1" style={{ fontSize: 11 }}>
                            {item.weeksText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Divider for desktop */}
        <div className="d-none d-md-block" style={{ width: 1, backgroundColor: "#e2e8f0" }} />

        {/* Expiring Soon Section */}
        <div style={{ flex: 1 }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span style={{ fontSize: 14, color: "#1e293b", fontWeight: 700 }}>
              Expiring Soon
            </span>
          </div>
          {expiringSoon.length === 0 ? (
            <div style={{ fontSize: 13, color: "#888", padding: "16px 0" }}>No expiring alerts</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-borderless align-middle mb-0" style={{ fontSize: 12 }}>
                <thead>
                  <tr style={{ color: "#64748b", borderBottom: "1.5px solid #e2e8f0" }}>
                    <th style={{ fontWeight: 600, paddingBottom: 6, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>Product Name</th>
                    <th className="text-center" style={{ fontWeight: 600, paddingBottom: 6, width: "100px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>Units Left</th>
                    <th className="text-end" style={{ fontWeight: 600, paddingBottom: 6, width: "120px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>Weeks Left</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringSoon.map((rawItem, index) => {
                    const item = parseExpiring(rawItem);
                    return (
                      <tr key={item.name + index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td className="fw-semibold py-2 text-truncate" style={{ color: "#334155", maxWidth: 160 }} title={item.name}>
                          {item.name}
                        </td>
                        <td className="text-center py-2">
                          <span className="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle px-2 py-1" style={{ fontSize: 11 }}>
                            {item.stockText || "—"}
                          </span>
                        </td>
                        <td className="text-end py-2">
                          <span className="badge bg-danger-subtle text-danger-emphasis border border-danger-subtle px-2 py-1" style={{ fontSize: 11 }}>
                            {item.weeksText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 text-end">
        <button
          type="button"
          className="btn btn-sm btn-link text-decoration-none p-0 fw-semibold"
          style={{ color: "#2aabe2", fontSize: 13 }}
          onClick={onKnowMore}
        >
          View Full Inventory
        </button>
      </div>
    </div>
  );
}

function DashBoard() {
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const user = context.user;

  if (user?.role === "pharmacist") {
    return <Navigate to="/pos" replace />;
  }

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

  return (
    <section className="dashboard-page" aria-label="Dashboard overview">
      <header className="dashboard-page-header mb-4">
        <h4 className="fw-bold mb-1 dashboard-title">Dashboard</h4>
        <p className="dashboard-subtitle mb-0">A quick operational snapshot of pharmacy sales, inventory, and analytics.</p>
      </header>

      <div className="row g-3 mb-4">
        {statCards.map((c) => (
          <div key={c.label} className="col-12 col-sm-6 col-md-4 col-lg">
            <StatCard {...c} loading={loading && !overviewData} />
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-7 col-lg-8">
          <SalesTrend initialTrend={overviewData?.sales_trend} loading={loading && !overviewData} />
        </div>
        <div className="col-12 col-md-5 col-lg-4">
          <QuickInsights items={overviewData?.quick_insights} loading={loading && !overviewData} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <InventoryHealth data={overviewData?.inventory_health} onKnowMore={() => navigate("/inventory")} />
        </div>
      </div>
    </section>
  );
}

export default DashBoard;
