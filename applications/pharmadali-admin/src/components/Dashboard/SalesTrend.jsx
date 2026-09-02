import React, { useState, useEffect } from "react";
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
import { fetchSalesTrend } from "../../services/dashboardService";
import { maxChartValue } from "../../utils/dashboardUtils";
import { ChartSkeleton } from "../../shared/components/loading";
import SelectDropdown from "../../shared/components/SelectDropdown";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export function SalesTrend({ initialTrend, loading }) {
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

  if (loading && !trendData) {
    return <ChartSkeleton height={220} title="Sales Trend Overview" />;
  }

  const labels = trendData?.labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const values = trendData?.values || [0, 0, 0, 0, 0, 0, 0];

  const data = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: "#2aabe2",
        borderWidth: 2.5,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#2aabe2",
        pointBorderWidth: 2.5,
        pointRadius: 5.5,
        pointHoverRadius: 7.5,
        pointHoverBackgroundColor: "#ffffff",
        pointHoverBorderColor: "#2aabe2",
        pointHoverBorderWidth: 3,
        fill: true,
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "rgba(42, 171, 226, 0.12)";
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "rgba(42, 171, 226, 0.22)");
          gradient.addColorStop(1, "rgba(42, 171, 226, 0.01)");
          return gradient;
        },
        tension: 0,
        clip: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 15,
        right: 10,
        bottom: 5,
        left: 5,
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleFont: { size: 12, weight: "600" },
        bodyFont: { size: 13, weight: "700" },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (ctx) => ` PHP ${Number(ctx.parsed.y).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(241, 245, 249, 0.8)", drawBorder: false },
        ticks: { color: "#888888", font: { size: 12, weight: "500" } },
      },
      y: {
        border: { display: false },
        grid: { color: "rgba(241, 245, 249, 0.8)", drawBorder: false },
        min: 0,
        max: maxChartValue(values),
        ticks: {
          color: "#888888",
          font: { size: 11 },
          callback: (val) => (val >= 1000 ? `${val / 1000}k` : val),
        },
      },
    },
  };

  return (
    <div className="admin-card h-100 dashboard-panel">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="fw-bold mb-0" style={{ fontSize: 16, color: "#2aabe2" }}>Sales Trend Overview</h6>
        <div style={{ minWidth: 120 }}>
          <SelectDropdown
            id="dashboard-sales-trend-timeframe"
            value={range}
            onChange={(val) => setRange(val)}
            options={["Daily", "Weekly", "Monthly"]}
          />
        </div>
      </div>
      <div className="dashboard-chart-wrap" style={{ height: 220 }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

export default SalesTrend;
