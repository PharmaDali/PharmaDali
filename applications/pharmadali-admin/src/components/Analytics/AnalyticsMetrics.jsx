import React from "react";
import { WavingDots } from "../../shared/components/loading";

const COLORS = ["#87ceeb", "#87ceeb", "#87ceeb", "#87ceeb"];

export default function AnalyticsMetrics({ metrics, loading }) {
  return (
    <div className="row g-3 mb-3 analytics-metrics-row">
      {metrics.map((metric, idx) => (
        <div key={metric.label || idx} className="col-6 col-lg-3">
          <div
            className="rounded-3 p-3 h-100 analytics-metric-card"
            style={{ background: metric.bg || COLORS[idx % COLORS.length] }}
          >
            <div className="d-flex align-items-center justify-content-between" style={{ marginBottom: 4 }}>
              <div className="analytics-metric-label" style={{ fontSize: 13, color: "#334155" }}>
                {metric.label}
              </div>
              {metric.badge && (
                <span style={{ color: "#334155", fontWeight: 700, fontSize: "11px" }}>
                  {metric.badge}
                </span>
              )}
            </div>
            <div className="analytics-metric-value" style={{ fontWeight: 900, lineHeight: 1.1, color: "#334155", wordBreak: "break-word", padding: "8px 0" }}>
              {loading ? (
                <WavingDots />
              ) : (
                <span title={typeof metric.value === "string" ? metric.value : ""} style={{ fontSize: String(metric.value).length > 10 ? "0.75em" : "1em" }}>
                  {metric.prefix && <span style={{ fontSize: "0.55em", fontWeight: 900, verticalAlign: "middle", marginRight: 5 }}>{metric.prefix}</span>}
                  {metric.value}
                </span>
              )}
            </div>
            {metric.subtitle && (
              <div className="analytics-metric-subtitle" style={{ fontSize: "11px", lineHeight: "1.3", color: "#475569", fontWeight: 500, marginTop: "-4px" }}>
                {metric.subtitle}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
