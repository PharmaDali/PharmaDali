import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { exportSalesCsv, exportSalesPdf } from "../services/salesReportService";
import { useSalesReports } from "../hooks/useSalesReports";
import { downloadSalesCsv, openSalesPdf } from "../utils/salesReportsUtils";
import SalesSummaryCards from "../components/SalesReports/SalesSummaryCards";
import SalesReportToolbar from "../components/SalesReports/SalesReportToolbar";
import SalesReportTable from "../components/SalesReports/SalesReportTable";
import TransactionDetailModal from "../components/SalesReports/TransactionDetailModal";
import ItemExchangeModal from "../components/SalesReports/ItemExchangeModal";
import ExchangeReceiptModal from "../components/SalesReports/ExchangeReceiptModal";

/** Formats a yyyy-mm-dd string to a short readable label, e.g. "Aug 1, 2026". */
function formatDateLabel(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function SalesReports() {
  const context = useOutletContext() || {};
  const user = context.user;
  const isPharmacist = user?.role === "pharmacist";

  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [exchangeOrder, setExchangeOrder] = useState(null);
  const [completedExchange, setCompletedExchange] = useState(null);

  const {
    selectedRow, setSelectedRow, handleRowClick,
    summaryLoading, SUMMARY_CARDS,
    salesRows, salesMeta, salesLoading, salesError, totalAmount, loadSales,
    startDate, endDate, dateError,
    handleStartDateChange, handleEndDateChange,
    handleFilter, handleClearFilter,
  } = useSalesReports();

  const handleOpenExchange = (row) => {
    const orderObj = {
      id: row.order_id || row.id,
      order_number: row.orderNumber || row.order_number || row.id,
    };
    setSelectedRow(null);
    setExchangeOrder(orderObj);
  };

  const handleExchangeSuccess = (exchangeData) => {
    setExchangeOrder(null);
    setCompletedExchange(exchangeData);
    // Reload sales report table
    loadSales({ start_date: startDate || undefined, end_date: endDate || undefined, page: salesMeta?.currentPage || 1 });
  };

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
        <h4 className="fw-bold mb-1 admin-page-title">
          {isPharmacist ? "Transaction History" : "Sales & Report"}
        </h4>
        <p className="admin-page-subtitle">
          {isPharmacist ? "Sales transaction history processed by you." : "Sales and reports related to the pharmacy."}
        </p>
      </header>

      {!isPharmacist && (
        <SalesSummaryCards loading={summaryLoading} cards={SUMMARY_CARDS} />
      )}

      <div className="mt-4">
        <div className="admin-card p-0 overflow-hidden">
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

      <TransactionDetailModal
        row={selectedRow}
        onClose={() => setSelectedRow(null)}
        onOpenExchange={handleOpenExchange}
      />

      {exchangeOrder && (
        <ItemExchangeModal
          order={exchangeOrder}
          onClose={() => setExchangeOrder(null)}
          onSuccess={handleExchangeSuccess}
        />
      )}

      {completedExchange && (
        <ExchangeReceiptModal
          exchangeData={completedExchange}
          onClose={() => setCompletedExchange(null)}
        />
      )}
    </section>
  );
}

export default SalesReports;
