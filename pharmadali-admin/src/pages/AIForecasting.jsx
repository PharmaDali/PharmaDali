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
import { useState } from "react";
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

const FORECAST_TREND = [32, 37, 41, 51, 54, 52, 58];

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
    { medicine: "Amoxicillin", lowStock: "less 1 day of supply", expiresIn: "14 days" },
    { medicine: "Paracetamol", lowStock: "less 1 day of supply", expiresIn: "10 days" },
    { medicine: "Cetirizine", lowStock: "1 days of supply", expiresIn: "23 days" },
    { medicine: "Ibuprofen", lowStock: "1 days of supply", expiresIn: "28 days" },
    { medicine: "Salbutamol Inhaler", lowStock: "2 days of supply", expiresIn: "30 days" },
];

const riskClassMap = {
    High: "aif-risk-high",
    Medium: "aif-risk-medium",
    Low: "aif-risk-low",
};

function AIForecasting() {
    const [range, setRange] = useState("Last 7 days");

    const chartData = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
            {
                data: FORECAST_TREND,
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
    };

    const chartOptions = {
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
    };

    return (
        <section className="dashboard-page aif-page">
            <h4 className="fw-bold mb-1 aif-title">Forecasting</h4>
            <p className="text-muted mb-3 aif-subtitle">AI-driven predictive analytics related to the pharmacy.</p>

            <div className="row g-3 mb-3">
                <div className="col-12 col-md-7 col-lg-7">
                    <article className="card border-0 shadow-sm rounded-3 p-3 h-100 dashboard-panel aif-card">
                        <div className="aif-chart-head">
                            <h6 className="fw-bold mb-0 aif-chart-title">Demand Forecast Chart</h6>
                            <div className="position-relative aif-filter-wrap">
                                <select
                                    className="form-select form-select-sm pe-4 aif-range-select"
                                    value={range}
                                    onChange={(e) => setRange(e.target.value)}
                                    aria-label="Forecast period"
                                >
                                    <option>Last 7 days</option>
                                </select>
                                <i className="bi bi-chevron-down position-absolute top-50 translate-middle-y aif-range-icon"></i>
                            </div>
                        </div>

                        <div className="aif-chart-wrap">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </article>
                </div>

                <div className="col-12 col-md-5 col-lg-5">
                    <article className="card border-0 shadow-sm rounded-3 p-3 h-100 dashboard-panel aif-card">
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
                                    <div className="aif-stock-right">
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

            <div className="row g-3">
                <div className="col-12 col-md-6">
                    <article className="card border-0 shadow-sm rounded-3 p-3 h-100 dashboard-panel aif-card">
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
                                            <td className="aif-cell-demand">
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
                    <article className="card border-0 shadow-sm rounded-3 p-3 h-100 dashboard-panel aif-card">
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
                                                <div className="aif-cell-split">
                                                    <span className="aif-table-main">{row.medicine}</span>
                                                    <span className="aif-table-sub aif-table-note">{row.lowStock}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="aif-cell-split">
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