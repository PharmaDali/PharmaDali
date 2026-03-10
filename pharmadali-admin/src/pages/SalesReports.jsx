
const REVENUE_CARDS = [
  { label: "Daily Revenue", amount: "20,003" },
  { label: "Weekly Revenue", amount: "20,003" },
  { label: "Monthly Revenue", amount: "20,003" },
];

const FORECAST_DATA = [
  { units: "85 units", period: "next 7 days", confidence: "92%" },
  { units: "120 units", period: "next 7 days", confidence: "95%" },
  { units: "70 units", period: "next 7 days", confidence: "88%" },
  { units: "65 units", period: "next 7 days", confidence: "90%" },
  { units: "40 units", period: "next 7 days", confidence: "84%" },
];

const STOCKOUT_RISKS = [
  {
    risk: "High",
    color: "#ef4444",
    name: "Amoxicillin",
    units: 150,
    date: "March 7, 2026",
  },
  {
    risk: "High",
    color: "#ef4444",
    name: "Paracetamol",
    units: 100,
    date: "March 7, 2026",
  },
  {
    risk: "Medium",
    color: "#f59e0b",
    name: "Cetirizine",
    units: 80,
    date: "March 9, 2026",
  },
  {
    risk: "Medium",
    color: "#f59e0b",
    name: "Ibuprofen",
    units: 70,
    date: "March 10, 2026",
  },
  {
    risk: "Low",
    color: "#22c55e",
    name: "Salbutamol Inhaler",
    units: 30,
    date: "March 14, 2026",
  },
];

function SalesReports() {
  return (
    <div>
      <h1 className="fw-bold m-0 page-title">Sales &amp; Report</h1>
      <p className="m-0 page-subtitle">
        Sales and reports related to the pharmacy.
      </p>

      <div className="mt-4">
        <h2 className="fw-semibold section-title">Sales Summary</h2>
        <div className="d-flex gap-3 flex-wrap">
          {REVENUE_CARDS.map((card) => (
            <div key={card.label} className="revenue-card text-white">
              <div className="revenue-label fw-medium">{card.label}</div>
              <div className="d-flex align-items-baseline gap-2">
                <span className="revenue-currency">PHP</span>
                <span className="fw-bold revenue-amount">{card.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <h2 className="fw-semibold section-title">Sales Reports</h2>

        <div className="d-flex align-items-center gap-3 flex-wrap mb-4">
          <span className="fw-medium filter-label">Filter by:</span>

          <div>
            <div className="fw-medium mb-1 filter-label">Date Range</div>
            <div className="position-relative">
              <input
                type="text"
                className="filter-input bg-white"
                placeholder="Start date – End Date"
              />
              <i className="fa-regular fa-calendar filter-input-icon" />
            </div>
          </div>

          <div>
            <div className="fw-medium mb-1 filter-label">Category</div>
            <select className="filter-select bg-white">
              <option>–Select Category–</option>
            </select>
          </div>

          <div>
            <div className="fw-medium mb-1 filter-label">Product</div>
            <div className="position-relative">
              <i className="fa-solid fa-magnifying-glass filter-search-icon" />
              <input
                type="text"
                className="filter-input bg-white with-search-icon"
                placeholder="Search Product"
              />
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-lg-7">
            <div className="bg-white rounded-3 p-4 data-card">
              <table className="w-100">
                <thead>
                  <tr>
                    <th className="fw-semibold forecast-th">Medicine</th>
                    <th className="fw-semibold forecast-th"></th>
                    <th className="fw-semibold forecast-th"></th>
                    <th className="fw-semibold forecast-th">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {FORECAST_DATA.map((row, idx) => (
                    <tr key={idx}>
                      <td className="forecast-td"></td>
                      <td className="forecast-td">{row.units}</td>
                      <td className="forecast-td">({row.period})</td>
                      <td className="forecast-td">{row.confidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="bg-white rounded-3 p-3 data-card">
              <h3 className="fw-bold stockout-title">
                Stockout Risk &amp; Reorder Suggestions
              </h3>
              {STOCKOUT_RISKS.map((item, idx) => (
                <div
                  key={idx}
                  className={`d-flex justify-content-between align-items-start stockout-row${idx < STOCKOUT_RISKS.length - 1 ? " with-border" : ""}`}
                >
                  <div>
                    <div
                      className="fw-medium text-capitalize risk-label"
                      style={{ color: item.color }}
                    >
                      {item.risk} risk level
                    </div>
                    <div className="fw-semibold medicine-name">{item.name}</div>
                  </div>
                  <div className="text-end">
                    <div>
                      <span className="fw-bold units-value">{item.units}</span>{" "}
                      <span className="units-label">units</span>
                    </div>
                    <div className="date-label">{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesReports;
