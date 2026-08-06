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
import { useNavigate } from "react-router-dom";
import { fetchDashboardOverview, fetchSalesTrend } from "../services/dashboardService";
import { maxChartValue } from "../utils/dashboardUtils";
import "../assets/css/dashboard.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const EMPTY_QUICK_INSIGHTS = [
  { category: "Top Selling", main: "No data", right: "0", rightSub: "units sold" },
  { category: "Top Category", main: "No data", right: "--", rightSub: "of total sales" },
  { category: "Sales Growth", main: "0%", right: "0%", rightSub: "vs last period" },
  { category: "Profit Today", main: "PHP 0.00", right: "30%", rightSub: "margin" },
];

const LOADING_QUICK_INSIGHTS = [
  { category: "Top Selling", main: "Loading...", right: "--", rightSub: "units sold" },
  { category: "Top Category", main: "Loading...", right: "--", rightSub: "of total sales" },
  { category: "Sales Growth", main: "--", right: "--", rightSub: "vs last period" },
  { category: "Profit Today", main: "Loading...", right: "--", rightSub: "margin" },
];

function StatCard({ label, value, prefix, bg }) {
  return (
    <div
      className="rounded-3 p-3 h-100 dashboard-stat-card"
      style={{ background: bg }}
    >
      <div style={{ fontSize: 13, color: "#444444", marginBottom: 4 }}>{label}</div>
      <div className="dashboard-stat-value" style={{ fontWeight: 900, lineHeight: 2, color: "#444444", fontSize: 32 }}>
        {prefix && <span style={{ fontSize: 18, fontWeight: 900, verticalAlign: "middle", marginRight: 5 }}>{prefix}</span>}
        {value}
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
              <div style={{ fontSize: 11, color: "#aaa" }}>{item.category}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#222" }}>{item.main}</div>
            </div>
            <div className={`text-end ${rightClassName}`}>
              {item.right && (
                <span style={{ fontSize: 15, fontWeight: 700, color: "#222" }}>{item.right}</span>
              )}
              <span style={{ fontSize: 11, color: "#aaa", marginLeft: item.right ? 4 : 0 }}>
                {item.rightSub}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SalesTrend({ initialTrend }) {
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

  const labels = trendData?.labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const values = trendData?.values || [0, 0, 0, 0, 0, 0, 0];

  const data = useMemo(
    () => {
      return {
        labels,
        datasets: [{
          data: values,
          borderColor: "#2aabe2",
          backgroundColor: "rgba(42,171,226,0.12)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#2aabe2",
          pointBorderWidth: 1.5,
          pointRadius: 3.5,
          pointHoverRadius: 5,
        }],
      };
    },
    [labels, values]
  );

  const options = useMemo(
    () => {
      const maxValue = maxChartValue(values);
      const stepSize = Math.max(10, Math.ceil(maxValue / 5 / 10) * 10);

      return {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 4,
            right: 10,
            bottom: 0,
            left: 0,
          },
        },
        plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
        scales: {
          x: {
            grid: { color: "rgba(15, 23, 42, 0.04)" },
            ticks: {
              color: "#5f6670",
              font: { size: 12, family: "Poppins" },
              autoSkip: true,
              maxTicksLimit: range === "Monthly" ? 12 : range === "Weekly" ? 8 : 7,
            },
          },
          y: {
            min: 0,
            max: maxValue,
            beginAtZero: true,
            grid: { color: "rgba(15, 23, 42, 0.06)" },
            ticks: {
              stepSize,
              color: "#5f6670",
              font: { size: 12, family: "Poppins" },
              padding: 8,
              callback: (value) => Math.round(value).toLocaleString(),
            },
          },
        },
      };
    },
    [range, values]
  );

  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 h-100 dashboard-panel">
      <div className="dashboard-card-header d-flex align-items-md-center justify-content-between mb-3 gap-2">
        <h6 className="fw-bold mb-0" style={{ fontSize: 16, color: "#2aabe2" }}>Sales Trend (Overall Sales)</h6>
        <div className="position-relative pd-range-select-wrap">
          <select
            className="form-select form-select-sm pe-4 pd-range-select"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            aria-label="Select trend range"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
          <i
            className="bi bi-chevron-down position-absolute top-50 translate-middle-y"
            style={{ right: 12, fontSize: 10, pointerEvents: "none", color: "#888" }}
          ></i>
        </div>
      </div>
      <div className="dashboard-chart-wrap">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

function QuickInsights({ items, loading }) {
  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 h-100 dashboard-panel">
      <h6 className="fw-bold mb-3" style={{ fontSize: 16, color: "#2aabe2" }}>Quick Insights</h6>
      {loading && <div className="text-muted small mb-2">Loading insights...</div>}
      <InsightRows
        items={loading ? LOADING_QUICK_INSIGHTS : (items && items.length > 0 ? items : EMPTY_QUICK_INSIGHTS)}
        rowClassName="quick-insight-row"
        rightClassName="quick-insight-right"
      />
    </div>
  );
}

