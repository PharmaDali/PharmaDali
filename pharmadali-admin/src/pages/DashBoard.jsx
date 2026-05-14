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
import { fetchOrdersCount } from "../services/dashboardService";
import { apiRequest } from "../shared/api/apiClient";
import {
  buildSalesSeriesFromForecastRows,
  buildHighestDemandForecast,
  buildTopSellingInsight,
  calculateSalesGrowthFromForecastRows,
  maxChartValue,
} from "../utils/dashboardUtils";
import "../assets/css/dashboard.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const SALES_FORECAST_DATA = {
  Weekly: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: [31, 38, 42, 50, 53, 49, 58],
  },
  Monthly: {
    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    values: Array.from({ length: 30 }, (_, i) => 20 + Math.round(Math.sin(i / 3) * 10 + i * 1.2)),
  },
};

const STAT_CARDS = [
  { label: "Sales Today", value: "20,003", prefix: "PHP", bg: "#96D2EE" },
  { label: "Orders Today", value: "167", prefix: null, bg: "#96D2EE" },
  { label: "Inventory Value", value: "518,000", prefix: "PHP", bg: "#96D2EE" },
  { label: "Low Stock Items", value: "3", prefix: null, bg: "#F9C784" },
  { label: "Predicted Stockout Risk", value: "High", prefix: null, ai: true, bg: "#F28B82" },
];

const EMPTY_QUICK_INSIGHTS = [
  { category: "Top Selling", main: "No data", right: "0", rightSub: "units sold" },
  { category: "Top Category", main: "No data", right: "--", rightSub: "of total sales" },
  { category: "Sales Growth", main: "0%", right: "0%", rightSub: "vs last period" },
  { category: "Profit Today", main: "No data", right: "--", rightSub: "margin" },
];

const LOADING_QUICK_INSIGHTS = [
  { category: "Top Selling", main: "Loading...", right: "--", rightSub: "units sold" },
  { category: "Top Category", main: "Loading...", right: "--", rightSub: "of total sales" },
  { category: "Sales Growth", main: "--", right: "--", rightSub: "vs last period" },
  { category: "Profit Today", main: "Loading...", right: "--", rightSub: "margin" },
];

const LOW_STOCK = [
  { name: "Amoxicillin", note: "less than 1 day of supply" },
  { name: "Cetirizine", note: "1 day supply" },
  { name: "Loperamide", note: "2 days supply only" },
];

const EXPIRING_SOON = [
  { name: "Amoxicillin", days: "14 days" },
  { name: "Paracetamol", days: "10 days" },
  { name: "Ibuprofen", days: "23 days" },
];

const EMPTY_FORECAST = [
  { category: "High Demand Forecast", main: "--", right: "--", rightSub: "demand next week" },
  { category: "Stockout Risk", main: "--", right: "--", rightSub: "probability in 3 days" },
  { category: "Suggested Reorder", main: "--", right: "--", rightSub: "Reorder within 2 days" },
];

const LOADING_FORECAST = [
  { category: "High Demand Forecast", main: "Loading...", right: "--", rightSub: "demand next week" },
  { category: "Stockout Risk", main: "Loading...", right: "--", rightSub: "probability in 3 days" },
  { category: "Suggested Reorder", main: "Loading...", right: "--", rightSub: "Reorder within 2 days" },
];

function AiBadge() {
  return (
    <span
      style={{
        fontSize: 9, fontWeight: 700, background: "#9BA9B0",
        color: "#fff", borderRadius: 4, padding: "1px 4px", marginLeft: 4, verticalAlign: "middle",
      }}
    >AI</span>
  );
}

