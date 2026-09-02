import { useMemo } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
import React from "react";
import { ChartSkeleton } from "../../shared/components/loading";

export default function AnalyticsChart({
  chartData,
  chartTitle,
  isCurrency,
  timeframe,
  onTimeframeChange,
  timeframeOptions,
  loading,
  chartType = "line",
}) {
  const labels = chartData?.labels || [];
  const values = chartData?.values || [];

  const data = useMemo(
    () => ({
      labels,
      datasets: [
        {
          data: values,
          borderColor: "#2aabe2",
          borderWidth: 2.5,
          backgroundColor: chartType === "bar" ? "#2aabe2" : "rgba(42, 171, 226, 0.14)",
          fill: true,
          tension: 0.15,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#2aabe2",
          pointBorderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: "#ffffff",
          pointHoverBorderColor: "#2aabe2",
          borderRadius: chartType === "bar" ? 4 : 0,
        },
      ],
    }),
    [labels, values, chartType]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#fff",
          titleColor: "#333",
          bodyColor: "#666",
          borderColor: "#eee",
          borderWidth: 1,
          padding: 10,
          displayColors: false,
          callbacks: {
            label: function (context) {
              let label = context.parsed.y || 0;
              if (isCurrency) {
                label = `PHP ${label.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
              } else {
                label = `${label.toLocaleString()} units`;
              }
              return label;
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { 
            font: { size: typeof window !== "undefined" && window.innerWidth < 768 ? 10 : 12 }, 
            color: "#a0aabe",
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: typeof window !== "undefined" && window.innerWidth < 768 ? 6 : 10,
          },
        },
        y: {
          border: { display: false },
          grid: { color: "#f0f2f5", drawBorder: false },
          ticks: {
            font: { size: typeof window !== "undefined" && window.innerWidth < 768 ? 10 : 12 },
            color: "#a0aabe",
            maxTicksLimit: 6,
            callback: function (value) {
              if (value >= 1000) return value / 1000 + "k";
              return value;
            },
          },
        },
      },
    }),
    [isCurrency]
  );

  return (
    <div className="analytics-panel p-4 w-100 d-flex flex-column">
      <div className="analytics-table-header mb-4">
        <h5 className="analytics-table-title">{chartTitle}</h5>

        <div className="analytics-filter ms-auto d-flex align-items-center">
          <span className="analytics-filter-label text-muted me-2" style={{ fontSize: "13px" }}>
            View:
          </span>
          <select
            className="form-select form-select-sm"
            style={{ width: "auto", minWidth: "110px", borderColor: "#e9ecef", color: "#495057" }}
            value={timeframe}
            onChange={(e) => onTimeframeChange(e.target.value)}
            disabled={loading}
          >
            {timeframeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="w-100" style={{ position: "relative", height: "320px" }}>
        {loading ? (
          <ChartSkeleton height={320} />
        ) : values.length === 0 ? (
          <div className="text-secondary h-100 d-flex align-items-center justify-content-center">
            No data available for this timeframe.
          </div>
        ) : chartType === "bar" ? (
          <Bar data={data} options={options} />
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  );
}
