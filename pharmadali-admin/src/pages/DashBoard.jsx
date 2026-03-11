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
import { useState } from "react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const SALES_DATA = {
  "Last 7 days": {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    values: [31, 38, 42, 50, 53, 49, 58],
  },
  "Last 14 days": {
    labels: ["W1 Mon", "W1 Tue", "W1 Wed", "W1 Thu", "W1 Fri", "W1 Sat", "W1 Sun", "W2 Mon", "W2 Tue", "W2 Wed", "W2 Thu", "W2 Fri", "W2 Sat", "W2 Sun"],
    values: [22, 25, 28, 30, 35, 32, 38, 31, 38, 42, 50, 53, 49, 58],
  },
  "Last 30 days": {
    labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
    values: Array.from({ length: 30 }, (_, i) => 20 + Math.round(Math.sin(i / 3) * 10 + i * 1.2)),
  },
};

const STAT_CARDS = [
  { label: "Revenue Today", value: "20,003", prefix: "PHP", bg: "#96D2EE", color: "#fff" },
  { label: "Orders Today", value: "167", prefix: null, bg: "#96D2EE", color: "#fff" },
  { label: "Inventory Value", value: "518,000", prefix: "PHP", bg: "#96D2EE", color: "#fff" },
  { label: "Low Stock Items", value: "3", prefix: null, bg: "#F9C784", color: "#fff" },
  { label: "Predicted Stockout Risk", value: "High", prefix: null, ai: true, bg: "#F28B82", color: "#fff" },
];

const QUICK_INSIGHTS = [
  { category: "Top Selling", main: "Paracetamol", right: "126", rightSub: "units sold" },
  { category: "Top Category", main: "Tablets", right: "38%", rightSub: "of total sales" },
  { category: "Sales Growth", main: "+18%", right: "+18%", rightSub: "vs Last Week" },
  { category: "Profit Today", main: "PHP 5,762", right: "32%", rightSub: "margin" },
];

const LOW_STOCK = [
  { name: "Amoxicillin", note: "less than 1 day of supply" },
  { name: "Amoxicillin", note: "1 days supply" },
  { name: "Amoxicillin", note: "2 days supply only" },
];

const EXPIRING_SOON = [
  { name: "Amoxicillin", days: "14 days" },
  { name: "Amoxicillin", days: "10 days" },
  { name: "Amoxicillin", days: "23 days" },
];

const FORECAST = [
  { category: "High Demand Forecast", main: "Paracetamol", right: "+22%", rightSub: "demand next week" },
  { category: "Stockout Risk", main: "Cetirizine", right: "68%", rightSub: "probability in 3 days" },
  { category: "Suggested Reorder", main: "Ibuprofen", right: null, rightSub: "Reorder within 2 days" },
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
      className="rounded-3 p-3 flex-grow-1"
      style={{ background: bg, minWidth: 120 }}
    >
      <div style={{ fontSize: 12, color: "#444444", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1, color: "#1a2a3a" }}>
        {prefix && <span style={{ fontSize: 13, fontWeight: 600, verticalAlign: "middle", marginRight: 2 }}>{prefix}</span>}
        {value}
        {ai && <AiBadge />}
      </div>
    </div>
  );
}

