import React from "react";
import { WavingDots } from "../../shared/components/loading";

function SalesSummaryCards({ loading, cards }) {
  const displayCards = loading
    ? [
        { label: "Daily Sales", currency: "PHP" },
        { label: "Weekly Sales", currency: "PHP" },
        { label: "Monthly Sales", currency: "PHP" },
        { label: "Total Transactions" },
      ]
    : cards;

  return (
    <div className="mt-4 mb-4">
      <h2 className="section-title">Sales Summary</h2>
      <div className="summary-cards-container">
        {displayCards.map((card, idx) => (
          <div key={card.label || idx} className="summary-card">
            <div className="summary-card-label">
              {card.label}
            </div>
            <div className="summary-card-body">
              {card.currency && !loading && (
                <span className="summary-currency-tag">{card.currency}</span>
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
