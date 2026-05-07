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
import AIIcon from "../assets/icons/AI.svg";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const TABS = [
    { id: "demand", label: "Demand", icon: "fa-solid fa-chart-line" },
    { id: "sales", label: "Sales", icon: "fa-solid fa-coins" },
    { id: "stock", label: "Stock", icon: "fa-solid fa-boxes-stacked" },
];

const FORECAST_DATA = {
    "Last 7 days": {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        values: [32, 37, 41, 51, 54, 52, 58],
    },
    "Last 14 days": {
        labels: ["W1 Mon","W1 Tue","W1 Wed","W1 Thu","W1 Fri","W1 Sat","W1 Sun","W2 Mon","W2 Tue","W2 Wed","W2 Thu","W2 Fri","W2 Sat","W2 Sun"],
        values: [24, 29, 33, 39, 44, 42, 47, 37, 41, 46, 53, 56, 55, 59],
    },
    "Last 30 days": {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        values: Array.from({ length: 30 }, (_, i) => 22 + Math.round(Math.sin(i / 3) * 9 + i * 1.05)),
    },
};

const FORECAST_RANGES = Object.keys(FORECAST_DATA);

const TOP_PREDICTED_DEMAND = [
    { product: "Amoxicillin",        demand: "85 units",  trend: "+12 units" },
    { product: "Paracetamol",        demand: "120 units", trend: "+18 units" },
    { product: "Cetirizine",         demand: "70 units",  trend: "+9 units"  },
    { product: "Ibuprofen",          demand: "65 units",  trend: "+8 units"  },
    { product: "Salbutamol Inhaler", demand: "40 units",  trend: "+5 units"  },
    { product: "Amoxicillin",        demand: "85 units",  trend: "+10 units" },
    { product: "Paracetamol",        demand: "107 units", trend: "+15 units" },
    { product: "Cetirizine",         demand: "40 units",  trend: "+6 units"  },
    { product: "Ibuprofen",          demand: "65 units",  trend: "+7 units"  },
    { product: "Salbutamol Inhaler", demand: "40 units",  trend: "+4 units"  },
];

const DEMAND_INSIGHTS = [
    "Highest demand expected on Saturdays and Sundays",
    "Respiratory medicines show increasing demand",
    "Consistent demand for maintenance medications",
];

