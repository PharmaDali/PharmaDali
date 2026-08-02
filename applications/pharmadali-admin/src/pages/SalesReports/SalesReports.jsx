import { useState } from "react";
import { exportSalesCsv, exportSalesPdf } from "../../services/salesReportService";
import { useSalesReports } from "./hooks/useSalesReports";
import { downloadSalesCsv, openSalesPdf } from "./salesReportsUtils";
import SalesSummaryCards from "./components/SalesSummaryCards";
import SalesReportToolbar from "./components/SalesReportToolbar";
import SalesReportTable from "./components/SalesReportTable";
import TransactionDetailModal from "./components/TransactionDetailModal";

/** Formats a yyyy-mm-dd string to a short readable label, e.g. "Aug 1, 2026". */
function formatDateLabel(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function SalesReports() {
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const {
    selectedRow, setSelectedRow, handleRowClick,
    summaryLoading, SUMMARY_CARDS,
    salesRows, salesMeta, salesLoading, salesError, totalAmount, loadSales,
    startDate, endDate, dateError,
    handleStartDateChange, handleEndDateChange,
    handleFilter, handleClearFilter,
  } = useSalesReports();

  // Build a human-readable label for the active date filter shown in the export dropdown.
  const activeFilterLabel = (() => {
    const from = formatDateLabel(startDate);
    const to = formatDateLabel(endDate);
    if (from && to) return `${from} – ${to}`;
    if (from) return `From ${from}`;
    if (to) return `Up to ${to}`;
    return null;
  })();

  const handleExportCsv = async () => {
    setShowExportDropdown(false);
    try {
      const data = await exportSalesCsv({ start_date: startDate || undefined, end_date: endDate || undefined });
      downloadSalesCsv(data);
    } catch (err) {
      alert(err?.message ?? "Failed to export CSV.");
    }
  };

  const handleExportPdf = async () => {
    setShowExportDropdown(false);
    try {
      const data = await exportSalesPdf({ start_date: startDate || undefined, end_date: endDate || undefined });
      openSalesPdf(data);
    } catch (err) {
      alert(err?.message ?? "Failed to export PDF.");
    }
  };

  const handlePageChange = (page, start, end) => {
    loadSales({ start_date: start || undefined, end_date: end || undefined, page });
  };

  return (
    <section>
      <header className="admin-page-header">
        <h4 className="fw-bold mb-1 admin-page-title">Sales &amp; Report</h4>
        <p className="admin-page-subtitle">Sales and reports related to the pharmacy.</p>
      </header>

      <SalesSummaryCards loading={summaryLoading} cards={SUMMARY_CARDS} />

      <div className="mt-4">
        <div className="card border rounded-3 shadow-sm">
          <div className="card-body">
            <SalesReportToolbar
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={handleStartDateChange}
              onEndDateChange={handleEndDateChange}
              onSearch={handleFilter}
              onClear={handleClearFilter}
              onExportCsv={handleExportCsv}
              onExportPdf={handleExportPdf}
              salesLoading={salesLoading}
              showExportDropdown={showExportDropdown}
              onToggleExportDropdown={() => setShowExportDropdown((v) => !v)}
              dateError={dateError}
              activeFilterLabel={activeFilterLabel}
            />

            <SalesReportTable
              rows={salesRows}
              meta={salesMeta}
              loading={salesLoading}
              error={salesError}
              totalAmount={totalAmount}
              selectedRow={selectedRow}
              onRowClick={handleRowClick}
              onPageChange={handlePageChange}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
        </div>
      </div>

      <TransactionDetailModal row={selectedRow} onClose={() => setSelectedRow(null)} />
    </section>
  );
}

export default SalesReports;
