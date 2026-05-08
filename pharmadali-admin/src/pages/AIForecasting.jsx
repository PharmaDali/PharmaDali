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

const SALES_FORECAST_DATA = {
    "Last 7 days": {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        values: [24, 28, 32, 41, 45, 43, 49],
    },
    "Last 14 days": {
        labels: ["W1 Mon","W1 Tue","W1 Wed","W1 Thu","W1 Fri","W1 Sat","W1 Sun","W2 Mon","W2 Tue","W2 Wed","W2 Thu","W2 Fri","W2 Sat","W2 Sun"],
        values: [19, 22, 26, 31, 36, 34, 38, 28, 31, 35, 40, 43, 41, 46],
    },
    "Last 30 days": {
        labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
        values: Array.from({ length: 30 }, (_, i) => 18 + Math.round(Math.sin(i / 3.2) * 7 + i * 0.9)),
    },
};

const SALES_INSIGHTS = [
    "Sales grow steadily through mid-week with a weekend lift",
    "OTC essentials continue to drive the highest revenue",
    "Late afternoon sees the strongest transaction volume",
];

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

const STOCK_RISK_DATA = {
    labels: ["Jan 2", "Jan 3", "Jan 4", "Jan 5", "Jan 6", "Jan 7", "Jan 8"],
    values: [20, 25, 33, 42, 58, 70, 85],
};