function StatCard({ label, value, prefix, ai, bg }) {
  return (
    <div
      className="rounded-3 p-3 h-100 dashboard-stat-card"
      style={{ background: bg }}
    >
      <div style={{ fontSize: 13, color: "#444444", marginBottom: 4 }}>{label}</div>
      <div className="dashboard-stat-value" style={{ fontWeight: 900, lineHeight: 2, color: "#444444", fontSize: 40 }}>
        {prefix && <span style={{ fontSize: 20, fontWeight: 900, verticalAlign: "middle", marginRight: 5 }}>{prefix}</span>}
        {value}
        {ai && <AiBadge />}
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

function SalesTrend() {
  const [range, setRange] = useState("Weekly");
  const [salesSeries, setSalesSeries] = useState(SALES_FORECAST_DATA.Weekly);
  const { labels, values, forecastStartIndex } = salesSeries || SALES_FORECAST_DATA.Weekly;

  useEffect(() => {
    let isMounted = true;
    const salesGranularity = range === "Monthly" ? "monthly" : "weekly";

    const fetchSalesSeries = async () => {
      try {
        const response = await apiRequest.get("/branch/forecasts", {
          params: {
            kind: "sales",
            granularity: salesGranularity,
            limit: 100,
          },
        });

        const rows = response?.data || [];
        const nextSeries = buildSalesSeriesFromForecastRows(
          rows,
          salesGranularity,
          SALES_FORECAST_DATA[range],
        );

        if (isMounted) {
          setSalesSeries(nextSeries);
        }
      } catch {
        if (isMounted) {
          setSalesSeries(SALES_FORECAST_DATA[range]);
        }
      }
    };

    fetchSalesSeries();

    return () => {
      isMounted = false;
    };
  }, [range]);

  const data = useMemo(
    () => {
      if (!Number.isInteger(forecastStartIndex)) {
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
      }

      const historyValues = values.map((value, index) =>
        index < forecastStartIndex ? value : null
      );
      const forecastValues = values.map((value, index) =>
        index >= forecastStartIndex - 1 ? value : null
      );

      return {
        labels,
        datasets: [
          {
            data: historyValues,
            borderColor: "#2aabe2",
            backgroundColor: "rgba(42,171,226,0.12)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#2aabe2",
            pointBorderWidth: 1.5,
            pointRadius: 3.5,
            pointHoverRadius: 5,
          },
          {
            data: forecastValues,
            borderColor: "#2aabe2",
            backgroundColor: "rgba(42,171,226,0)",
            fill: false,
            tension: 0.4,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#2aabe2",
            pointBorderWidth: 1.5,
            pointRadius: 3.5,
            pointHoverRadius: 5,
            borderDash: [6, 4],
          },
        ],
      };
    },
    [labels, values, forecastStartIndex],
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
              maxTicksLimit: range === "Monthly" ? 6 : 8,
            },
          },
          y: {
            min: 10,
            max: maxValue,
            beginAtZero: false,
            grid: { color: "rgba(15, 23, 42, 0.06)" },
            ticks: {
              stepSize,
              color: "#5f6670",
              font: { size: 12, family: "Poppins" },
              padding: 8,
              callback: (value) => Math.round(value).toString(),
            },
          },
        },
      };
    },
    [range, values],
  );

  const salesForecastSplitPlugin = useMemo(() => ({
    id: "salesForecastSplit",
    afterDatasetsDraw(chart) {
      if (!Number.isInteger(forecastStartIndex)) {
        return;
      }
      const xScale = chart.scales.x;
      const yScale = chart.scales.y;
      const boundaryIndex = Math.min(forecastStartIndex, labels.length - 1);
      const x = xScale.getPixelForValue(boundaryIndex - 0.5);

      chart.ctx.save();
      chart.ctx.setLineDash([6, 6]);
      chart.ctx.strokeStyle = "rgba(42, 171, 226, 0.6)";
      chart.ctx.lineWidth = 1;
      chart.ctx.beginPath();
      chart.ctx.moveTo(x, yScale.top);
      chart.ctx.lineTo(x, yScale.bottom);
      chart.ctx.stroke();
      chart.ctx.restore();
    },
  }), [forecastStartIndex, labels.length]);

  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 h-100 dashboard-panel">
      <div className="dashboard-card-header d-flex align-items-md-center justify-content-between mb-3 gap-2">
        <h6 className="fw-bold mb-0" style={{ fontSize: 16, color: "#2aabe2" }}>Sales Trend</h6>
        <div className="position-relative pd-range-select-wrap">
          <select
            className="form-select form-select-sm pe-4 pd-range-select"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            aria-label="Select trend range"
          >
            {Object.keys(SALES_FORECAST_DATA).map((k) => <option key={k}>{k}</option>)}
          </select>
          <i
            className="bi bi-chevron-down position-absolute top-50 translate-middle-y"
            style={{ right: 12, fontSize: 10, pointerEvents: "none", color: "#888" }}
          ></i>
        </div>
      </div>
      <div className="dashboard-chart-wrap">
        <Line data={data} options={options} plugins={[salesForecastSplitPlugin]} />
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
        items={loading ? LOADING_QUICK_INSIGHTS : items}
        rowClassName="quick-insight-row"
        rightClassName="quick-insight-right"
      />
    </div>
  );
}

