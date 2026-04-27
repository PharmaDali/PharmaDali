import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useMemo, useState } from "react";
import "../assets/css/dashboard.css";
import "../assets/css/aiforecasting.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
);

const FORECAST_DATA = {
    "Last 7 days": {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        values: [32, 37, 41, 51, 54, 52, 58],
    },
    "Last 14 days": {
        labels: [
            "W1 Mon",
            "W1 Tue",
            "W1 Wed",
            "W1 Thu",
            "W1 Fri",
            "W1 Sat",
            "W1 Sun",
            "W2 Mon",
            "W2 Tue",
            "W2 Wed",
            "W2 Thu",
            "W2 Fri",
            "W2 Sat",
            "W2 Sun",
        ],
        values: [24, 29, 33, 39, 44, 42, 47, 37, 41, 46, 53, 56, 55, 59],
    },
    "Last 30 days": {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        values: Array.from({ length: 30 }, (_, i) => 22 + Math.round(Math.sin(i / 3) * 9 + i * 1.05)),
    },
};

const FORECAST_RANGES = Object.keys(FORECAST_DATA);

const STOCKOUT_SUGGESTIONS = [
    { risk: "High", medicine: "Amoxicillin", units: 150, date: "March 7, 2026" },
    { risk: "High", medicine: "Paracetamol", units: 100, date: "March 7, 2026" },
    { risk: "Medium", medicine: "Cetirizine", units: 80, date: "March 9, 2026" },
    { risk: "Medium", medicine: "Ibuprofen", units: 70, date: "March 10, 2026" },
    { risk: "Low", medicine: "Salbutamol Inhaler", units: 30, date: "March 14, 2026" },
];

const PREDICTED_HIGH_DEMAND = [
    { medicine: "Amoxicillin", demand: "85 units", period: "next 7 days", confidence: "92%" },
    { medicine: "Paracetamol", demand: "120 units", period: "next 7 days", confidence: "95%" },
    { medicine: "Cetirizine", demand: "70 units", period: "next 7 days", confidence: "88%" },
    { medicine: "Ibuprofen", demand: "65 units", period: "next 7 days", confidence: "90%" },
    { medicine: "Salbutamol Inhaler", demand: "40 units", period: "next 7 days", confidence: "84%" },
];

const INVENTORY_HEALTH = [
    { medicine: "Amoxicillin", lowStock: "less than 1 day of supply", expiresIn: "14 days" },
    { medicine: "Paracetamol", lowStock: "less than 1 day of supply", expiresIn: "10 days" },
    { medicine: "Cetirizine", lowStock: "1 day of supply", expiresIn: "23 days" },
    { medicine: "Ibuprofen", lowStock: "1 day of supply", expiresIn: "28 days" },
    { medicine: "Salbutamol Inhaler", lowStock: "2 days of supply", expiresIn: "30 days" },
];

const riskClassMap = {
    High: "aif-risk-high",
    Medium: "aif-risk-medium",
    Low: "aif-risk-low",
};

const stockRightStyle = {
    textAlign: "right",
    paddingRight: "10px",
};

const groupedCellStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "10px",
};

const splitCellStyle = {
    ...groupedCellStyle,
    gap: "8px",
    width: "100%",
};

