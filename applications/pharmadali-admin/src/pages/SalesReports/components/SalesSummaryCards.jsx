import React from "react";
import { WavingDots } from "../../../components/loading";

function SalesSummaryCards({ loading, cards }) {
  const displayCards = loading
    ? [
        { label: "Gross Sales", currency: "PHP" },
        { label: "Net Sales", currency: "PHP" },
        { label: "Items Sold" },
        { label: "Total Transactions" },
      ]
    : cards;

  return (
    <div className="mt-4">
      <h2 className="fw-semibold section-title">Sales Summary</h2>
      <div className="d-flex flex-wrap gap-3">
        {displayCards.map((card, idx) => (
          <div key={card.label || idx} className="summary-card">
            <div className="fw-medium" style={{ fontSize: "12px", color: "#444" }}>
              {card.label}
            </div>
            <div className="d-flex align-items-baseline gap-2">
              {card.currency && !loading && (
                <span style={{ fontSize: "12px", color: "#444" }}>{card.currency}</span>
              )}
              <span className="summary-amount">
                {loading ? <WavingDots /> : card.amount}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SalesSummaryCards;