function AIForecasting() {
    const [activeTab, setActiveTab] = useState("demand");
    const [range, setRange] = useState("Last 7 days");
    const [salesRange, setSalesRange] = useState("Last 7 days");
    const [tableRange, setTableRange] = useState("Last 7 days");
    const { labels, values } = FORECAST_DATA[range];
    const { labels: salesLabels, values: salesValues } = SALES_FORECAST_DATA[salesRange];
    const { labels: stockLabels, values: stockValues } = STOCK_RISK_DATA;

    const maxChartValue = (valueList) => {
        const maxValue = Math.max(...valueList, 0);
        return Math.max(10, Math.ceil(maxValue / 10) * 10);
    };

    const buildChartData = (dataValues, dataLabels) => ({
        labels: dataLabels,
        datasets: [{
            data: dataValues,
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
    });

    const buildChartOptions = (selectedRange, dataValues) => ({
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
                    maxTicksLimit: selectedRange === "Last 30 days" ? 6 : 8,
                },
            },
            y: {
                min: 10,
                max: maxChartValue(dataValues),
                ticks: {
                    stepSize: 10,
                    color: "#5f6670",
                    font: { size: 12, family: "Poppins" },
                    padding: 8,
                },
                grid: { color: "rgba(15, 23, 42, 0.06)" },
            },
        },
    });

    const chartData = useMemo(() => buildChartData(values, labels), [labels, values]);
    const chartOptions = useMemo(() => buildChartOptions(range, values), [range, values]);
    const salesChartData = useMemo(() => buildChartData(salesValues, salesLabels), [salesLabels, salesValues]);
    const salesChartOptions = useMemo(() => buildChartOptions(salesRange, salesValues), [salesRange, salesValues]);

    const stockChartData = useMemo(() => buildChartData(stockValues, stockLabels), [stockLabels, stockValues]);

    const stockChartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 18, right: 18, bottom: 10, left: 18 } },
        plugins: {
            legend: { display: false },
            tooltip: { mode: "index", intersect: false },
        },
        scales: {
            x: {
                grid: { color: "rgba(15, 23, 42, 0.04)" },
                ticks: {
                    color: "#6b7280",
                    font: { size: 12, family: "Poppins" },
                },
            },
            y: {
                min: 0,
                max: 100,
                ticks: {
                    display: true,
                    stepSize: 50,
                    color: "#6b7280",
                    font: { size: 12, family: "Poppins" },
                    callback: (value) => `${value}%`,
                },
                grid: {
                    color: (ctx) => {
                        const value = ctx.tick?.value;
                        if (value === 100) return "rgba(248, 113, 113, 0.6)";
                        if (value === 50) return "rgba(251, 191, 36, 0.6)";
                        if (value === 0) return "rgba(74, 222, 128, 0.6)";
                        return "rgba(15, 23, 42, 0.04)";
                    },
                    borderDash: [6, 6],
                    borderDashOffset: 0,
                    drawTicks: false,
                },
            },
        },
    }), [stockValues]);

    const stockValueLabelPlugin = useMemo(() => ({
        id: "stockValueLabels",
        afterDatasetsDraw(chart) {
            const { ctx } = chart;
            const meta = chart.getDatasetMeta(0);
            const data = chart.data.datasets[0]?.data || [];

            ctx.save();
            ctx.fillStyle = "#111827";
            ctx.font = "600 12px Poppins";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";

            meta.data.forEach((point, index) => {
                const value = data[index];
                if (typeof value === "number") {
                    ctx.fillText(`${value}%`, point.x, point.y - 8);
                }
            });

            ctx.restore();
        },
    }), []);

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
                <div className="aif-section aif-section-demand">
                    <div className="row g-3 mb-3 aif-demand-row">
                        <div className="col-12 col-md-4 col-lg-3">
                            <article className="card border-0 rounded-3 p-3 h-100 aif-card aif-insight-card aif-demand-insight">
                                <div className="aif-insight-icon">
                                    <img src={AIIcon} alt="AI Insight" style={{ width: "30px", height: "30px" }} />
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
                            <article className="card border-0 shadow-sm rounded-3 p-3 h-100 aif-card aif-demand-table">
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

                    <div className="row g-3 aif-demand-row">
                        <div className="col-12">
                            <article className="card border-0 shadow-sm rounded-3 aif-card aif-forecast-card aif-demand-forecast">
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
                                                        <img src={AIIcon} alt="AI Bullet" style={{ width: "25px", height: "25px" }} />
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
                </div>
            )}

            {activeTab === "sales" && (
                <div className="aif-section aif-section-sales">
                    <div className="row g-3 mb-3 aif-sales-row">
                        <div className="col-12">
                            <article className="card border-0 rounded-3 h-100 aif-card aif-insight-card aif-insight-card-sales aif-sales-insight">
                                <div className="aif-insight-icon">
                                    <img src={AIIcon} alt="AI Insight" style={{ width: "30px", height: "30px" }} />
                                </div>
                                <div className="aif-insight-inner">
                                    <p className="aif-insight-text">
                                        Sales are expected to grow moderately this week, with higher
                                        transactions in late afternoon and evening hours. Essential
                                        and OTC medicines continue to drive most of the revenue. 
                                    </p>
                                </div>
                            </article>
                        </div>
                    </div>

                    <div className="row g-3 aif-sales-row">
                        <div className="col-12">
                            <article className="card border-0 shadow-sm rounded-3 aif-card aif-forecast-card aif-forecast-card-full aif-sales-forecast">
                                <div className="aif-forecast-chart-side p-3">
                                    <div className="aif-chart-head mb-2">
                                        <h6 className="fw-bold mb-0 aif-chart-title">Sales Trend Chart</h6>
                                        <div className="position-relative pd-range-select-wrap aif-filter-wrap">
                                            <select
                                                className="form-select form-select-sm pe-4 pd-range-select"
                                                value={salesRange}
                                                onChange={(e) => setSalesRange(e.target.value)}
                                                aria-label="Sales period"
                                            >
                                                {FORECAST_RANGES.map((p) => <option key={p}>{p}</option>)}
                                            </select>
                                            <i className="bi bi-chevron-down position-absolute top-50 translate-middle-y aif-range-icon" />
                                        </div>
                                    </div>
                                    <div className="dashboard-chart-wrap aif-sales-chart">
                                        <Line data={salesChartData} options={salesChartOptions} />
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "stock" && (
                <div className="aif-section aif-section-stock">
                    <div className="row g-3 mb-3 aif-stock-row">
                        <div className="col-12">
                            <article className="card border-0 rounded-3 h-100 aif-card aif-insight-card aif-insight-card-sales aif-stock-insight">
                                <div className="aif-insight-icon">
                                    <img src={AIIcon} alt="AI Insight" style={{ width: "30px", height: "30px" }} />
                                </div>
                                <div className="aif-insight-inner">
                                    <p className="aif-insight-label">AI Recommendation</p>
                                    <p className="aif-insight-text">
                                        Adjust reordering frequency for high-demand items and limit
                                        restocking of slow-moving products to maintain balanced
                                        inventory levels.
                                    </p>
                                </div>
                            </article>
                        </div>
                    </div>

                    <div className="row g-3 aif-stock-row">
                        <div className="col-12">
                            <article className="card border-0 shadow-sm rounded-3 p-3 aif-card aif-stock-chart-card">
                                <div className="aif-stock-head">
                                    <h6 className="fw-bold mb-1 aif-chart-title">Stock Risk Outlook (Next 7 Days)</h6>
                                    <p className="aif-stock-subtitle mb-0">
                                        Overall inventory risk trend based on current stock movement and demand patterns.
                                    </p>
                                </div>
                                <div className="aif-stock-chart">
                                    <div className="aif-stock-risk-labels">
                                        <span className="aif-risk-label aif-risk-high">High Risk</span>
                                        <span className="aif-risk-label aif-risk-moderate">Moderate Risk</span>
                                        <span className="aif-risk-label aif-risk-low">Low Risk</span>
                                    </div>
                                    <div className="dashboard-chart-wrap aif-stock-chart-wrap">
                                        <Line
                                            data={stockChartData}
                                            options={stockChartOptions}
                                            plugins={[stockValueLabelPlugin]}
                                        />
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default AIForecasting;