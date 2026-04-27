
const REVENUE_CARDS = [
  { label: "Daily Revenue", amount: "20,003" },
  { label: "Weekly Revenue", amount: "20,003" },
  { label: "Monthly Revenue", amount: "20,003" },
];

function SalesReports() {
  return (
    <section>
      <header className="admin-page-header">
        <h4 className="fw-bold mb-1 admin-page-title">Sales &amp; Reports</h4>
        <p className="admin-page-subtitle">Sales and reports for pharmacy operations.</p>
      </header>

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
            <div className="bg-white rounded-3 p-4 data-card data-card-maximized" />
          </div>

          <div className="col-lg-5">
            <div className="bg-white rounded-3 p-3 data-card data-card-maximized" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default SalesReports;
