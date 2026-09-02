import React from "react";
import { QuickInsightSkeleton } from "../../shared/components/loading";

const EMPTY_QUICK_INSIGHTS = [
  { category: "Top Selling", main: "No data", right: "0", rightSub: "units sold" },
  { category: "Top Category", main: "No data", right: "--", rightSub: "of total sales" },
  { category: "Sales Growth", main: "0%", right: "0%", rightSub: "vs last period" },
  { category: "Profit Today", main: "PHP 0.00", right: "30%", rightSub: "margin" },
];

function InsightRows({ items, rowClassName, rightClassName }) {
  return (
    <div className="d-flex flex-column gap-0">
      {items.map((item, index) => (
        <div key={`${item.category}-${item.main}`}>
          {index > 0 && <hr className="my-2" />}
          <div className={`d-flex justify-content-between align-items-start ${rowClassName}`}>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>{item.category}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#334155" }}>{item.main}</div>
            </div>
            <div className={`text-end ${rightClassName}`}>
              {item.right && (
                <span style={{ fontSize: 15, fontWeight: 700, color: "#334155" }}>{item.right}</span>
              )}
              <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: item.right ? 4 : 0 }}>
                {item.rightSub}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function QuickInsights({ items, loading }) {
  return (
    <div className="admin-card h-100 dashboard-panel">
      <h6 className="fw-bold mb-3" style={{ fontSize: 16, color: "#2aabe2" }}>Quick Insights</h6>
      {loading ? (
        <QuickInsightSkeleton count={4} />
      ) : (
        <InsightRows
          items={items && items.length > 0 ? items : EMPTY_QUICK_INSIGHTS}
          rowClassName="quick-insight-row"
          rightClassName="quick-insight-right"
        />
      )}
    </div>
  );
}

export default QuickInsights;
