import React from "react";
import { TableSkeleton } from "../../../components/loading";

function SalesReportTable({
  rows,
  meta,
  loading,
  error,
  totalAmount,
  selectedRow,
  onRowClick,
  onPageChange,
  startDate,
  endDate,
}) {
  return (
    <>
      {/* Table */}
      <div className="table-responsive rounded-3 border">
        <table className="table table-hover mb-0" style={{ fontSize: "13px" }}>
          <thead className="report-thead">
            <tr>
              <th>Order ID</th>
              <th>Items</th>
              <th>Processed By</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={5} columns={6} showAvatar={false} />
            ) : error ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-danger">{error}</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr style={{ cursor: "default" }}>
                <td colSpan={6} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center justify-content-center py-4">
                    <i className="fa-solid fa-file-invoice-dollar mb-3" style={{ fontSize: "3.5rem", color: "#94a3b8" }} />
                    <span className="fw-medium" style={{ fontSize: "15px", color: "#64748b" }}>No sales transactions found.</span>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={`${row.id}-${index}`}
                  onClick={() => onRowClick(row, index)}
                  className={selectedRow?.id === row.id && selectedRow?.rowIndex === index ? "table-active" : ""}
                  style={{ cursor: "pointer" }}
                >
                  <td>{row.id}</td>
                  <td>{row.items}</td>
                  <td>{row.processedBy}</td>
                  <td>PHP {parseFloat(row.total).toFixed(2)}</td>
                  <td>
                    {row.has_exchange || row.status === 'exchanged' ? (
                      <span className="badge text-white shadow-sm" style={{ backgroundColor: "#2aabe2" }}>
                        <i className="fa-solid fa-right-left me-1"></i> Exchanged
                      </span>
                    ) : (
                      <span className="badge bg-success shadow-sm">
                        Completed
                      </span>
                    )}
                  </td>
                  <td>{row.date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Running total */}
      {!loading && rows.length > 0 && (
        <div className="d-flex justify-content-end gap-3 pt-3 fw-bold" style={{ color: "#48AAD9", fontSize: "14px" }}>
          <span>TOTAL</span>
          <span>{totalAmount.toFixed(2)}</span>
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="d-flex justify-content-between align-items-center pt-3" style={{ fontSize: "12px" }}>
          <span className="text-secondary">
            Page {meta.current_page} of {meta.last_page} &middot; {meta.total} records
          </span>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={meta.current_page <= 1 || loading}
              onClick={() => onPageChange(meta.current_page - 1, startDate, endDate)}
            >
              &lsaquo; Prev
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={meta.current_page >= meta.last_page || loading}
              onClick={() => onPageChange(meta.current_page + 1, startDate, endDate)}
            >
              Next &rsaquo;
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default SalesReportTable;