function InventoryHealth({ data, onKnowMore }) {
  const lowStock = (data?.low_stock ?? []).slice(0, 5);
  const expiringSoon = (data?.expiring_soon ?? []).slice(0, 5);

  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 h-100 d-flex flex-column dashboard-panel">
      <h6 className="fw-bold mb-3" style={{ fontSize: 16, color: "#2aabe2" }}>Inventory Health</h6>
      <div className="d-flex flex-column flex-md-row flex-grow-1" style={{ minHeight: 0 }}>
        <div className="pe-md-3" style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "#555", fontWeight: 600, marginBottom: 8 }}>
            Low Stock Items
          </div>
          {lowStock.length === 0 ? (
            <div style={{ fontSize: 13, color: "#888", padding: "12px 0" }}>No low stock alerts</div>
          ) : (
            lowStock.map((item) => (
              <div key={`${item.name}-${item.note}`} className="d-flex justify-content-between align-items-center mb-3 inventory-row">
                <div style={{ fontSize: 13, color: "#222" }}>{item.name}</div>
                <div className="inventory-note" style={{ fontSize: 12, color: "#888" }}>{item.note}</div>
              </div>
            ))
          )}
        </div>
        <div className="inventory-divider" />
        <div className="ps-md-3" style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "#555", fontWeight: 600, marginBottom: 8 }}>Expiring Soon</div>
          {expiringSoon.length === 0 ? (
            <div style={{ fontSize: 13, color: "#888", padding: "12px 0" }}>No expiring batch alerts</div>
          ) : (
            expiringSoon.map((item) => (
              <div key={`${item.name}-${item.days}`} className="d-flex justify-content-between align-items-center mb-3 inventory-row">
                <div style={{ fontWeight: 700, fontSize: 13, color: "#222" }}>{item.name}</div>
                <div style={{ fontSize: 13, color: "#555" }}>{item.days}</div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="text-end mt-auto pt-2">
        <button
          type="button"
          className="dashboard-link-btn"
          aria-label="Open inventory health details"
          onClick={onKnowMore}
        >
          Know more
        </button>
      </div>
    </div>
  );
}

function DashBoard() {
  const navigate = useNavigate();
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);
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

    loadDashboard();

    // Auto-refresh dashboard data every 30 seconds
    const interval = setInterval(loadDashboard, 30000);

    // Listen for order status updates or inventory changes
    window.addEventListener("order-status-updated", loadDashboard);

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener("order-status-updated", loadDashboard);
    };
  }, []);

  const statCards = useMemo(() => {
    const cards = overviewData?.stat_cards;

    return [
      {
        label: "Sales Today",
        value: loading
          ? "Loading..."
          : cards
          ? Number(cards.sales_today).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : "0.00",
        prefix: "PHP",
        bg: "#96D2EE",
      },
      {
        label: "Orders Today",
        value: loading ? "Loading..." : cards ? Number(cards.orders_today).toLocaleString() : "0",
        prefix: null,
        bg: "#96D2EE",
      },
      {
        label: "Inventory Value",
        value: loading
          ? "Loading..."
          : cards
          ? Number(cards.inventory_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : "0.00",
        prefix: "PHP",
        bg: "#96D2EE",
      },
      {
        label: "Low Stock Items",
        value: loading ? "Loading..." : cards ? Number(cards.low_stock_count).toLocaleString() : "0",
        prefix: null,
        bg: "#F9C784",
      },
      {
        label: "Predicted Stockout Risk",
        value: loading ? "Loading..." : cards ? cards.predicted_stockout_risk : "Low",
        prefix: null,
        bg:
          cards?.predicted_stockout_risk === "High"
            ? "#F28B82"
            : cards?.predicted_stockout_risk === "Medium"
            ? "#F9C784"
            : "#96D2EE",
      },
    ];
  }, [overviewData, loading]);

  return (
    <section className="dashboard-page" aria-label="Dashboard overview">
      <header className="dashboard-page-header mb-4">
        <h4 className="fw-bold mb-1 dashboard-title">Dashboard</h4>
        <p className="dashboard-subtitle mb-0">A quick operational snapshot of pharmacy sales, inventory, and analytics.</p>
      </header>

      <div className="row g-3 mb-4">
        {statCards.map((c) => (
          <div key={c.label} className="col-12 col-sm-6 col-md-4 col-lg">
            <StatCard {...c} />
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-7 col-lg-8">
          <SalesTrend initialTrend={overviewData?.sales_trend} />
        </div>
        <div className="col-12 col-md-5 col-lg-4">
          <QuickInsights items={overviewData?.quick_insights} loading={loading} />
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
