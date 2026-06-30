import { useState, useEffect, useCallback } from "react";
import pdfIcon from "../assets/icons/sale-and-reports/pdf-icon.svg";
import printIcon from "../assets/icons/sale-and-reports/print.svg";
import { fetchSalesSummary, fetchSalesList } from "../services/salesReportService";

function SalesReports() {
  const [selectedRow, setSelectedRow] = useState(null);

  // Summary data
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Sales list data
  const [salesRows, setSalesRows] = useState([]);
  const [salesMeta, setSalesMeta] = useState(null);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState(null);

  // Filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Load summary cards
  useEffect(() => {
    setSummaryLoading(true);
    fetchSalesSummary()
      .then((data) => setSummary(data))
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, []);

  // Load sales list
  const loadSales = useCallback((filters = {}) => {
    setSalesLoading(true);
    setSalesError(null);
    fetchSalesList(filters)
      .then((data) => {
        setSalesRows(data.data ?? []);
        setSalesMeta(data.meta ?? null);
      })
      .catch((err) => setSalesError(err?.message ?? "Failed to load sales."))
      .finally(() => setSalesLoading(false));
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleFilter = () => {
    const filters = {};
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;
    loadSales(filters);
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    loadSales();
  };

  const handleRowClick = (row, index) => {
    setSelectedRow({ ...row, rowIndex: index });
  };

  const totalAmount = salesRows.reduce((sum, row) => sum + parseFloat(row.total ?? 0), 0);

  const SUMMARY_CARDS = summary
    ? [
      { label: "Daily Sales", amount: Number(summary.daily_sales).toLocaleString("en-PH", { minimumFractionDigits: 2 }), currency: "PHP" },
      { label: "Weekly Sales", amount: Number(summary.weekly_sales).toLocaleString("en-PH", { minimumFractionDigits: 2 }), currency: "PHP" },
      { label: "Monthly Sales", amount: Number(summary.monthly_sales).toLocaleString("en-PH", { minimumFractionDigits: 2 }), currency: "PHP" },
      { label: "Total Transactions", amount: summary.total_transactions?.toLocaleString() },
    ]
    : [];

  return (
    <section>
      <header className="admin-page-header">
        <h4 className="fw-bold mb-1 admin-page-title">Sales &amp; Report</h4>
        <p className="admin-page-subtitle">Sales and reports related to the pharmacy.</p>
      </header>

      {/* ── Summary Cards ── */}
      <div className="mt-4">
        <h2 className="fw-semibold section-title">Sales Summary</h2>
        <div className="d-flex flex-wrap gap-3">
          {summaryLoading ? (
            <div className="d-flex align-items-center gap-2 text-secondary py-3">
              <div className="spinner-border spinner-border-sm" role="status" style={{ color: "#48AAD9" }} />
              <span>Loading summary...</span>
            </div>
          ) : SUMMARY_CARDS.map((card) => (
            <div key={card.label} className="summary-card">
              <div className="fw-medium" style={{ fontSize: "12px", color: "#444" }}>{card.label}</div>
              <div className="d-flex align-items-baseline gap-2">
                {card.currency && <span style={{ fontSize: "12px", color: "#444" }}>{card.currency}</span>}
                <span className="summary-amount">{card.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Report Card ── */}
      <div className="mt-4">
        <div className="card border rounded-3 shadow-sm">
          <div className="card-body">

            {/* Header row */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
              <h3 className="mb-0 fw-semibold" style={{ fontSize: "16px", color: "#48AAD9" }}>Sales Report</h3>

              <div className="d-flex flex-wrap align-items-center gap-2">
                {/* Date filters */}
                <div className="report-date-wrap">
                  <input
                    type="date"
                    className="report-date-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <svg className="report-date-icon" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="4" width="16" height="14" rx="2" stroke="#9cb8cc" strokeWidth="1.5" />
                    <path d="M2 8h16" stroke="#9cb8cc" strokeWidth="1.5" />
                    <path d="M6 2v3M14 2v3" stroke="#9cb8cc" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>

                <div className="report-date-wrap">
                  <input
                    type="date"
                    className="report-date-input"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || undefined}
                  />
                  <svg className="report-date-icon" viewBox="0 0 20 20" fill="none">
                    <rect x="2" y="4" width="16" height="14" rx="2" stroke="#9cb8cc" strokeWidth="1.5" />
                    <path d="M2 8h16" stroke="#9cb8cc" strokeWidth="1.5" />
                    <path d="M6 2v3M14 2v3" stroke="#9cb8cc" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>

                <button
                  type="button"
                  className="search-button btn btn-sm rounded-pill px-3"
                  onClick={handleFilter}
                  disabled={salesLoading}
                >
                  Search
                </button>

                {(startDate || endDate) && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                    onClick={handleClearFilter}
                    disabled={salesLoading}
                  >
                    Clear
                  </button>
                )}

                {/* Export actions */}
                <div className="d-flex gap-2 ms-1">
                  <button className="btn btn-link btn-sm d-flex align-items-center gap-1 text-decoration-none p-0" type="button" style={{ color: "#48AAD9" }}>
                    <img src={pdfIcon} alt="pdf" style={{ width: 18, height: 18 }} />
                    <span style={{ fontSize: "12px" }}>PDF</span>
                  </button>
                  <button className="btn btn-link btn-sm d-flex align-items-center gap-1 text-decoration-none p-0" type="button" style={{ color: "#48AAD9" }}>
                    <img src={printIcon} alt="print" style={{ width: 18, height: 18 }} />
                    <span style={{ fontSize: "12px" }}>Print</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive rounded-3 border">
              <table className="table table-hover mb-0" style={{ fontSize: "13px" }}>
                <thead className="report-thead">
                  <tr>
                    <th>Order ID</th>
                    <th>Items</th>
                    <th>Processed By</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {salesLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-secondary">
                        <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: "#48AAD9" }} />
                        Loading sales...
                      </td>
                    </tr>
                  ) : salesError ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-danger">{salesError}</td>
                    </tr>
                  ) : salesRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-secondary">No transactions found.</td>
                    </tr>
                  ) : (
                    salesRows.map((row, index) => (
                      <tr
                        key={`${row.id}-${index}`}
                        onClick={() => handleRowClick(row, index)}
                        className={selectedRow?.id === row.id && selectedRow?.rowIndex === index ? "table-active" : ""}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{row.id}</td>
                        <td>{row.items}</td>
                        <td>{row.processedBy}</td>
                        <td>{parseFloat(row.total).toFixed(2)}</td>
                        <td>{row.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Total */}
            {!salesLoading && salesRows.length > 0 && (
              <div className="d-flex justify-content-end gap-3 pt-3 fw-bold" style={{ color: "#48AAD9", fontSize: "14px" }}>
                <span>TOTAL</span>
                <span>{totalAmount.toFixed(2)}</span>
              </div>
            )}

            {/* Pagination */}
            {salesMeta && salesMeta.last_page > 1 && (
              <div className="d-flex justify-content-between align-items-center pt-3" style={{ fontSize: "12px" }}>
                <span className="text-secondary">
                  Page {salesMeta.current_page} of {salesMeta.last_page} &middot; {salesMeta.total} records
                </span>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={salesMeta.current_page <= 1 || salesLoading}
                    onClick={() => loadSales({ start_date: startDate || undefined, end_date: endDate || undefined, page: salesMeta.current_page - 1 })}
                  >
                    &lsaquo; Prev
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    disabled={salesMeta.current_page >= salesMeta.last_page || salesLoading}
                    onClick={() => loadSales({ start_date: startDate || undefined, end_date: endDate || undefined, page: salesMeta.current_page + 1 })}
                  >
                    Next &rsaquo;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Transaction Detail Modal ── */}
      {selectedRow && (
        <div
          className="modal d-flex align-items-center justify-content-center"
          style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 1050 }}
          onClick={() => setSelectedRow(null)}
        >
          <div
            className="bg-white rounded-3 p-4 position-relative overflow-auto"
            style={{ maxWidth: 800, width: "90%", maxHeight: "80vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="btn-close position-absolute top-0 end-0 m-3"
              onClick={() => setSelectedRow(null)}
            />

            <h2 className="fw-semibold mb-3" style={{ color: "#48AAD9", fontSize: "22px" }}>Transaction Details</h2>
            <hr />

            <div className="d-flex justify-content-between mb-3">
              <span className="text-secondary" style={{ fontSize: "13px" }}>Order ID</span>
              <span className="fw-semibold">{selectedRow.id}</span>
            </div>

            {/* Items grid header */}
            <div className="report-modal-grid fw-semibold text-secondary mb-2" style={{ fontSize: "13px" }}>
              <span>Items</span><span>Qty</span><span>Price</span><span>Subtotal</span>
            </div>
            {selectedRow.orderItems?.map((item, idx) => (
              <div key={idx} className="report-modal-grid py-2 border-bottom" style={{ fontSize: "13px" }}>
                <span>{item.name}</span>
                <span>{item.qty}</span>
                <span>{parseFloat(item.price).toFixed(2)}</span>
                <span>{parseFloat(item.subtotal).toFixed(2)}</span>
              </div>
            ))}

            <hr />
            <div className="d-flex justify-content-between fw-bold mb-3" style={{ fontSize: "15px" }}>
              <span>TOTAL</span>
              <span>{parseFloat(selectedRow.total).toFixed(2)}</span>
            </div>
            <hr />

            <div className="d-flex justify-content-between mb-2">
              <span className="text-secondary" style={{ fontSize: "13px" }}>Processed By</span>
              <span className="fw-medium" style={{ fontSize: "14px" }}>{selectedRow.processedBy}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="text-secondary" style={{ fontSize: "13px" }}>Date</span>
              <span className="fw-medium" style={{ fontSize: "14px" }}>{selectedRow.date}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default SalesReports;
