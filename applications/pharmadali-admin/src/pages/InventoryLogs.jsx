import { useNavigate } from "react-router-dom";
import "../assets/css/inventory.css";
import Modal from "../shared/components/Modal";
import { useInventoryLogs } from "../hooks/useInventoryLogs";
import { TableSkeleton } from "../shared/components/loading";
import SearchBar from "../shared/components/SearchBar";
import SelectDropdown from "../shared/components/SelectDropdown";
import Pagination from "../shared/components/Pagination";
import Breadcrumb from "../shared/components/Breadcrumb";

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
    <section className="inventory-page" aria-label="Inventory Logs Audit Trail">
      <Breadcrumb
        crumbs={[
          { label: "Inventory", to: "/inventory" },
          { label: "Inventory logs" },
        ]}
      />

      <div className="inventory-filter-bar inventory-logs-filter-bar">
        <SearchBar
          id="logs-search"
          label="Search by Product name"
          value={query}
          onChange={(val) => setQuery(val)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              loadData();
            }
          }}
          placeholder="Search by Product name"
        />

        <SelectDropdown
          id="logs-action"
          label="Action"
          value={actionFilter}
          onChange={(val) => handleActionChange(val)}
          options={ACTION_FILTERS}
        />

        <SelectDropdown
          id="logs-user"
          label="User"
          value="All Users"
          onChange={() => {}}
          options={["All Users"]}
        />

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
              max={new Date().toISOString().split('T')[0]}
              onChange={(event) => setDateRange(event.target.value)}
              aria-label="Date range filter"
            />
          </div>
        </div>

        <div className="inventory-field inventory-search-action">
          <button type="button" className="btn inventory-search-btn" onClick={loadData}>
            Search
          </button>
        </div>
      </div>

      <article className="admin-card">
        <div className="inventory-table-actions">
          <h6 className="inventory-side-title mb-0">Inventory Logs</h6>
        </div>

        <div className="inventory-table-scroll">
          <table className="admin-table">
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
                <TableSkeleton rows={6} columns={6} showAvatar={false} />
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={logs.length}
            itemsPerPage={10}
            onPageChange={handlePageChange}
            visiblePageNumbers={visiblePageNumbers}
            ariaLabel="Inventory logs table pagination"
          />
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
                    {selectedLog.sellingPrice ? `PHP ${selectedLog.sellingPrice.toFixed(2)}` : "—"}
                  </p>
                </div>
              </div>
            </div>

            {selectedLog.reason && (
              <div className="inventory-modal-section">
                <h6 className="inventory-modal-section-title">Reason / Context</h6>
                <div style={{ background: "var(--pd-bg-sidebar)", padding: "10px 14px", borderRadius: "6px", borderLeft: "4px solid var(--pd-text-light)" }}>
                  <p className="inventory-log-detail-value mb-0" style={{ fontStyle: "italic", color: "var(--pd-text-medium)" }}>
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
