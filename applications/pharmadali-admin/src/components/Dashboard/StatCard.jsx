import React from "react";
import { WavingDots } from "../../shared/components/loading";

export function StatCard({ label, value, prefix, bg, loading }) {
  return (
    <div
      className="rounded-3 p-3 h-100 dashboard-stat-card"
      style={{ background: bg }}
    >
      <div style={{ fontSize: 13, color: "#334155", marginBottom: 4 }}>{label}</div>
      <div className="dashboard-stat-value" style={{ fontWeight: 900, lineHeight: 2, color: "#334155", fontSize: 32 }}>
        {loading ? (
          <WavingDots />
        ) : (
          <>
            {prefix && <span style={{ fontSize: 18, fontWeight: 900, verticalAlign: "middle", marginRight: 5 }}>{prefix}</span>}
            {value}
          </>
        )}
      </div>
    </div>
  );
}

export default StatCard;