function InventoryHealth({ onKnowMore }) {
  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 h-100 d-flex flex-column dashboard-panel">
      <h6 className="fw-bold mb-3" style={{ fontSize: 16, color: "#2aabe2" }}>Inventory Health </h6>
      <div className="d-flex flex-column flex-md-row flex-grow-1" style={{ minHeight: 0 }}>
        <div className="pe-md-3" style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "#555", fontWeight: 600, marginBottom: 8 }}>
            Low Stock Items <AiBadge />
          </div>
          {LOW_STOCK.map((item) => (
            <div key={`${item.name}-${item.note}`} className="d-flex justify-content-between align-items-center mb-3 inventory-row">
              <div style={{ fontSize: 13, color: "#222" }}>{item.name}</div>
              <div className="inventory-note" style={{ fontSize: 12, color: "#888" }}>{item.note}</div>
            </div>
          ))}
        </div>
        <div className="inventory-divider" />
        <div className="ps-md-3" style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "#555", fontWeight: 600, marginBottom: 8 }}>Expiring Soon</div>
          {EXPIRING_SOON.map((item) => (
            <div key={`${item.name}-${item.days}`} className="d-flex justify-content-between align-items-center mb-3 inventory-row">
              <div style={{ fontWeight: 700, fontSize: 13, color: "#222" }}>{item.name}</div>
              <div style={{ fontSize: 13, color: "#555" }}>{item.days}</div>
            </div>
          ))}
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

