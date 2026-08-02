/**
 * SalesReportToolbar
 *
 * Renders the top toolbar of the Sales Report card:
 * - From / To date pickers (with labels, no native min restriction)
 * - Inline date validation error
 * - Search and Clear filter buttons
 * - Export dropdown (CSV / PDF) with active filter context label
 */

const CalendarIcon = () => (
  <svg className="report-date-icon" viewBox="0 0 20 20" fill="none">
    <rect x="2" y="4" width="16" height="14" rx="2" stroke="#9cb8cc" strokeWidth="1.5" />
    <path d="M2 8h16" stroke="#9cb8cc" strokeWidth="1.5" />
    <path d="M6 2v3M14 2v3" stroke="#9cb8cc" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

function SalesReportToolbar({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onSearch,
  onClear,
  onExportCsv,
  onExportPdf,
  salesLoading,
  showExportDropdown,
  onToggleExportDropdown,
  dateError,
  activeFilterLabel,
}) {
  return (
    <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-3">
      <h3 className="mb-0 fw-semibold" style={{ fontSize: "16px", color: "#48AAD9" }}>
        Sales Report
      </h3>

      <div className="d-flex flex-column align-items-end gap-2">
        <div className="d-flex flex-wrap align-items-end gap-2">

          {/* From date */}
          <div className="d-flex flex-column gap-1">
            <label className="fw-medium" style={{ fontSize: "11px", color: "#888", marginBottom: 0 }}>
              From
            </label>
            <div className="report-date-wrap">
              <input
                type="date"
                className="report-date-input"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
              <CalendarIcon />
            </div>
          </div>

          {/* To date — no native min so users can freely select historical dates */}
          <div className="d-flex flex-column gap-1">
            <label className="fw-medium" style={{ fontSize: "11px", color: "#888", marginBottom: 0 }}>
              To
            </label>
            <div className="report-date-wrap">
              <input
                type="date"
                className="report-date-input"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
              <CalendarIcon />
            </div>
          </div>

          <button
            type="button"
            className="search-button btn btn-sm rounded-pill px-3"
            onClick={onSearch}
            disabled={salesLoading}
          >
            Search
          </button>

          {(startDate || endDate) && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
              onClick={onClear}
              disabled={salesLoading}
            >
              Clear
            </button>
          )}

          {/* Export dropdown */}
          <div className="position-relative">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill px-3 dropdown-toggle"
              onClick={onToggleExportDropdown}
            >
              Export
            </button>
            {showExportDropdown && (
              <ul className="dropdown-menu show position-absolute end-0 mt-1 shadow-sm" style={{ zIndex: 1000, minWidth: "220px" }}>
                <li>
                  <button className="dropdown-item" onClick={onExportCsv}>
                    Export as CSV
                    {activeFilterLabel && (
                      <span className="ms-1 text-muted" style={{ fontSize: "11px" }}>
                        ({activeFilterLabel})
                      </span>
                    )}
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={onExportPdf}>
                    Export as PDF
                    {activeFilterLabel && (
                      <span className="ms-1 text-muted" style={{ fontSize: "11px" }}>
                        ({activeFilterLabel})
                      </span>
                    )}
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>

        {/* Inline date validation error */}
        {dateError && (
          <p className="mb-0 text-danger" style={{ fontSize: "12px" }}>
            {dateError}
          </p>
        )}
      </div>
    </div>
  );
}

export default SalesReportToolbar;
