import React from "react";
import { WavingDots } from "../../shared/components/loading";

const COLORS = ["#87ceeb", "#87ceeb", "#87ceeb", "#87ceeb"];

export default function AnalyticsMetrics({ metrics, loading }) {
  return (
    <div className="row g-3 mb-3 analytics-metrics-row">
      {metrics.map((metric, idx) => (
        <div key={metric.label || idx} className="col-6 col-lg-3">
          <div
            className="rounded-3 p-3 h-100"
            style={{ background: metric.bg || COLORS[idx % COLORS.length] }}
          >
            <div className="d-flex align-items-center justify-content-between" style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 13, color: "#334155" }}>
                {metric.label}
              </div>
              {metric.badge && (
                <span style={{ color: "#334155", fontWeight: 700, fontSize: "11px" }}>
                  {metric.badge}
                </span>
              )}
            </div>
            <div style={{ fontWeight: 900, lineHeight: 2, color: "#334155", fontSize: 32, wordBreak: "break-word" }}>
              {loading ? (
                <WavingDots />
              ) : (
                <span title={typeof metric.value === "string" ? metric.value : ""}>
                  {metric.prefix && <span style={{ fontSize: 18, fontWeight: 900, verticalAlign: "middle", marginRight: 5 }}>{metric.prefix}</span>}
                  {metric.value}
                </span>
              )}
            </div>
            {metric.subtitle && (
              <div style={{ fontSize: "11px", lineHeight: "1.3", color: "#475569", fontWeight: 500, marginTop: "-4px" }}>
                {metric.subtitle}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
