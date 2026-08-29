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

const DotsIcon = () => (
  <svg viewBox="0 0 4 20" fill="currentColor" width="4" height="20">
    <circle cx="2" cy="3" r="2" />
    <circle cx="2" cy="10" r="2" />
    <circle cx="2" cy="17" r="2" />
  </svg>
);

const ExportDropdownMenu = ({ show, onExportCsv, onExportPdf, activeFilterLabel }) =>
  show ? (
    <ul className="dropdown-menu show position-absolute end-0 mt-1 shadow-sm" style={{ zIndex: 1000, minWidth: "220px" }}>
      <li>
        <button className="dropdown-item" onClick={onExportCsv}>
          Export as CSV
          {activeFilterLabel && (
            <span className="ms-1 text-muted" style={{ fontSize: "11px" }}>({activeFilterLabel})</span>
          )}
        </button>
      </li>
      <li>
        <button className="dropdown-item" onClick={onExportPdf}>
          Export as PDF
          {activeFilterLabel && (
            <span className="ms-1 text-muted" style={{ fontSize: "11px" }}>({activeFilterLabel})</span>
          )}
        </button>
      </li>
    </ul>
  ) : null;

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
  const hasFilter = startDate || endDate;

  return (
    <div className="report-toolbar-container mb-3">

      {/* ── MOBILE LAYOUT (hidden on sm+) ── */}
      <div className="report-mobile-layout d-sm-none w-100">

        {/* Row 1: Title + Clear Filter */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h3 className="report-title mb-0">Sales Report</h3>
          {hasFilter && (
            <button
              type="button"
              className="btn report-mobile-action-btn report-clear-btn"
              onClick={onClear}
              disabled={salesLoading}
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Row 2: From date + To date + Search + dots — all in one row */}
        <div className="d-flex align-items-end gap-1">
          <div className="flex-1-mobile">
            <span className="report-date-label">From:</span>
            <div className="report-date-wrap">
              <input
                type="date"
                className="report-date-input"
                value={startDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
              <CalendarIcon />
            </div>
          </div>

          <div className="flex-1-mobile">
            <span className="report-date-label">To:</span>
            <div className="report-date-wrap">
              <input
                type="date"
                className="report-date-input"
                value={endDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
              <CalendarIcon />
            </div>
          </div>

          <button
            type="button"
            className="btn report-mobile-action-btn report-search-btn flex-shrink-0"
            onClick={onSearch}
            disabled={salesLoading}
          >
            Search
          </button>

          <div className="position-relative flex-shrink-0">
            <button
              type="button"
              className="btn report-dots-btn"
              onClick={onToggleExportDropdown}
              aria-label="Export options"
            >
              <DotsIcon />
            </button>
            <ExportDropdownMenu
              show={showExportDropdown}
              onExportCsv={onExportCsv}
              onExportPdf={onExportPdf}
              activeFilterLabel={activeFilterLabel}
            />
          </div>
        </div>

        {dateError && (
          <p className="mb-0 mt-1 text-danger" style={{ fontSize: "12px" }}>{dateError}</p>
        )}
      </div>

      {/* ── DESKTOP LAYOUT (hidden on mobile) ── */}
      <h3 className="report-title mb-0 d-none d-sm-block">Sales Report</h3>

      <div className="report-controls-wrap d-none d-sm-flex">
        <div className="report-dates-group">
          <div>
            <span className="report-date-label">From:</span>
            <div className="report-date-wrap">
              <input
                type="date"
                className="report-date-input"
                value={startDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
              <CalendarIcon />
            </div>
          </div>

          <div>
            <span className="report-date-label">To:</span>
            <div className="report-date-wrap">
              <input
                type="date"
                className="report-date-input"
                value={endDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
              <CalendarIcon />
            </div>
          </div>
        </div>

        <div className="report-actions-group">
          <button
            type="button"
            className="search-button btn"
            onClick={onSearch}
            disabled={salesLoading}
          >
            Search
          </button>

          {hasFilter && (
            <button
              type="button"
              className="btn btn-clear-filter"
              onClick={onClear}
              disabled={salesLoading}
            >
              Clear
            </button>
          )}

          <div className="position-relative">
            <button
              type="button"
              className="btn export-button dropdown-toggle"
              onClick={onToggleExportDropdown}
            >
              Export
            </button>
            <ExportDropdownMenu
              show={showExportDropdown}
              onExportCsv={onExportCsv}
              onExportPdf={onExportPdf}
              activeFilterLabel={activeFilterLabel}
            />
          </div>
        </div>
      </div>

      {dateError && (
        <p className="mb-0 text-danger d-none d-sm-block" style={{ fontSize: "12px" }}>{dateError}</p>
      )}
    </div>
  );
}

export default SalesReportToolbar;

