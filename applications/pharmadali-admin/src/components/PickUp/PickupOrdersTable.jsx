import React from "react";
import { TableSkeleton } from "../../shared/components/loading";
import Pagination from "../../shared/components/Pagination";
import { formatDateTime, formatCustomerName, formatCustomerPhone } from "../../utils/formatUtils";

export function PickupOrdersTable({
  orders,
  filteredOrders,
  loading,
  fetchError,
  paginatedOrders,
  currentPage,
  totalPages,
  visiblePageNumbers,
  onPageChange,
  onSelectOrder,
}) {
  return (
    <article className="h-100 d-flex flex-column flex-grow-1" style={{ backgroundColor: "transparent" }}>
      {/* Table & Pagination Container */}
      <div className="table-responsive flex-grow-1 bg-white border-0 overflow-hidden d-flex flex-column justify-content-between" style={{ backgroundColor: "#FFFFFF" }}>
        <table className="table align-middle mb-0 inventory-table bg-white" style={{ backgroundColor: "#FFFFFF" }}>
          <thead>
            <tr>
              <th className="text-center">Order ID</th>
              <th className="text-center">Customer</th>
              <th className="text-center">Date & Time</th>
              <th className="text-center">Items</th>
              <th className="text-center">Total Amount</th>
              <th className="text-center">Status</th>
              <th className="text-center">Action</th>
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
                  <td className="text-center fw-bold" style={{ color: "#444444" }}>#{order.order_number || order.id}</td>
                  <td className="text-center">
                    <div className="fw-semibold" style={{ color: "#444444" }}>
                      {formatCustomerName(order)}
                    </div>
                    {Boolean(formatCustomerPhone(order)) && (
                      <span className="small d-block" style={{ color: "#666666" }}>{formatCustomerPhone(order)}</span>
                    )}
                  </td>
                  <td className="text-center fw-medium" style={{ color: "#444444" }}>{formatDateTime(order.created_at_formatted || order.created_at)}</td>
                  <td className="text-center">
                    <span className="fw-medium" style={{ color: "#444444" }}>
                      {(() => {
                        const count = Number(order.items_count || order.items?.length || 0);
                        return `${count} ${count === 1 ? "item" : "items"}`;
                      })()}
                    </span>
                  </td>
                  <td className="text-center fw-bold" style={{ color: "#444444" }}>
                    PHP {Number(order.total_amount || order.payable_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="text-center">
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
                  <td className="text-center" onClick={(e) => e.stopPropagation()}>
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

        {/* Pagination Footer inside Table Card */}
        {!loading && !fetchError && (filteredOrders || orders).length > 0 && (
          <div className="p-3 border-top bg-white">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={(filteredOrders || orders).length}
              itemsPerPage={10}
              onPageChange={onPageChange}
              visiblePageNumbers={visiblePageNumbers}
              ariaLabel="Pickup orders table pagination"
            />
          </div>
        )}
      </div>
    </article>
  );
}

export default PickupOrdersTable;
