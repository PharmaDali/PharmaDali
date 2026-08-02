/**
 * SalesSummaryCards
 *
 * Renders the row of summary stat cards (Daily, Weekly, Monthly sales
 * and Total Transactions) at the top of the Sales Reports page.
 */
function SalesSummaryCards({ loading, cards }) {
  return (
    <div className="mt-4">
      <h2 className="fw-semibold section-title">Sales Summary</h2>
      <div className="d-flex flex-wrap gap-3">
        {loading ? (
          <div className="d-flex align-items-center gap-2 text-secondary py-3">
            <div className="spinner-border spinner-border-sm" role="status" style={{ color: "#48AAD9" }} />
            <span>Loading summary...</span>
          </div>
        ) : (
          cards.map((card) => (
            <div key={card.label} className="summary-card">
              <div className="fw-medium" style={{ fontSize: "12px", color: "#444" }}>{card.label}</div>
              <div className="d-flex align-items-baseline gap-2">
                {card.currency && <span style={{ fontSize: "12px", color: "#444" }}>{card.currency}</span>}
                <span className="summary-amount">{card.amount}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SalesSummaryCards;
