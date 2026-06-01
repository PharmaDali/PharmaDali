import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/inventory.css";

const INVENTORY_LOG_ENTRIES = [
  {
    id: "LOG-001",
    productName: "Biogesic",
    action: "Stock IN",
    quantity: 50,
    dateTime: "2025-01-01 10:03",
    user: "Denmar Redondo",
  },
  {
    id: "LOG-002",
    productName: "Biogesic",
    action: "Stock IN",
    quantity: 50,
    dateTime: "2025-01-01 10:03",
    user: "Denmar Redondo",
  },
  {
    id: "LOG-003",
    productName: "Biogesic",
    action: "Stock IN",
    quantity: 50,
    dateTime: "2025-01-01 10:03",
    user: "Denmar Redondo",
  },
  {
    id: "LOG-004",
    productName: "Biogesic",
    action: "Stock OUT",
    quantity: 50,
    dateTime: "2025-01-01 10:03",
    user: "Denmar Redondo",
  },
];

const ACTION_FILTERS = ["All", "Stock In", "Stock Out"];

function InventoryLogs() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [dateRange, setDateRange] = useState("");

  const filteredLogs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return INVENTORY_LOG_ENTRIES.filter((log) => {
      const matchesQuery =
        normalizedQuery.length === 0 || log.productName.toLowerCase().includes(normalizedQuery);

      const matchesAction =
        actionFilter === "All" ||
        (actionFilter === "Stock In" && log.action === "Stock IN") ||
        (actionFilter === "Stock Out" && log.action === "Stock OUT");

      return matchesQuery && matchesAction;
    });
  }, [query, actionFilter]);

  const totalProducts = 798;
  const lowStockCount = 20;
  const expiringSoonCount = 20;
  const expiredCount = 15;

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
        <span className="breadcrumb-separator">·</span>
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
            onChange={(event) => setActionFilter(event.target.value)}
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
          <button type="button" className="btn inventory-search-btn">
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
            >
              Stock In
            </button>
            <button
              type="button"
              className="btn inventory-action-btn inventory-action-primary"
            >
              Stock Out
            </button>
            <button
              type="button"
              className="btn inventory-action-btn inventory-action-muted"
            >
              All
            </button>
          </div>
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
              {filteredLogs.length === 0 ? (
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
                  <tr key={log.id}>
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
    </section>
  );
}

export default InventoryLogs;