function SalesTrend() {
  const [range, setRange] = useState("Last 7 days");
  const { labels, values } = SALES_DATA[range];

  const data = {
    labels,
    datasets: [{
      data: values,
      borderColor: "#2aabe2",
      backgroundColor: "rgba(42,171,226,0.12)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: "#2aabe2",
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: "index", intersect: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#888", font: { size: 12 } } },
      y: { grid: { color: "#f0f4f8" }, ticks: { color: "#888", font: { size: 12 } }, beginAtZero: false },
    },
  };

  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 h-100">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="fw-bold mb-0" style={{ fontSize: 16, color: "#2aabe2" }}>Sales Trend</h6>
        <select
          className="form-select form-select-sm"
          style={{ width: "auto", fontSize: 13, borderRadius: 20, border: "1.5px solid #dde3ec", background: "#f5f8fb" }}
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          {Object.keys(SALES_DATA).map((k) => <option key={k}>{k}</option>)}
        </select>
      </div>
      <div style={{ height: 240 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

function QuickInsights() {
  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 h-100">
      <h6 className="fw-bold mb-3" style={{ fontSize: 16, color: "#2aabe2" }}>Quick Insights</h6>
      <div className="d-flex flex-column gap-0">
        {QUICK_INSIGHTS.map((item, i) => (
          <div key={i}>
            {i > 0 && <hr className="my-2" />}
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div style={{ fontSize: 11, color: "#aaa" }}>{item.category}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#222" }}>{item.main}</div>
              </div>
              <div className="text-end">
                <span style={{ fontSize: 15, fontWeight: 700, color: "#222" }}>{item.right}</span>
                <span style={{ fontSize: 11, color: "#aaa", marginLeft: 4 }}>{item.rightSub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryHealth() {
  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 h-100 d-flex flex-column">
      <h6 className="fw-bold mb-3" style={{ fontSize: 16, color: "#2aabe2" }}>Inventory Health </h6>
      <div className="d-flex flex-grow-1" style={{ minHeight: 0 }}>
        <div className="pe-3" style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "#555", fontWeight: 600, marginBottom: 8 }}>
            Low Stock Items <AiBadge />
          </div>
          {LOW_STOCK.map((item, i) => (
            <div key={i} className="d-flex justify-content-between align-items-center mb-3">
              <div style={{ fontSize: 13, color: "#222" }}>{item.name}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{item.note}</div>
            </div>
          ))}
        </div>
        <div style={{ width: 1, background: "#eee", flexShrink: 0 }} />
        <div className="ps-3" style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "#555", fontWeight: 600, marginBottom: 8 }}>Expiring Soon</div>
          {EXPIRING_SOON.map((item, i) => (
            <div key={i} className="d-flex justify-content-between align-items-center mb-3">
              <div style={{ fontWeight: 700, fontSize: 13, color: "#222" }}>{item.name}</div>
              <div style={{ fontSize: 13, color: "#555" }}>{item.days}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-end mt-auto pt-2">
        <span style={{ fontSize: 13, color: "#2aabe2", cursor: "pointer", fontWeight: 600 }}>Know more</span>
      </div>
    </div>
  );
}

function ForecastPreview() {
  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 h-100 d-flex flex-column">
      <h6 className="fw-bold mb-3" style={{ fontSize: 16, color: "#2aabe2" }}>
        Forecast Preview <AiBadge />
      </h6>
      <div className="d-flex flex-column gap-0">
        {FORECAST.map((item, i) => (
          <div key={i}>
            {i > 0 && <hr className="my-2" />}
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div style={{ fontSize: 11, color: "#aaa" }}>{item.category}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#222" }}>{item.main}</div>
              </div>
              <div className="text-end">
                {item.right && <span style={{ fontSize: 15, fontWeight: 700, color: "#222" }}>{item.right} </span>}
                <span style={{ fontSize: 11, color: "#aaa" }}>{item.rightSub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-end mt-auto pt-2">
        <span style={{ fontSize: 13, color: "#2aabe2", cursor: "pointer", fontWeight: 600 }}>Know more</span>
      </div>
    </div>
  );
}

function DashBoard() {
  return (
    <div>
      <h4 className="fw-bold mb-1" style={{ color: "#2aabe2" }}>Dashboard</h4>
      <p className="text-muted mb-4" style={{ fontSize: 13 }}>A quick data overview of the inventory.</p>

      <div className="d-flex flex-wrap gap-3 mb-4">
        {STAT_CARDS.map((c, i) => <StatCard key={i} {...c} />)}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-lg-7">
          <SalesTrend />
        </div>
        <div className="col-12 col-lg-5">
          <QuickInsights />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <InventoryHealth />
        </div>
        <div className="col-12 col-lg-6">
          <ForecastPreview />
        </div>
      </div>
    </div>
  );
}

export default DashBoard;
