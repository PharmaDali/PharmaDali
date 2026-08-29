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
    <div className="report-toolbar-container mb-3">
      <h3 className="report-title mb-0">
        Sales Report
      </h3>

      <div className="report-controls-wrap">
        {/* Date pickers */}
        <div className="report-dates-group">
          <div className="report-date-wrap">
            <input
              type="date"
              className="report-date-input"
              value={startDate}
              placeholder="dd/mm/yyyy"
              onChange={(e) => onStartDateChange(e.target.value)}
            />
            <CalendarIcon />
          </div>

          <div className="report-date-wrap">
            <input
              type="date"
              className="report-date-input"
              value={endDate}
              placeholder="dd/mm/yyyy"
              onChange={(e) => onEndDateChange(e.target.value)}
            />
            <CalendarIcon />
          </div>
        </div>

        {/* Action buttons */}
        <div className="report-actions-group">
          <button
            type="button"
            className="search-button btn"
            onClick={onSearch}
            disabled={salesLoading}
          >
            Search
          </button>

          {(startDate || endDate) && (
            <button
              type="button"
              className="btn btn-clear-filter"
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
              className="btn export-button dropdown-toggle"
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
      </div>

      {/* Inline date validation error */}
      {dateError && (
        <p className="mb-0 text-danger" style={{ fontSize: "12px" }}>
          {dateError}
        </p>
      )}
    </div>
  );
}

export default SalesReportToolbar;
