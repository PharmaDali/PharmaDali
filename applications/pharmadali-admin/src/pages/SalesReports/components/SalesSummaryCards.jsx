import React from "react";
import { CardSkeleton } from "../../../components/loading";

function SalesSummaryCards({ loading, cards }) {
  return (
    <div className="mt-4">
      <h2 className="fw-semibold section-title">Sales Summary</h2>
      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="d-flex flex-wrap gap-3">
          {cards.map((card) => (
            <div key={card.label} className="summary-card">
              <div className="fw-medium" style={{ fontSize: "12px", color: "#444" }}>{card.label}</div>
              <div className="d-flex align-items-baseline gap-2">
                {card.currency && <span style={{ fontSize: "12px", color: "#444" }}>{card.currency}</span>}
                <span className="summary-amount">{card.amount}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SalesSummaryCards;
