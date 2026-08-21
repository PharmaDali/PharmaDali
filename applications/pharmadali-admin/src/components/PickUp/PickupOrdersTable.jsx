import React from "react";
import { TableSkeleton } from "../../shared/components/loading";
import SearchBar from "../../shared/components/SearchBar";
import Pagination from "../../shared/components/Pagination";
import { formatDateTime, formatCustomerName, formatCustomerPhone } from "../../utils/formatUtils";

export function PickupOrdersTable({
  orders,
  filteredOrders,
  loading,
  fetchError,
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
    <article className="h-100 d-flex flex-column" style={{ backgroundColor: "transparent" }}>
      {/* Header Tabs & Search */}
      <div className="inventory-toolbar mb-3 d-flex align-items-center justify-content-between flex-wrap gap-3" style={{ backgroundColor: "transparent" }}>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <h5 className="fw-bold text-dark mb-0 me-2" style={{ fontSize: "1.25rem", whiteSpace: "nowrap" }}>
            Pickup Orders
          </h5>
          <div className="nav nav-pills gap-3">
            {tabs.map((tab) => {
              const isActive = statusFilter === tab.id;
              const rawCount = tabCounts[tab.id] || 0;
              const badgeCount = tab.id === "Completed" ? (tabCounts.CompletedNew || 0) : rawCount;
              const showBadge = tab.id !== "All" && badgeCount > 0;

              return (
                <div key={tab.id} className="position-relative d-inline-flex align-items-center">
                  <button
                    type="button"
                    className={`nav-link btn-sm d-flex align-items-center rounded-3 px-3 py-1.5 ${isActive ? "active" : ""
                      }`}
                    style={{
                      backgroundColor: isActive ? "#2aabe2" : "#f1f5f9",
                      color: isActive ? "#ffffff" : "#475569",
                      fontWeight: isActive ? 600 : 500,
                      fontSize: "0.815rem",
                      gap: "7px",
                    }}
                    onClick={() => onTabChange(tab.id)}
                  >
                    <i className={`fa-solid ${tab.icon}`} style={{ fontSize: "0.775rem" }} />
                    <span>{tab.label}</span>
                  </button>

                  {showBadge && (
                    <span
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill d-inline-flex align-items-center justify-content-center shadow-sm"
                      style={{
                        fontSize: "0.675rem",
                        fontWeight: 600,
                        minWidth: "20px",
                        height: "20px",
                        padding: badgeCount > 99 ? "0 5px" : 0,
                        backgroundColor: "#f87171",
                        color: "#ffffff",
                        lineHeight: "20px",
                        textAlign: "center",
                        zIndex: 2,
                      }}
                    >
                      {badgeCount > 99 ? "99+" : badgeCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ minWidth: 260 }}>
          <SearchBar
            id="pickup-orders-search"
            value={search}
            onChange={(val) => setSearch(val)}
            placeholder="Search order ID, customer name, ref..."
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="table-responsive flex-grow-1 bg-white rounded-4 shadow-sm overflow-hidden" style={{ backgroundColor: "#FFFFFF" }}>
        <table className="table align-middle mb-0 inventory-table bg-white" style={{ backgroundColor: "#FFFFFF" }}>
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
            ) : fetchError ? (
              <tr className="inventory-empty-row" style={{ cursor: "default" }}>
                <td colSpan={7} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center justify-content-center py-4">
                    <i className="fa-solid fa-plug-circle-xmark mb-3 text-warning" style={{ fontSize: "3.5rem" }} />
                    <span className="fw-semibold text-dark mb-1" style={{ fontSize: "16px" }}>
                      Server Connection Error
                    </span>
                    <span className="text-muted small">
                      {fetchError || "Unable to connect to the backend server. Please verify your backend API connection."}
                    </span>
                  </div>
                </td>
              </tr>
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
                  <td className="fw-bold" style={{ color: "#444444" }}>#{order.order_number || order.id}</td>
                  <td>
                    <div className="fw-semibold" style={{ color: "#444444" }}>
                      {formatCustomerName(order)}
                    </div>
                    {Boolean(formatCustomerPhone(order)) && (
                      <span className="small d-block" style={{ color: "#666666" }}>{formatCustomerPhone(order)}</span>
                    )}
                  </td>
                  <td className="fw-medium" style={{ color: "#444444" }}>{formatDateTime(order.created_at_formatted || order.created_at)}</td>
                  <td>
                    <span className="fw-medium" style={{ color: "#444444" }}>
                      {(() => {
                        const count = Number(order.items_count || order.items?.length || 0);
                        return `${count} ${count === 1 ? "item" : "items"}`;
                      })()}
                    </span>
                  </td>
                  <td className="fw-bold" style={{ color: "#444444" }}>
                    PHP {Number(order.total_amount || order.payable_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    <span
                      className="fw-semibold"
                      style={{
                        color:
                          order.status === "ready_for_pickup" || order.status === "ready"
                            ? "#01A768"
                            : "#444444",
                      }}
                    >
                      {order.status === "ready_for_pickup" || order.status === "ready"
                        ? "Ready"
                        : "Completed"}
                    </span>
                  </td>
                  <td className="text-end" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="btn btn-sm text-white fw-semibold rounded-3 px-3 shadow-sm"
                      style={{
                        backgroundColor: "#2aabe2",
                        borderColor: "#2aabe2",
                      }}
                      onClick={() => onSelectOrder(order)}
                    >
                      {order.status === "ready_for_pickup" || order.status === "ready" ? "Process Pickup" : "View Details"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && !fetchError && (filteredOrders || orders).length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={(filteredOrders || orders).length}
          itemsPerPage={10}
          onPageChange={onPageChange}
          visiblePageNumbers={visiblePageNumbers}
          ariaLabel="Pickup orders table pagination"
        />
      )}
    </article>
  );
}

export default PickupOrdersTable;