function ForecastPreview({ items, loading, onKnowMore }) {
  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 h-100 d-flex flex-column dashboard-panel">
      <h6 className="fw-bold mb-3" style={{ fontSize: 16, color: "#2aabe2" }}>
        Forecast Preview <AiBadge />
      </h6>
      {loading && <div className="text-muted small mb-2">Loading forecast...</div>}
      <InsightRows
        items={loading ? LOADING_FORECAST : items}
        rowClassName="forecast-row"
        rightClassName="forecast-right"
      />
      <div className="text-end mt-auto pt-2">
        <button
          type="button"
          className="dashboard-link-btn"
          aria-label="Open forecast preview details"
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
  const [ordersCount, setOrdersCount] = useState(null);
  const [quickInsights, setQuickInsights] = useState(EMPTY_QUICK_INSIGHTS);
  const [forecastPreview, setForecastPreview] = useState(EMPTY_FORECAST);
  const [quickInsightsLoading, setQuickInsightsLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadOrdersCount = async () => {
      try {
        const totalOrders = await fetchOrdersCount();
        if (mounted) {
          setOrdersCount(totalOrders);
        }
      } catch {
        if (mounted) {
          setOrdersCount(0);
        }
      }
    };

    loadOrdersCount();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const buildInsights = (topSelling, growth) => [
      {
        category: "Top Selling",
        main: topSelling?.name || "No data",
        right: topSelling?.units || "0",
        rightSub: "units sold",
      },
      {
        category: "Top Category",
        main: "Tablets",
        right: "38%",
        rightSub: "of total sales",
      },
      {
        category: "Sales Growth",
        main: growth?.label || "0%",
        right: growth?.label || "0%",
        rightSub: "vs last period",
      },
      {
        category: "Profit Today",
        main: "PHP 5,762",
        right: "32%",
        rightSub: "margin",
      },
    ];

    const fetchQuickInsights = async () => {
      try {
        if (isMounted) {
          setQuickInsightsLoading(true);
        }
        const [topSellingResponse, salesResponse] = await Promise.all([
          apiRequest.get("/branch/forecasts", {
            params: {
              kind: "demand",
              granularity: "weekly",
              period: "current",
              limit: 200,
            },
          }),
          apiRequest.get("/branch/forecasts", {
            params: {
              kind: "sales",
              granularity: "weekly",
              limit: 100,
            },
          }),
        ]);

        const topSelling = buildTopSellingInsight(topSellingResponse?.data || []);
        const growth = calculateSalesGrowthFromForecastRows(salesResponse?.data || []);

        if (isMounted) {
          setQuickInsights(buildInsights(topSelling, growth));
          setQuickInsightsLoading(false);
        }
      } catch {
        if (isMounted) {
          setQuickInsights(EMPTY_QUICK_INSIGHTS);
          setQuickInsightsLoading(false);
        }
      }
    };

    fetchQuickInsights();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const buildForecastPreview = (highestDemand) => {
      if (!highestDemand) {
        return EMPTY_FORECAST;
      }

      const demandItem = {
        category: "High Demand Forecast",
        main: highestDemand.name,
        right: highestDemand.label || "--",
        rightSub: "demand next week",
      };

      return [demandItem, EMPTY_FORECAST[1], EMPTY_FORECAST[2]];
    };

    const fetchForecastPreview = async () => {
      try {
        if (isMounted) {
          setForecastLoading(true);
        }
        const [currentResponse, nextResponse] = await Promise.all([
          apiRequest.get("/branch/forecasts", {
            params: {
              kind: "demand",
              granularity: "weekly",
              period: "current",
              limit: 200,
            },
          }),
          apiRequest.get("/branch/forecasts", {
            params: {
              kind: "demand",
              granularity: "weekly",
              period: "next",
              limit: 200,
            },
          }),
        ]);

        const highestDemand = buildHighestDemandForecast(
          currentResponse?.data || [],
          nextResponse?.data || [],
        );

        if (isMounted) {
          setForecastPreview(buildForecastPreview(highestDemand));
          setForecastLoading(false);
        }
      } catch {
        if (isMounted) {
          setForecastPreview(EMPTY_FORECAST);
          setForecastLoading(false);
        }
      }
    };

    fetchForecastPreview();

    return () => {
      isMounted = false;
    };
  }, []);

  const statCards = useMemo(
    () =>
      STAT_CARDS.map((card) =>
        card.label === "Orders Today"
          ? {
            ...card,
            value: ordersCount === null ? "Loading..." : Number(ordersCount).toLocaleString(),
          }
          : card,
      ),
    [ordersCount],
  );

  return (
    <section className="dashboard-page" aria-label="Dashboard overview">
      <header className="dashboard-page-header mb-4">
        <h4 className="fw-bold mb-1 dashboard-title">Dashboard</h4>
        <p className="dashboard-subtitle mb-0">A quick operational snapshot of pharmacy sales, inventory, and forecasts.</p>
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
          <SalesTrend />
        </div>
        <div className="col-12 col-md-5 col-lg-4">
          <QuickInsights items={quickInsights} loading={quickInsightsLoading} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-md-6 col-lg-6">
          <InventoryHealth onKnowMore={() => navigate("/inventory")} />
        </div>
        <div className="col-12 col-md-6 col-lg-6">
          <ForecastPreview
            items={forecastPreview}
            loading={forecastLoading}
            onKnowMore={() => navigate("/analytics-and-forecasting")}
          />
        </div>
      </div>
    </section>
  );
}

export default DashBoard;