function AIForecasting() {
    const [activeTab, setActiveTab] = useState("demand");
    const [range, setRange] = useState("Last 7 days");
    const [tableRange, setTableRange] = useState("Last 7 days");
    const { labels, values } = FORECAST_DATA[range];

    const chartData = useMemo(() => ({
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
    }), [labels, values]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 4, right: 10, bottom: 0, left: 0 } },
        plugins: {
            legend: { display: false },
            tooltip: { mode: "index", intersect: false },
        },
        scales: {
            x: {
                grid: { color: "rgba(15, 23, 42, 0.04)" },
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
                grid: { color: "rgba(15, 23, 42, 0.06)" },
            },
        },
    }), [range]);

    const leftDemand = TOP_PREDICTED_DEMAND.slice(0, 5);
    const rightDemand = TOP_PREDICTED_DEMAND.slice(5, 10);

    return (
        <section className="dashboard-page aif-page">
            <header className="dashboard-page-header mb-3">
                <h4 className="fw-bold mb-1 dashboard-title">Analytics and Forecasting</h4>
                <p className="dashboard-subtitle mb-0 aif-subtitle">
                    AI-driven predictive analytics related to the pharmacy.
                </p>
            </header>

            <div className="aif-tabs mb-4">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={`aif-tab-btn${activeTab === tab.id ? " aif-tab-active" : ""}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <i className={tab.icon} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "demand" && (
                <>
                    <div className="row g-3 mb-3">
                        <div className="col-12 col-md-4 col-lg-3">
                            <article className="card border-0 rounded-3 p-3 h-100 aif-card aif-insight-card">
                                <div className="aif-insight-icon">
                                    <img src={AIIcon} alt="AI Insight" style={{ width: "24px", height: "24px" }} />
                                </div>
                                <div className="aif-insight-inner">
                                    <p className="aif-insight-text">
                                        Demand is expected to increase over the next 7 days, driven by
                                        high sales of essential medicines. Weekend demand is projected
                                        to be higher than weekdays.
                                    </p>
                                </div>
                            </article>
                        </div>

                        <div className="col-12 col-md-8 col-lg-9">
                            <article className="card border-0 shadow-sm rounded-3 p-3 h-100 aif-card">
                                <div className="aif-chart-head mb-2">
                                    <h6 className="fw-bold mb-0 aif-chart-title">Top Predicted Demand</h6>
                                    <div className="position-relative pd-range-select-wrap aif-filter-wrap">
                                        <select
                                            className="form-select form-select-sm pe-4 pd-range-select"
                                            value={tableRange}
                                            onChange={(e) => setTableRange(e.target.value)}
                                            aria-label="Table period"
                                        >
                                            {FORECAST_RANGES.map((p) => <option key={p}>{p}</option>)}
                                        </select>
                                        <i className="bi bi-chevron-down position-absolute top-50 translate-middle-y aif-range-icon" />
                                    </div>
                                </div>
                                <div className="aif-table-inner">
                                    <table className="aif-table aif-split-table">
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th>Product</th>
                                                <th>Predicted Demand</th>
                                                <th>Trend</th>
                                                <th></th>
                                                <th>Product</th>
                                                <th>Predicted Demand</th>
                                                <th>Trend</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leftDemand.map((left, i) => {
                                                const right = rightDemand[i];
                                                return (
                                                    <tr key={i}>
                                                        <td className="aif-cell-num">{i + 1}</td>
                                                        <td className="aif-cell-primary">{left.product}</td>
                                                        <td>{left.demand}</td>
                                                        <td className="aif-cell-trend">{left.trend}</td>
                                                        <td className="aif-cell-num">{i + 6}</td>
                                                        <td className="aif-cell-primary">{right.product}</td>
                                                        <td>{right.demand}</td>
                                                        <td className="aif-cell-trend">{right.trend}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </article>
                        </div>
                    </div>

                    <div className="row g-3">
                        <div className="col-12">
                            <article className="card border-0 shadow-sm rounded-3 aif-card aif-forecast-card">
                                <div className="aif-forecast-chart-side p-3">
                                    <div className="aif-chart-head mb-2">
                                        <h6 className="fw-bold mb-0 aif-chart-title">Demand Forecast Chart and Insight</h6>
                                        <div className="position-relative pd-range-select-wrap aif-filter-wrap">
                                            <select
                                                className="form-select form-select-sm pe-4 pd-range-select"
                                                value={range}
                                                onChange={(e) => setRange(e.target.value)}
                                                aria-label="Forecast period"
                                            >
                                                {FORECAST_RANGES.map((p) => <option key={p}>{p}</option>)}
                                            </select>
                                            <i className="bi bi-chevron-down position-absolute top-50 translate-middle-y aif-range-icon" />
                                        </div>
                                    </div>
                                    <div className="dashboard-chart-wrap">
                                        <Line data={chartData} options={chartOptions} />
                                    </div>
                                </div>
                                <div className="aif-forecast-insights-side">
                                    <div className="aif-insights-box">
                                        <ul className="aif-insights-list">
                                            {DEMAND_INSIGHTS.map((text, i) => (
                                                <li key={i} className="aif-insight-item">
                                                    <span className="aif-insight-bullet">
                                                        <img src={AIIcon} alt="AI Bullet" style={{ width: "16px", height: "16px" }} />
                                                    </span>
                                                    <span>{text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>
                </>
            )}

            {activeTab === "sales" && (
                <div className="aif-coming-soon">
                    <i className="fa-solid fa-coins aif-coming-soon-icon" />
                    <p>Sales analytics coming soon.</p>
                </div>
            )}

            {activeTab === "stock" && (
                <div className="aif-coming-soon">
                    <i className="fa-solid fa-boxes-stacked aif-coming-soon-icon" />
                    <p>Stock analytics coming soon.</p>
                </div>
            )}
        </section>
    );
}

export default AIForecasting;