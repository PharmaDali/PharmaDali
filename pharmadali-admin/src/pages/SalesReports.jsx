
const REVENUE_CARDS = [
  { label: "Daily Sales", amount: "20,003", currency: "PHP" },
  { label: "Weekly Sales", amount: "20,003", currency: "PHP" },
  { label: "Monthly Sales", amount: "20,003", currency: "PHP" },
  { label: "Total Transactions", amount: "20,003" },
];

const SALES_ROWS = [
  {
    id: "ORD-1025",
    items: 6,
    processedBy: "Denmar Redondo",
    total: "120.00",
    date: "2026-01-01 10:03",
  },
  {
    id: "ORD-1026",
    items: 3,
    processedBy: "Denmar Redondo",
    total: "30.00",
    date: "2026-01-01 10:04",
  },
  {
    id: "ORD-1027",
    items: 1,
    processedBy: "Denmar Redondo",
    total: "70.00",
    date: "2026-01-01 10:13",
  },
  {
    id: "ORD-1028",
    items: 3,
    processedBy: "Denmar Redondo",
    total: "39.00",
    date: "2026-01-01 10:13",
  },
  {
    id: "ORD-1029",
    items: 1,
    processedBy: "Denmar Redondo",
    total: "215.00",
    date: "2026-01-01 10:20",
  },
  {
    id: "ORD-1030",
    items: 5,
    processedBy: "Denmar Redondo",
    total: "50.00",
    date: "2026-01-01 10:29",
  },
  {
    id: "ORD-1031",
    items: 30,
    processedBy: "Denmar Redondo",
    total: "390.00",
    date: "2026-01-01 10:43",
  },
  {
    id: "ORD-1032",
    items: 7,
    processedBy: "Denmar Redondo",
    total: "830.00",
    date: "2026-01-01 10:44",
  },
  {
    id: "ORD-1033",
    items: 10,
    processedBy: "Denmar Redondo",
    total: "30.00",
    date: "2026-01-01 10:55",
  },
  {
    id: "ORD-1033",
    items: 3,
    processedBy: "Denmar Redondo",
    total: "189.00",
    date: "2026-01-01 11:03",
  },
];

function SalesReports() {
  return (
    <section>
      <header className="admin-page-header">
        <h4 className="fw-bold mb-1 admin-page-title">Sales &amp; Report</h4>
        <p className="admin-page-subtitle">Sales and reports related to the pharmacy.</p>
      </header>

      <div className="mt-4">
        <h2 className="fw-semibold section-title">Sales Summary</h2>
        <div className="summary-cards">
          {REVENUE_CARDS.map((card) => (
            <div key={card.label} className="summary-card">
              <div className="summary-label fw-medium">{card.label}</div>
              <div className="summary-value">
                {card.currency ? (
                  <span className="summary-currency">{card.currency}</span>
                ) : null}
                <span className="summary-amount">{card.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="report-card">
          <div className="report-header">
            <h3 className="report-title">Sales Report</h3>
            <div className="report-tools">
              <div className="report-filters">
                <div className="report-input">
                  <input type="text" placeholder="Start Date - Time" />
                  <i className="fa-regular fa-calendar" />
                </div>
                <div className="report-input">
                  <input type="text" placeholder="End Date - Time" />
                  <i className="fa-regular fa-calendar" />
                </div>
              </div>
              <div className="report-actions">
                <button className="report-action" type="button">
                  <i className="fa-regular fa-file-pdf" />
                  <span>PDF</span>
                </button>
                <button className="report-action" type="button">
                  <i className="fa-solid fa-print" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>

          <div className="report-table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Items</th>
                  <th>Processed By</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {SALES_ROWS.map((row, index) => (
                  <tr key={`${row.id}-${index}`}>
                    <td>{row.id}</td>
                    <td>{row.items}</td>
                    <td>{row.processedBy}</td>
                    <td>{row.total}</td>
                    <td>{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="report-total">
            <span>TOTAL</span>
            <strong>1,581,547.5</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SalesReports;
