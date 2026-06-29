import { useNavigate } from "react-router-dom";
import "../assets/css/inventory.css";
import Modal from "../components/Modal";
import { useInventoryLogs } from "./inventory/hooks/useInventoryLogs";

const ACTION_FILTERS = ["All", "Stock In", "Stock Out", "Adjustment", "Waste"];

function InventoryLogs() {
  const navigate = useNavigate();
  const {
    query,
    setQuery,
    actionFilter,
    handleActionChange,
    dateRange,
    setDateRange,
    selectedLog,
    showModal,
    logs,
    loading,
    currentPage,
    totalPages,
    paginatedLogs,
    visiblePageNumbers,
    loadData,
    handlePageChange,
    handleRowClick,
    handleModalClose,
  } = useInventoryLogs();

  return (
    <section className="inventory-page">
      <div className="inventory-breadcrumbs mb-3">
        <button
          type="button"
          className="breadcrumb-link"
          onClick={() => navigate("/inventory")}
        >
          Inventory
        </button>
        <span className="breadcrumb-separator">&rsaquo;</span>
        <span className="breadcrumb-current">Inventory logs</span>
      </div>



      <div className="inventory-filter-bar inventory-logs-filter-bar">
        <div className="inventory-field inventory-search-field">
          <label className="inventory-field-label" htmlFor="logs-search">
            Search by Product name
          </label>
          <div className="inventory-input-wrap">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              id="logs-search"
              className="form-control inventory-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  loadData();
                }
              }}
              placeholder="Search by Product name"
              aria-label="Search inventory logs"
            />
          </div>
        </div>

        <div className="inventory-field">
          <label className="inventory-field-label" htmlFor="logs-action">
            Action
          </label>
          <select
            id="logs-action"
            className="form-select inventory-select"
            value={actionFilter}
            onChange={(event) => handleActionChange(event.target.value)}
          >
            {ACTION_FILTERS.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>

        <div className="inventory-field">
          <label className="inventory-field-label" htmlFor="logs-date">
            Date Range
          </label>
          <div className="inventory-input-wrap">
            <input
              id="logs-date"
              type="date"
              className="form-control inventory-input"
              style={{ paddingLeft: "14px" }}
              value={dateRange}
              max={`${new Date().getFullYear()}-12-31`}
              onChange={(event) => setDateRange(event.target.value)}
              aria-label="Date range filter"
            />
          </div>
        </div>

        <div className="inventory-field">
          <label className="inventory-field-label" htmlFor="logs-user">
            User
          </label>
          <select
            id="logs-user"
            className="form-select inventory-select"
          >
            <option>All Users</option>
          </select>
        </div>

        <div className="inventory-field inventory-search-action">
          <button type="button" className="btn inventory-search-btn" onClick={loadData}>
            Search
          </button>
        </div>
      </div>

      <article className="inventory-table-card">
        <div className="inventory-table-actions">
          <h6 className="inventory-side-title mb-0">Inventory Logs</h6>
        </div>

        <div className="inventory-table-scroll">
          <table className="table inventory-table mb-0">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Batch Number</th>
                <th>Quantity</th>
                <th>Date &amp; Time</th>
                <th>Status</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="inventory-empty-state">
                      <div className="spinner-border text-primary mb-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mb-0">Loading inventory logs...</p>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="inventory-empty-state">
                      <i className="fa-regular fa-folder-open mb-2" aria-hidden="true" />
                      <p className="mb-0">No inventory logs match your filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const isPositive = log.action === "Stock In" || log.action === "Adjustment";
                  return (
                    <tr
                      key={log.id}
                      onClick={() => handleRowClick(log)}
                      className={selectedLog?.id === log.id ? "inventory-row-selected" : ""}
                    >
                      <td>
                        <p className="inventory-item-name mb-0">{log.productName}</p>
                      </td>
                      <td>{log.batchNumber ?? "—"}</td>
                      <td>
                        <span className={isPositive ? "inventory-qty-in" : "inventory-qty-out"}>
                          {isPositive ? `+ ${log.quantity}` : `− ${log.quantity}`}
                        </span>
                      </td>
                      <td>{log.dateTime}</td>
                      <td>
                        <span
                          className={`inventory-log-action-chip inventory-log-action-${log.action
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td>{log.user}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!loading && logs.length > 0 && (
          <div className="inventory-pagination-bar">
            <span className="inventory-pagination-info">
              Showing {(currentPage - 1) * 10 + 1}–
              {Math.min(currentPage * 10, logs.length)} of {logs.length}
            </span>

            <nav aria-label="Inventory logs pagination">
              <ul className="inventory-pagination">
                <li className={`inventory-page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    type="button"
                    className="inventory-page-link inventory-page-nav"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                  </button>
                </li>

                {visiblePageNumbers[0] > 1 && (
                  <>
                    <li className="inventory-page-item">
                      <button
                        type="button"
                        className="inventory-page-link"
                        onClick={() => handlePageChange(1)}
                      >
                        1
                      </button>
                    </li>
                    {visiblePageNumbers[0] > 2 && (
                      <li className="inventory-page-item inventory-page-ellipsis">
                        <span>…</span>
                      </li>
                    )}
                  </>
                )}

                {visiblePageNumbers.map((pageNumber) => (
                  <li
                    key={pageNumber}
                    className={`inventory-page-item ${currentPage === pageNumber ? "active" : ""}`}
                  >
                    <button
                      type="button"
                      className="inventory-page-link"
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  </li>
                ))}

                {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages && (
                  <>
                    {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages - 1 && (
                      <li className="inventory-page-item inventory-page-ellipsis">
                        <span>…</span>
                      </li>
                    )}
                    <li className="inventory-page-item">
                      <button
                        type="button"
                        className="inventory-page-link"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </li>
                  </>
                )}

                <li className={`inventory-page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button
                    type="button"
                    className="inventory-page-link inventory-page-nav"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </article>

      {selectedLog && (
        <Modal
          isOpen={showModal}
          onClose={handleModalClose}
          title={selectedLog.action}
          size="md"
          className="inventory-modal"
          showCloseButton={true}
        >
          <div className="inventory-modal-body-content">
            <p className="inventory-modal-subtitle">
              {(selectedLog.action === "Stock In" || selectedLog.action === "Adjustment")
                ? "Transaction record for incoming/added stock."
                : "Transaction record for outgoing/reduced stock."}
            </p>

            <div className="inventory-modal-section">
              <h6 className="inventory-modal-section-title">Basic Information</h6>
              <div className="inventory-modal-grid inventory-modal-grid-3">
                <div>
                  <p className="inventory-modal-label">Product Name</p>
                  <p className="inventory-log-detail-value">{selectedLog.productName ?? "—"}</p>
                </div>
                <div>
                  <p className="inventory-modal-label">Batch Number</p>
                  <p className="inventory-log-detail-value">{selectedLog.batchNumber ?? "—"}</p>
                </div>
                <div>
                  <p className="inventory-modal-label">Expiry Date</p>
                  <p className="inventory-log-detail-value">{selectedLog.expiryDate ?? "—"}</p>
                </div>
              </div>
            </div>

            <div className="inventory-modal-section">
              <h6 className="inventory-modal-section-title">Transaction Details</h6>
              <div className="inventory-modal-grid inventory-modal-grid-3">
                <div>
                  <p className="inventory-modal-label">Quantity</p>
                  <p className="inventory-log-detail-value">{selectedLog.quantity ?? "—"}</p>
                </div>
                <div>
                  <p className="inventory-modal-label">Unit Cost</p>
                  <p className="inventory-log-detail-value">{selectedLog.unitCost ?? "—"}</p>
                </div>
                <div>
                  <p className="inventory-modal-label">Selling Price</p>
                  <p className="inventory-log-detail-value">
                    {selectedLog.sellingPrice ? `₱${selectedLog.sellingPrice.toFixed(2)}` : "—"}
                  </p>
                </div>
              </div>
            </div>

            {selectedLog.reason && (
              <div className="inventory-modal-section">
                <h6 className="inventory-modal-section-title">Reason / Context</h6>
                <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "6px", borderLeft: "4px solid #cbd5e1" }}>
                  <p className="inventory-log-detail-value mb-0" style={{ fontStyle: "italic", color: "#475569" }}>
                    {selectedLog.reason}
                  </p>
                </div>
              </div>
            )}

            <div className="inventory-modal-section">
              <h6 className="inventory-modal-section-title">
                {(selectedLog.action === "Stock In" || selectedLog.action === "Adjustment")
                  ? "System Information"
                  : "Audit/System Information"}
              </h6>
              <div className="inventory-modal-grid inventory-modal-grid-3">
                <div>
                  <p className="inventory-modal-label">Barcode</p>
                  <p className="inventory-log-detail-value">{selectedLog.barcode ?? "—"}</p>
                </div>
                <div>
                  <p className="inventory-modal-label">Date &amp; Time</p>
                  <p className="inventory-log-detail-value">{selectedLog.dateTime ?? "—"}</p>
                </div>
                <div>
                  <p className="inventory-modal-label">Recorded By</p>
                  <p className="inventory-log-detail-value">{selectedLog.user ?? "—"}</p>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

export default InventoryLogs;
