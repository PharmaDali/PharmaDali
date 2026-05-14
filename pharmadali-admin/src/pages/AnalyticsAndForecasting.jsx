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
import { useEffect, useMemo, useState } from "react";
import "../assets/css/dashboard.css";
import "../assets/css/analytics-and-forecasting.css";
import AIIcon from "../assets/icons/analytics-and-forecasting/AI.svg";
import DemandIcon from "../assets/icons/analytics-and-forecasting/demand.svg";
import SalesIcon from "../assets/icons/analytics-and-forecasting/sales.svg";
import StockIcon from "../assets/icons/analytics-and-forecasting/stocks.svg";
import { apiRequest } from "../shared/api/apiClient";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const TABS = [
    { id: "demand", label: "Demand", icon: DemandIcon },
    { id: "sales", label: "Sales", icon: SalesIcon },
    { id: "stock", label: "Stock", icon: StockIcon },
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
    Weekly: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        values: [24, 28, 32, 41, 45, 43, 49],
    },
    Monthly: {
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

const TABLE_RANGES = ["Current Week", "Next Week", "Current Month", "Next Month"];
const SALES_RANGES = ["Weekly", "Monthly"];

const TABLE_RANGE_GRANULARITY = {
    "Current Week": "weekly",
    "Next Week": "weekly",
    "Current Month": "monthly",
    "Next Month": "monthly",
};

const TABLE_RANGE_PERIOD = {
    "Current Week": "current",
    "Next Week": "next",
    "Current Month": "current",
    "Next Month": "next",
};

function AnalyticsAndForecasting() {
    const [activeTab, setActiveTab] = useState("demand");
    const [salesRange, setSalesRange] = useState("Weekly");
    const [tableRange, setTableRange] = useState("Current Week");
    const [demandRows, setDemandRows] = useState(TOP_PREDICTED_DEMAND);
    const [salesSeries, setSalesSeries] = useState(SALES_FORECAST_DATA.Weekly);
    const [demandInsight, setDemandInsight] = useState(null);
    const [salesInsight, setSalesInsight] = useState(null);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [demandPage, setDemandPage] = useState(1);
    const { labels: salesLabels, values: salesValues, forecastStartIndex } =
        salesSeries || SALES_FORECAST_DATA.Weekly;
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

    const buildChartOptions = (selectedRange, dataValues) => {
        const maxValue = maxChartValue(dataValues);
        const stepSize = Math.max(1000, Math.ceil(maxValue / 5 / 1000) * 1000);

        return {
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
                    maxTicksLimit: selectedRange === "Monthly" ? 6 : 8,
                },
            },
            y: {
                min: 10,
                max: maxValue,
                ticks: {
                    stepSize,
                    color: "#5f6670",
                    font: { size: 12, family: "Poppins" },
                    padding: 8,
                    callback: (value) => Math.round(value).toString(),
                },
                grid: { color: "rgba(15, 23, 42, 0.06)" },
            },
        },
        };
    };

    const salesChartData = useMemo(() => {
        if (!Number.isInteger(forecastStartIndex)) {
            return buildChartData(salesValues, salesLabels);
        }

        const historyValues = salesValues.map((value, index) =>
            index < forecastStartIndex ? value : null
        );
        const forecastValues = salesValues.map((value, index) =>
            index >= forecastStartIndex - 1 ? value : null
        );

        return {
            labels: salesLabels,
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
    }, [salesLabels, salesValues, forecastStartIndex]);
    const salesForecastSplitPlugin = useMemo(() => ({
        id: "salesForecastSplit",
        afterDatasetsDraw(chart) {
            if (!Number.isInteger(forecastStartIndex)) {
                return;
            }
            const xScale = chart.scales.x;
            const yScale = chart.scales.y;
            const boundaryIndex = Math.min(
                forecastStartIndex,
                salesLabels.length - 1
            );
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
    }), [forecastStartIndex, salesLabels.length]);

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

    const pageSize = 20;
    const totalDemandPages = Math.max(1, Math.ceil(demandRows.length / pageSize));
    const safeDemandPage = Math.min(demandPage, totalDemandPages);
    const pageStart = (safeDemandPage - 1) * pageSize;
    const pageRows = demandRows.slice(pageStart, pageStart + pageSize);
    const leftDemand = pageRows.slice(0, 10);
    const rightDemand = pageRows.slice(10, 20);

    const tableDateRangeLabel = useMemo(() => {
        const today = new Date();

        const formatDate = (date) =>
            date.toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
            });

        const startOfWeek = (date) => {
            const result = new Date(date);
            const day = result.getDay();
            const diff = (day + 6) % 7;
            result.setDate(result.getDate() - diff);
            result.setHours(0, 0, 0, 0);
            return result;
        };

        const endOfWeek = (date) => {
            const result = new Date(date);
            result.setDate(result.getDate() + 6);
            result.setHours(23, 59, 59, 999);
            return result;
        };

        const startOfMonth = (date) => {
            const result = new Date(date.getFullYear(), date.getMonth(), 1);
            result.setHours(0, 0, 0, 0);
            return result;
        };

        const endOfMonth = (date) => {
            const result = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            result.setHours(23, 59, 59, 999);
            return result;
        };

        if (tableRange === "Current Week") {
            const start = startOfWeek(today);
            const end = endOfWeek(start);
            return `${formatDate(start)} - ${formatDate(end)}`;
        }

        if (tableRange === "Next Week") {
            const nextWeek = new Date(today);
            nextWeek.setDate(nextWeek.getDate() + 7);
            const start = startOfWeek(nextWeek);
            const end = endOfWeek(start);
            return `${formatDate(start)} - ${formatDate(end)}`;
        }

        if (tableRange === "Current Month") {
            const start = startOfMonth(today);
            const end = endOfMonth(today);
            return `${formatDate(start)} - ${formatDate(end)}`;
        }

        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const start = startOfMonth(nextMonth);
        const end = endOfMonth(nextMonth);
        return `${formatDate(start)} - ${formatDate(end)}`;
    }, [tableRange]);

    useEffect(() => {
        let isMounted = true;

        const formatUnits = (value) => {
            const rounded = Math.round(value);
            return `${rounded} units`;
        };

        const buildTopDemandRows = (rows) => {
            const byProduct = new Map();

            rows.forEach((row) => {
                const product = row?.unique_id;
                const period = row?.period;
                const value = Number(row?.forecast_value);

                if (!product || !Number.isFinite(value)) {
                    return;
                }

                const existing = byProduct.get(product) || {
                    product,
                    current: null,
                    next: null,
                    maxValue: null,
                };

                if (period === "current") {
                    existing.current = value;
                }

                if (period === "next") {
                    existing.next = value;
                }

                existing.maxValue = existing.maxValue === null
                    ? value
                    : Math.max(existing.maxValue, value);

                byProduct.set(product, existing);
            });

            const items = Array.from(byProduct.values())
                .filter((entry) => Number.isFinite(entry.maxValue))
                .map((entry) => {
                    const cleanProduct = entry.product.replace(/^\d+_/, "");

                    return {
                        product: cleanProduct,
                        demand: formatUnits(entry.maxValue),
                        sortValue: entry.maxValue,
                    };
                })
                .sort((a, b) => b.sortValue - a.sortValue)
                .slice(0, 100)
                .map(({ sortValue, ...item }) => item);

            return items;
        };

        const fetchDemandTable = async () => {
            const granularity = TABLE_RANGE_GRANULARITY[tableRange] || "weekly";
            const period = TABLE_RANGE_PERIOD[tableRange] || "current";

            try {
                const response = await apiRequest.get("/branch/forecasts", {
                    params: {
                        kind: "demand",
                        granularity,
                        period,
                        limit: 200,
                    },
                });

                const rows = response?.data || [];
                const nextRows = buildTopDemandRows(rows);

                if (isMounted && nextRows.length > 0) {
                    setDemandRows(nextRows);
                    setDemandPage(1);
                } else if (isMounted) {
                    setDemandRows(TOP_PREDICTED_DEMAND);
                    setDemandPage(1);
                }
            } catch (error) {
                if (isMounted) {
                    setDemandRows(TOP_PREDICTED_DEMAND);
                    setDemandPage(1);
                }
            }
        };

        fetchDemandTable();

        return () => {
            isMounted = false;
        };
    }, [tableRange]);

    useEffect(() => {
        let isMounted = true;

        const salesGranularity = salesRange === "Monthly" ? "monthly" : "weekly";

        const formatLabel = (dateString) => {
            const date = new Date(dateString);
            if (Number.isNaN(date.getTime())) {
                return dateString;
            }
            if (salesGranularity === "monthly") {
                return date.toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                });
            }
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
            });
        };

        const buildSalesSeries = (rows) => {
            const history = rows
                .filter((row) => row?.period === "history")
                .sort((a, b) => new Date(a.ds) - new Date(b.ds))
                .slice(-5);

            const current = rows.find((row) => row?.period === "current");
            const next = rows.find((row) => row?.period === "next");

            const labels = history.map((row) => formatLabel(row.ds));
            const values = history.map((row) => Number(row.forecast_value));
            const forecastStartIndex = labels.length;

            if (current?.ds) {
                labels.push(`Forecast ${formatLabel(current.ds)}`);
                values.push(Number(current.forecast_value));
            }

            if (next?.ds) {
                labels.push(`Forecast ${formatLabel(next.ds)}`);
                values.push(Number(next.forecast_value));
            }

            if (labels.length === 0) {
                return SALES_FORECAST_DATA[salesRange];
            }

            return {
                labels,
                values,
                forecastStartIndex: current || next ? forecastStartIndex : null,
            };
        };

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
                const nextSeries = buildSalesSeries(rows);

                if (isMounted) {
                    setSalesSeries(nextSeries);
                }
            } catch (error) {
                if (isMounted) {
                    setSalesSeries(SALES_FORECAST_DATA[salesRange]);
                }
            }
        };

        fetchSalesSeries();

        return () => {
            isMounted = false;
        };
    }, [salesRange]);

    useEffect(() => {
        let isMounted = true;

        const demandGranularity =
            tableRange === "Current Month" || tableRange === "Next Month"
                ? "monthly"
                : "weekly";
        const salesGranularity = salesRange === "Monthly" ? "monthly" : "weekly";

        const fetchInsights = async () => {
            try {
                if (isMounted) {
                    setInsightsLoading(true);
                }
                const response = await apiRequest.get("/branch/forecast-insights", {
                    params: {
                        demand_granularity: demandGranularity,
                        sales_granularity: salesGranularity,
                    },
                });

                const data = response?.data || {};
                if (isMounted) {
                    setDemandInsight(data.demand || null);
                    setSalesInsight(data.sales || null);
                    setInsightsLoading(false);
                }
            } catch (error) {
                if (isMounted) {
                    setDemandInsight(null);
                    setSalesInsight(null);
                    setInsightsLoading(false);
                }
            }
        };

        fetchInsights();

        return () => {
            isMounted = false;
        };
    }, [tableRange, salesRange]);

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
                        <img
                            src={tab.icon}
                            alt=""
                            className="aif-tab-icon"
                            aria-hidden="true"
                        />
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
                                    <p className={`aif-insight-text${insightsLoading ? " aif-insight-loading" : ""}`}>
                                        {insightsLoading
                                            ? "AI insight is loading..."
                                            : (demandInsight
                                                || "Unable to generate demand insights at this time. Please try again later.")}
                                    </p>
                                </div>
                            </article>
                        </div>

                        <div className="col-12 col-md-8 col-lg-9">
                            <article className="card border-0 shadow-sm rounded-3 p-3 h-100 aif-card aif-demand-table">
                                <div className="aif-chart-head mb-2">
                                    <h6 className="fw-bold mb-0 aif-chart-title">Top Predicted Demand</h6>
                                    <div className="position-relative pd-range-select-wrap aif-filter-wrap">
                                        <span className="aif-range-label">{tableDateRangeLabel}</span>
                                        <select
                                            className="form-select form-select-sm pe-4 pd-range-select"
                                            value={tableRange}
                                            onChange={(e) => setTableRange(e.target.value)}
                                            aria-label="Table period"
                                        >
                                            {TABLE_RANGES.map((p) => <option key={p}>{p}</option>)}
                                        </select>
                                        <i className="bi bi-chevron-down position-absolute top-50 translate-middle-y aif-range-icon aif-range-icon-demand" />
                                    </div>
                                </div>
                                <div className="aif-table-inner">
                                    <table className="aif-table aif-split-table">
                                        <thead>
                                            <tr>
                                                <th></th>
                                                <th>Product</th>
                                                <th>Predicted Demand</th>
                                                <th></th>
                                                <th>Product</th>
                                                <th>Predicted Demand</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leftDemand.map((left, i) => {
                                                const right = rightDemand[i];
                                                const leftRank = pageStart + i + 1;
                                                const rightRank = pageStart + i + 11;
                                                return (
                                                    <tr key={i}>
                                                        <td className="aif-cell-num">{leftRank}</td>
                                                        <td className="aif-cell-primary">{left.product}</td>
                                                        <td>{left.demand}</td>
                                                        <td className="aif-cell-num">{right ? rightRank : ""}</td>
                                                        <td className="aif-cell-primary">{right?.product || ""}</td>
                                                        <td>{right?.demand || ""}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="aif-pagination">
                                    <button
                                        type="button"
                                        className="aif-page-btn"
                                        onClick={() => setDemandPage((prev) => Math.max(1, prev - 1))}
                                        disabled={safeDemandPage <= 1}
                                    >
                                        Prev
                                    </button>
                                    <span className="aif-page-info">
                                        Page {safeDemandPage} of {totalDemandPages}
                                    </span>
                                    <button
                                        type="button"
                                        className="aif-page-btn"
                                        onClick={() => setDemandPage((prev) => Math.min(totalDemandPages, prev + 1))}
                                        disabled={safeDemandPage >= totalDemandPages}
                                    >
                                        Next
                                    </button>
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
                                    <p className={`aif-insight-text${insightsLoading ? " aif-insight-loading" : ""}`}>
                                        {insightsLoading
                                            ? "AI insight is loading..."
                                            : (salesInsight
                                                || "Unable to generate sales insights at this time. Please try again later.")}
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
                                                {SALES_RANGES.map((p) => <option key={p}>{p}</option>)}
                                            </select>
                                            <i className="bi bi-chevron-down position-absolute top-50 translate-middle-y aif-range-icon" />
                                        </div>
                                    </div>
                                    <div className="dashboard-chart-wrap aif-sales-chart">
                                        <Line
                                            data={salesChartData}
                                            options={salesChartOptions}
                                            plugins={[salesForecastSplitPlugin]}
                                        />
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

export default AnalyticsAndForecasting;