import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/inventory.css";
import Modal from "../components/Modal";
import { fetchInventoryLogs } from "../services/inventoryService";

const ACTION_FILTERS = ["All", "Stock In", "Stock Out"];

function InventoryLogs() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [dateRange, setDateRange] = useState("");

  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    productName: "",
    barcode: "",
    search: "",
    expiryDate: "",
    quantityReceived: "",
    batches: [{ batchNumber: "", expiryDate: "", quantity: "" }],
  });

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = useCallback(async () => {
    setCurrentPage(1);
    setLoading(true);
    try {
      const logsResult = await fetchInventoryLogs({
        search: query,
        action: actionFilter !== "All" ? actionFilter : undefined,
        date_range: dateRange,
      });
      setLogs(logsResult);
    } catch (err) {
      console.error("Failed to load inventory logs", err);
    } finally {
      setLoading(false);
    }
  }, [query, actionFilter, dateRange]);

  const handleActionChange = useCallback((val) => {
    setActionFilter(val);
  }, []);

  useEffect(() => {
    loadData();
  }, [actionFilter, dateRange]);

  const filteredLogs = logs;

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));

  const paginatedLogs = useMemo(
    () => filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredLogs, currentPage],
  );

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const endPage = Math.min(totalPages, startPage + 4);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const handleRowClick = (log) => {
    setSelectedLog(log);
    setModalData({
      productName: log.productName,
      barcode: "",
      search: "",
      expiryDate: "",
      quantityReceived: "",
      batches: [{ batchNumber: "", expiryDate: "", quantity: "" }],
    });
    setShowModal(true);
  };

  const handleModalClose = () => {
    setSelectedLog(null);
    setShowModal(false);
  };

  const handleAddBatch = () => {
    setModalData((prev) => ({
      ...prev,
      batches: [...prev.batches, { batchNumber: "", expiryDate: "", quantity: "" }],
    }));
  };

  const handleRemoveBatch = (index) => {
    setModalData((prev) => ({
      ...prev,
      batches: prev.batches.filter((_, i) => i !== index),
    }));
  };

  const handleBatchChange = (index, field, value) => {
    setModalData((prev) => ({
      ...prev,
      batches: prev.batches.map((batch, i) =>
        i === index ? { ...batch, [field]: value } : batch,
      ),
    }));
  };

  const handleModalFieldChange = (field, value) => {
    setModalData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
            <i className="fa-regular fa-calendar" aria-hidden="true" />
            <input
              id="logs-date"
              type="date"
              className="form-control inventory-input"
              value={dateRange}
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
              ) : filteredLogs.length === 0 ? (
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
                  const isStockIn = log.action?.toLowerCase().replace(/\s+/g, "") === "stockin";
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
                        <span className={isStockIn ? "inventory-qty-in" : "inventory-qty-out"}>
                          {isStockIn ? `+ ${log.quantity}` : `− ${log.quantity}`}
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

        {!loading && filteredLogs.length > 0 && (
          <div className="inventory-pagination-bar">
            <span className="inventory-pagination-info">
              Showing {(currentPage - 1) * itemsPerPage + 1}–
              {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length}
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
          title={selectedLog.action === "Stock IN" ? "Stock In" : "Stock Out"}
          size="md"
          className="inventory-modal"
        >
          {selectedLog.action === "Stock IN" ? (
            <div className="inventory-modal-body-content">
              <p className="inventory-modal-subtitle mb-3">
                Record newly received medicine stocks into the inventory system.
              </p>

              <div className="inventory-modal-search mb-4">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                <input
                  type="text"
                  className="form-control inventory-modal-search-input"
                  placeholder="Search by generic name or product name"
                  value={modalData.search}
                  onChange={(e) => handleModalFieldChange("search", e.target.value)}
                />
              </div>

              <div className="inventory-modal-grid mb-4">
                <div>
                  <label className="inventory-modal-label">Product Name</label>
                  <input
                    type="text"
                    className="form-control inventory-modal-input"
                    value={modalData.productName}
                    disabled
                  />
                </div>
                <div>
                  <label className="inventory-modal-label">Barcode</label>
                  <input
                    type="text"
                    className="form-control inventory-modal-input"
                    placeholder="899999123123"
                    value={modalData.barcode}
                    onChange={(e) => handleModalFieldChange("barcode", e.target.value)}
                  />
                </div>
              </div>

              <div className="inventory-modal-section">
                <h6 className="inventory-modal-section-title">Batches</h6>

                {modalData.batches.map((batch, index) => (
                  <div key={index} className="inventory-batch-card">
                    <div className="inventory-batch-header">
                      <span>Batch #{index + 1}</span>
                      {modalData.batches.length > 1 && (
                        <button
                          type="button"
                          className="btn inventory-batch-delete"
                          onClick={() => handleRemoveBatch(index)}
                        >
                          <i className="fa-solid fa-trash" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                    <div className="inventory-batch-grid">
                      <div>
                        <label className="inventory-modal-label">Batch number</label>
                        <input
                          type="text"
                          className="form-control inventory-modal-input"
                          placeholder="Enter batch number"
                          value={batch.batchNumber}
                          onChange={(e) =>
                            handleBatchChange(index, "batchNumber", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="inventory-modal-label">Expiry Date</label>
                        <input
                          type="text"
                          className="form-control inventory-modal-input"
                          placeholder="MM/DD/YYYY"
                          value={batch.expiryDate}
                          onChange={(e) =>
                            handleBatchChange(index, "expiryDate", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="inventory-modal-label">Quantity</label>
                        <input
                          type="text"
                          className="form-control inventory-modal-input"
                          placeholder="Enter quantity"
                          value={batch.quantity}
                          onChange={(e) => handleBatchChange(index, "quantity", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="btn inventory-add-batch-btn"
                  onClick={handleAddBatch}
                >
                  + Add new batch
                </button>
              </div>

              <div className="inventory-modal-footer">
                <button type="button" className="btn inventory-modal-btn-outline" onClick={handleModalClose}>
                  Cancel
                </button>
                <button type="button" className="btn inventory-modal-btn-primary">
                  Record stock in
                </button>
              </div>
            </div>
          ) : (
            <div className="inventory-modal-body-content">
              <p className="inventory-modal-subtitle mb-3">
                Remove or pull out products from the inventory system.
              </p>

              <div className="inventory-modal-search mb-4">
                <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
                <input
                  type="text"
                  className="form-control inventory-modal-search-input"
                  placeholder="Search by generic name or product name"
                  value={modalData.search}
                  onChange={(e) => handleModalFieldChange("search", e.target.value)}
                />
              </div>

              <div className="inventory-modal-grid mb-4">
                <div>
                  <label className="inventory-modal-label">Barcode</label>
                  <input
                    type="text"
                    className="form-control inventory-modal-input"
                    placeholder="Tuseran"
                    value={modalData.barcode}
                    onChange={(e) => handleModalFieldChange("barcode", e.target.value)}
                  />
                </div>
              </div>

              <div className="inventory-modal-grid mb-4">
                <div>
                  <label className="inventory-modal-label">Expiry Date</label>
                  <input
                    type="text"
                    className="form-control inventory-modal-input"
                    placeholder="Expiry Date"
                    value={modalData.expiryDate}
                    onChange={(e) => handleModalFieldChange("expiryDate", e.target.value)}
                  />
                </div>
                <div>
                  <label className="inventory-modal-label">Quantity Received</label>
                  <input
                    type="text"
                    className="form-control inventory-modal-input"
                    placeholder="24"
                    value={modalData.quantityReceived}
                    onChange={(e) => handleModalFieldChange("quantityReceived", e.target.value)}
                  />
                </div>
              </div>

              <div className="inventory-modal-footer">
                <button type="button" className="btn inventory-modal-btn-outline" onClick={handleModalClose}>
                  Cancel
                </button>
                <button type="button" className="btn inventory-modal-btn-primary">
                  Commit stock out
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </section>
  );
}

export default InventoryLogs;
