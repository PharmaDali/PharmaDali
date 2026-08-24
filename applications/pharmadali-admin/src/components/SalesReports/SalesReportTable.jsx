import React from "react";
import { TableSkeleton } from "../../shared/components/loading";

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
      <div className="table-responsive rounded-3 border-0">
        <table className="table sales-report-table align-middle mb-0">
          <thead className="report-thead">
            <tr>
              <th>Order ID</th>
              <th>Channel</th>
              <th>Items</th>
              <th>Processed By</th>
              <th>Unit Price</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={5} columns={8} showAvatar={false} />
            ) : error ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-danger">{error}</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr style={{ cursor: "default" }}>
                <td colSpan={8} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center justify-content-center py-4">
                    <i className="fa-solid fa-file-invoice-dollar mb-3" style={{ fontSize: "3.5rem", color: "#94a3b8" }} />
                    <span className="fw-medium" style={{ fontSize: "15px", color: "#64748b" }}>No sales transactions found.</span>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const totalNum = parseFloat(row.total ?? 0);
                const itemsNum = parseInt(row.items ?? 0, 10) || 1;
                const unitPrice = row.unitPrice != null ? parseFloat(row.unitPrice) : (totalNum / itemsNum);
                const channel = row.channel || (row.order_type === 'online' || row.order_type === 'delivery' || String(row.id).startsWith('ORD-') ? 'Online Order' : 'Walk-in');

                return (
                  <tr
                    key={`${row.id}-${index}`}
                    onClick={() => onRowClick(row, index)}
                    className={selectedRow?.id === row.id && selectedRow?.rowIndex === index ? "table-active" : ""}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="fw-medium text-dark">{row.id}</td>
                    <td>{channel}</td>
                    <td>{row.items}</td>
                    <td className="fw-medium">{row.processedBy}</td>
                    <td>PHP {unitPrice.toFixed(2)}</td>
                    <td className="fw-medium">PHP {totalNum.toFixed(2)}</td>
                    <td>
                      {row.has_exchange || row.status === 'exchanged' ? (
                        <span className="badge badge-status badge-exchanged">
                          <i className="fa-solid fa-right-left me-1"></i> Exchanged
                        </span>
                      ) : (
                        <span className="badge badge-status badge-completed">
                          Completed
                        </span>
                      )}
                    </td>
                    <td className="text-muted">{row.date}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Running total */}
      {!loading && rows.length > 0 && (
        <div className="report-table-total-container">
          <span className="report-total-label">TOTAL</span>
          <span className="report-total-amount">
            {totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
          </span>
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
