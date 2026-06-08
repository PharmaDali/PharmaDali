import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/inventory.css";
import Modal from "../components/Modal";
import { fetchInventoryMetrics, fetchInventoryLogs } from "../services/inventoryService";

const ACTION_FILTERS = ["All", "Stock In", "Stock Out"];

function InventoryLogs() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [dateRange, setDateRange] = useState("");
  const [tableActionFilter, setTableActionFilter] = useState("All");
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
  const [metrics, setMetrics] = useState({
    total_products: 0,
    low_stocks: 0,
    expiring: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const activeAction = tableActionFilter !== "All" ? tableActionFilter : actionFilter;
      const [logsResult, metricsResult] = await Promise.all([
        fetchInventoryLogs({
          search: query,
          action: activeAction !== "All" ? activeAction : undefined,
          date_range: dateRange,
        }),
        fetchInventoryMetrics(),
      ]);
      setLogs(logsResult);
      setMetrics(metricsResult);
    } catch (err) {
      console.error("Failed to load inventory logs", err);
    } finally {
      setLoading(false);
    }
  }, [query, actionFilter, tableActionFilter, dateRange]);

  const handleActionChange = useCallback((val) => {
    setActionFilter(val);
    setTableActionFilter(val);
  }, []);

  useEffect(() => {
    loadData();
  }, [actionFilter, tableActionFilter, dateRange]);

  const filteredLogs = logs;

  const totalProducts = metrics.total_products || 0;
  const lowStockCount = metrics.low_stocks || 0;
  const expiringSoonCount = metrics.expiring || 0;
  const expiredCount = metrics.expired || 0;

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

      <header className="admin-page-header">
        <h4 className="fw-bold mb-1 admin-page-title">Inventory Logs</h4>
      </header>

      <div className="inventory-metrics">
        <article className="inventory-metric-card inventory-metric-total">
          <p className="inventory-metric-label mb-1">Total Products</p>
          <p className="inventory-metric-value mb-0">{totalProducts}</p>
        </article>
        <article className="inventory-metric-card inventory-metric-low">
          <p className="inventory-metric-label mb-1">Low Stocks</p>
          <p className="inventory-metric-value mb-0">{lowStockCount}</p>
        </article>
        <article className="inventory-metric-card inventory-metric-expiring">
          <p className="inventory-metric-label mb-1">Expiring</p>
          <p className="inventory-metric-value mb-0">{expiringSoonCount}</p>
        </article>
        <article className="inventory-metric-card inventory-metric-expired">
          <p className="inventory-metric-label mb-1">Expired</p>
          <p className="inventory-metric-value mb-0">{expiredCount}</p>
        </article>
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
          <div className="inventory-action-group">
            <button
              type="button"
              className="btn inventory-action-btn inventory-action-primary"
              onClick={() => handleActionChange("Stock In")}
            >
              Stock In
            </button>
            <button
              type="button"
              className="btn inventory-action-btn inventory-action-primary"
              onClick={() => handleActionChange("Stock Out")}
            >
              Stock Out
            </button>
          </div>
          <select
            className="form-select inventory-select"
            value={tableActionFilter}
            onChange={(event) => handleActionChange(event.target.value)}
            aria-label="Action filter"
          >
            {ACTION_FILTERS.map((action) => (
              <option key={action} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>

        <div className="inventory-table-scroll">
          <table className="table inventory-table mb-0">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Action</th>
                <th>Quantity</th>
                <th>Date & Time</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>
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
                  <td colSpan={5}>
                    <div className="inventory-empty-state">
                      <i className="fa-regular fa-folder-open mb-2" aria-hidden="true" />
                      <p className="mb-0">No inventory logs match your filter.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => handleRowClick(log)}
                    style={{ cursor: "pointer" }}
                    className={selectedLog?.id === log.id ? "inventory-row-selected" : ""}
                  >
                    <td>
                      <p className="inventory-item-name mb-0">{log.productName}</p>
                    </td>
                    <td>
                      <span
                        className={`inventory-log-action-chip inventory-log-action-${log.action
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>{log.action === "Stock IN" ? `+ ${log.quantity}` : `- ${log.quantity}`}</td>
                    <td>{log.dateTime}</td>
                    <td>{log.user}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
