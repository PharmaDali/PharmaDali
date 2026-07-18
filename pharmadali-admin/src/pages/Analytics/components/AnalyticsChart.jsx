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
import aiIcon from "../../../assets/icons/analytics-and-forecasting/AI.svg";

export default function AnalyticsChart({ chartData, chartTitle, insights, isCurrency, timeframe, onTimeframeChange, timeframeOptions, loading, chartType = "line" }) {
  const labels = chartData?.labels || [];
  const values = chartData?.values || [];

  const data = useMemo(
    () => ({
      labels,
      datasets: [{
        data: values,
        borderColor: "#2aabe2",
        backgroundColor: chartType === "bar" ? "#2aabe2" : "rgba(42,171,226,0.10)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#2aabe2",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderRadius: chartType === "bar" ? 4 : 0,
      }],
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
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false, drawBorder: false },
          ticks: { font: { size: 12 }, color: "#a0aabe" }
        },
        y: {
          border: { display: false },
          grid: { color: "#f0f2f5", drawBorder: false },
          ticks: {
            font: { size: 12 },
            color: "#a0aabe",
            maxTicksLimit: 6,
            callback: function (value) {
              if (value >= 1000) return value / 1000 + "k";
              return value;
            }
          }
        }
      }
    }),
    [isCurrency]
  );

  return (
    <div className="analytics-panel p-4 h-100 d-flex flex-column">
      <div className="analytics-table-header mb-4">
        <h5 className="analytics-table-title">{chartTitle}</h5>

        <div className="analytics-filter ms-auto d-flex align-items-center">
          <span className="analytics-filter-label text-muted me-2" style={{ fontSize: '13px' }}>View:</span>
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto', minWidth: '100px', borderColor: '#e9ecef', color: '#495057' }}
            value={timeframe}
            onChange={(e) => onTimeframeChange(e.target.value)}
            disabled={loading}
          >
            {timeframeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="row flex-grow-1 min-h-0">
        <div className="col-lg-8 mb-4 mb-lg-0">
          <div className="chart-container" style={{ position: 'relative', height: '100%', minHeight: '280px' }}>
            {loading ? (
              <div className="text-secondary h-100 d-flex align-items-center justify-content-center">
                <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: "#48AAD9" }} />
                Loading chart...
              </div>
            ) : values.length === 0 ? (
              <div className="text-secondary h-100 d-flex align-items-center justify-content-center">No data available for this timeframe.</div>
            ) : chartType === "bar" ? (
              <Bar data={data} options={options} />
            ) : (
              <Line data={data} options={options} />
            )}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="h-100 p-4 rounded d-flex flex-column justify-content-center" style={{ backgroundColor: '#f4f7fe' }}>
            {insights.map((insight, idx) => (
              <div key={idx} className="d-flex align-items-center" style={{ marginBottom: idx === insights.length - 1 ? 0 : '24px' }}>
                <img src={aiIcon} alt="" width="24" height="24" className="me-3 flex-shrink-0" />
                <span style={{ fontSize: '13.5px', color: '#5f6d7a', lineHeight: '1.5', fontWeight: '500' }}>
                  {insight}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
