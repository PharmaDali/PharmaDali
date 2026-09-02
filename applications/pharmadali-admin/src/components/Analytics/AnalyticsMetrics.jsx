import React from "react";
import { WavingDots } from "../../shared/components/loading";

export default function AnalyticsMetrics({ metrics, loading }) {
  return (
    <div className="row g-3 mb-4 analytics-metrics-row">
      {metrics.map((metric, idx) => (
        <div key={metric.label || idx} className="col-6 col-lg-3">
          <div className="admin-card h-100" style={{ padding: "16px" }}>
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="text-muted fw-semibold" style={{ fontSize: "12px" }}>
                {metric.label}
              </span>
              {metric.badge && (
                <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1" style={{ fontSize: "10px" }}>
                  {metric.badge}
                </span>
              )}
            </div>
            <div className="fw-bold" style={{ fontSize: "20px", color: "#1e293b", minHeight: "32px", display: "flex", alignItems: "center" }}>
              {loading ? (
                <WavingDots />
              ) : (
                <span className="text-truncate" title={typeof metric.value === "string" ? metric.value : ""}>
                  {metric.prefix && <span style={{ fontSize: "14px", fontWeight: "700", marginRight: "4px" }}>{metric.prefix}</span>}
                  {metric.value}
                </span>
              )}
            </div>
            {metric.subtitle && (
              <div className="text-secondary mt-1 text-truncate" style={{ fontSize: "11px" }}>
                {metric.subtitle}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