function AIForecasting() {
    const [range, setRange] = useState("Last 7 days");
    const { labels, values } = FORECAST_DATA[range];

    const chartData = useMemo(
        () => ({
            labels,
            datasets: [
                {
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
                },
            ],
        }),
        [labels, values],
    );

    const chartOptions = useMemo(
        () => ({
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
            plugins: {
                legend: { display: false },
                tooltip: { mode: "index", intersect: false },
            },
            scales: {
                x: {
                    grid: {
                        color: "rgba(15, 23, 42, 0.04)",
                    },
                    ticks: {
                        color: "#5f6670",
                        font: { size: 12, family: "Poppins" },
                        autoSkip: true,
                        maxTicksLimit: range === "Last 30 days" ? 6 : 8,
                    },
                },
                y: {
                    min: 10,
                    max: 60,
                    ticks: {
                        stepSize: 10,
                        color: "#5f6670",
                        font: { size: 12, family: "Poppins" },
                        padding: 8,
                    },
                    grid: {
                        color: "rgba(15, 23, 42, 0.06)",
                    },
                },
            },
        }),
        [range],
    );

    return (
        <section className="dashboard-page aif-page">
            <header className="dashboard-page-header mb-4">
                <h4 className="fw-bold mb-1 dashboard-title">Forecasting</h4>
                <p className="dashboard-subtitle mb-0 aif-subtitle">
                    AI-driven operational predictions for demand, stockout risk, and inventory readiness.
                </p>
            </header>

            <div className="row g-4 mb-4">
                <div className="col-12 col-md-7 col-lg-7">
                    <article className="card border-0 shadow-sm rounded-3 p-4 h-100 dashboard-panel aif-card">
                        <div className="aif-chart-head">
                            <h6 className="fw-bold mb-0 aif-chart-title">Demand Forecast Chart</h6>
                            <div className="position-relative aif-filter-wrap">
                                <select
                                    className="form-select form-select-sm pe-4 dashboard-range-select aif-range-select"
                                    value={range}
                                    onChange={(e) => setRange(e.target.value)}
                                    aria-label="Forecast period"
                                >
                                    {FORECAST_RANGES.map((period) => (
                                        <option key={period}>{period}</option>
                                    ))}
                                </select>
                                <i
                                    className="bi bi-chevron-down position-absolute top-50 translate-middle-y aif-range-icon"
                                    style={{ right: 12, fontSize: 10, pointerEvents: "none", color: "#888" }}
                                ></i>
                            </div>
                        </div>

                        <div className="dashboard-chart-wrap">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </article>
                </div>

                <div className="col-12 col-md-5 col-lg-5">
                    <article className="card border-0 shadow-sm rounded-3 p-4 h-100 dashboard-panel aif-card">
                        <h6 className="aif-panel-title">
                            <span className="aif-panel-title-text">Stockout Risk &amp; Reorder Suggestions</span>
                            <span className="aif-ai-badge">AI</span>
                        </h6>

                        <div className="aif-list-scroll">
                            {STOCKOUT_SUGGESTIONS.map((item) => (
                                <div key={item.medicine} className="aif-stock-row">
                                    <div>
                                        <p className={`aif-risk-label ${riskClassMap[item.risk]}`}>
                                            {item.risk.toLowerCase()} risk level
                                        </p>
                                        <p className="aif-medicine-name">{item.medicine}</p>
                                    </div>
                                    <div className="aif-stock-right" style={stockRightStyle}>
                                        <p>
                                            <span className="aif-units-value">{item.units}</span>
                                            <span className="aif-units-label"> units</span>
                                        </p>
                                        <p className="aif-date">{item.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </article>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-12 col-md-6">
                    <article className="card border-0 shadow-sm rounded-3 p-4 h-100 dashboard-panel aif-card">
                        <h6 className="aif-panel-title">
                            <span className="aif-panel-title-text">Predicted High-Demand Medicines</span>
                            <span className="aif-ai-badge">AI</span>
                        </h6>

                        <div className="aif-table-scroll">
                            <table className="aif-table aif-predicted-table">
                                <colgroup>
                                    <col className="aif-col-medicine" />
                                    <col className="aif-col-demand" />
                                    <col className="aif-col-confidence" />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>Medicine</th>
                                        <th>Predicted Demand</th>
                                        <th>Confidence</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {PREDICTED_HIGH_DEMAND.map((row) => (
                                        <tr key={row.medicine}>
                                            <td className="aif-cell-primary">{row.medicine}</td>
                                            <td className="aif-cell-demand" style={groupedCellStyle}>
                                                <span className="aif-table-main">{row.demand}</span>
                                                <span className="aif-table-sub">({row.period})</span>
                                            </td>
                                            <td className="aif-cell-confidence">{row.confidence}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>
                </div>

                <div className="col-12 col-md-6">
                    <article className="card border-0 shadow-sm rounded-3 p-4 h-100 dashboard-panel aif-card">
                        <h6 className="aif-panel-title">
                            <span className="aif-panel-title-text">Inventory Health</span>
                            <span className="aif-ai-badge">AI</span>
                        </h6>

                        <div className="aif-table-scroll">
                            <table className="aif-table aif-inventory-table">
                                <colgroup>
                                    <col className="aif-col-half" />
                                    <col className="aif-col-half" />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>Low Stock Items</th>
                                        <th>Expiring Soon</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {INVENTORY_HEALTH.map((row) => (
                                        <tr key={row.medicine}>
                                            <td>
                                                <div className="aif-cell-split" style={splitCellStyle}>
                                                    <span className="aif-table-main">{row.medicine}</span>
                                                    <span className="aif-table-sub aif-table-note">{row.lowStock}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="aif-cell-split" style={splitCellStyle}>
                                                    <span className="aif-table-main">{row.medicine}</span>
                                                    <span className="aif-table-sub aif-table-note">{row.expiresIn}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}

export default AIForecasting;