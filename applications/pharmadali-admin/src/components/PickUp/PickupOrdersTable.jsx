import React from "react";
import { TableSkeleton } from "../../shared/components/loading";

export function PickupOrdersTable({
  orders,
  loading,
  search,
  setSearch,
  statusFilter,
  onTabChange,
  tabCounts,
  paginatedOrders,
  currentPage,
  totalPages,
  visiblePageNumbers,
  onPageChange,
  onSelectOrder,
  tabs,
}) {
  return (
    <article className="inventory-card shadow-sm border-0 rounded-4">
      {/* Header Tabs & Search */}
      <div className="inventory-toolbar p-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-3">
        <div className="nav nav-pills gap-2">
          {tabs.map((tab) => {
            const isActive = statusFilter === tab.id;
            const count = tabCounts[tab.id] || 0;
            return (
              <button
                key={tab.id}
                type="button"
                className={`nav-link btn-sm d-flex align-items-center gap-2 rounded-3 px-3 py-2 ${
                  isActive ? "active" : ""
                }`}
                style={{
                  backgroundColor: isActive ? "#2aabe2" : "#f1f5f9",
                  color: isActive ? "#ffffff" : "#475569",
                  fontWeight: isActive ? 600 : 500,
                }}
                onClick={() => onTabChange(tab.id)}
              >
                <i className={`fa-solid ${tab.icon}`} />
                <span>{tab.label}</span>
                <span className={`badge rounded-pill ${isActive ? "bg-white text-primary" : "bg-secondary-subtle text-secondary"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="inventory-search-wrap" style={{ minWidth: 260 }}>
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            className="form-control form-control-sm inventory-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID, customer name, ref..."
            aria-label="Search pickup orders"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="table-responsive">
        <table className="table align-middle mb-0 inventory-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date & Time</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th className="text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={5} columns={7} showAvatar={false} />
            ) : paginatedOrders.length === 0 ? (
              <tr className="inventory-empty-row" style={{ cursor: "default" }}>
                <td colSpan={7} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center justify-content-center py-4">
                    <i className="fa-solid fa-box-open mb-3" style={{ fontSize: "3.5rem", color: "#94a3b8" }} />
                    <span className="fw-medium" style={{ fontSize: "15px", color: "#64748b" }}>
                      No pickup orders found in this view.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order) => (
                <tr key={order.id} style={{ cursor: "pointer" }} onClick={() => onSelectOrder(order)}>
                  <td className="fw-bold text-primary">#{order.order_number || order.id}</td>
                  <td>
                    <div className="fw-semibold text-dark">
                      {order.customer_name || `${order.user?.first_name || ''} ${order.user?.last_name || ''}`.trim() || "Walk-in Customer"}
                    </div>
                    <span className="text-muted small">{order.customer_phone || order.user?.mobile_number || "—"}</span>
                  </td>
                  <td className="text-muted small">{order.created_at_formatted || order.created_at || "—"}</td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      {order.items_count || order.items?.length || 0} item(s)
                    </span>
                  </td>
                  <td className="fw-bold text-dark">
                    ₱{Number(order.total_amount || order.payable_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span className={`badge px-2 py-1 rounded-pill ${
                      order.status === "ready_for_pickup"
                        ? "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                        : order.status === "completed"
                        ? "bg-success-subtle text-success border border-success-subtle"
                        : "bg-secondary-subtle text-secondary border border-secondary-subtle"
                    }`}>
                      {order.status === "ready_for_pickup" ? "Ready for Pickup" : order.status === "completed" ? "Completed" : order.status}
                    </span>
                  </td>
                  <td className="text-end" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary rounded-3 px-3"
                      onClick={() => onSelectOrder(order)}
                    >
                      {order.status === "ready_for_pickup" ? "Process Pickup" : "View Details"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && totalPages > 1 && (
        <div className="p-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
          <span className="text-muted small">
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({orders.length} total orders)
          </span>

          <nav aria-label="Pickup orders pagination">
            <ul className="pagination pagination-sm mb-0 gap-1">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link rounded-2" onClick={() => onPageChange(currentPage - 1)}>
                  Previous
                </button>
              </li>
              {visiblePageNumbers.map((num) => (
                <li key={num} className={`page-item ${currentPage === num ? "active" : ""}`}>
                  <button className="page-link rounded-2" onClick={() => onPageChange(num)}>
                    {num}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link rounded-2" onClick={() => onPageChange(currentPage + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </article>
  );
}

export default PickupOrdersTable;
