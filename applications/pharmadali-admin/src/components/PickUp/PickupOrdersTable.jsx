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
  activeOrder,
}) {
  return (
    <article className="h-100 d-flex flex-column flex-grow-1" style={{ backgroundColor: "transparent" }}>
      {/* Table & Pagination Container with rounded corners, no wrapper border */}
      <div 
        className="table-responsive flex-grow-1 overflow-hidden d-flex flex-column justify-content-between" 
        style={{ 
          backgroundColor: "transparent", 
          borderRadius: "10px"
        }}
      >
        <table className="table align-middle mb-0 inventory-table" style={{ backgroundColor: "transparent", borderCollapse: "separate", borderSpacing: "0", border: "none" }}>
          <thead>
            <tr style={{ backgroundColor: "#e2f2fa" }}>
              <th className="fw-semibold px-4 py-3 text-start" style={{ color: "#475569", backgroundColor: "#e2f2fa", border: "none", fontSize: "13px" }}>Order ID</th>
              <th className="fw-semibold px-4 py-3 text-center" style={{ color: "#475569", backgroundColor: "#e2f2fa", border: "none", fontSize: "13px" }}>Customer</th>
              <th className="fw-semibold px-4 py-3 text-center" style={{ color: "#475569", backgroundColor: "#e2f2fa", border: "none", fontSize: "13px" }}>Items</th>
              <th className="fw-semibold px-4 py-3 text-center" style={{ color: "#475569", backgroundColor: "#e2f2fa", border: "none", fontSize: "13px" }}>Total</th>
              <th className="fw-semibold px-4 py-3 text-center" style={{ color: "#475569", backgroundColor: "#e2f2fa", border: "none", fontSize: "13px" }}>Status</th>
              <th className="fw-semibold px-4 py-3 text-center" style={{ color: "#475569", backgroundColor: "#e2f2fa", border: "none", fontSize: "13px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr style={{ backgroundColor: "#ffffff" }}>
                <td colSpan={6} style={{ backgroundColor: "#ffffff", borderRadius: "10px" }}>
                  <TableSkeleton rows={5} columns={6} showAvatar={false} />
                </td>
              </tr>
            ) : fetchError ? (
              <tr className="inventory-empty-row" style={{ cursor: "default", backgroundColor: "#ffffff" }}>
                <td colSpan={6} className="text-center py-5" style={{ backgroundColor: "#ffffff", borderRadius: "10px" }}>
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
              <tr className="inventory-empty-row" style={{ cursor: "default", backgroundColor: "#ffffff" }}>
                <td colSpan={6} className="text-center py-5" style={{ backgroundColor: "#ffffff", borderRadius: "10px" }}>
                  <div className="d-flex flex-column align-items-center justify-content-center py-4">
                    <i className="fa-solid fa-box-open mb-3" style={{ fontSize: "3.5rem", color: "#94a3b8" }} />
                    <span className="fw-medium" style={{ fontSize: "15px", color: "#64748b" }}>
                      No pickup orders found in this view.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedOrders.map((order, index) => {
                const isActive = activeOrder && activeOrder.id === order.id;
                const cellBgColor = isActive ? "#d8dce2" : "#ffffff";
                const isLastRow = index === paginatedOrders.length - 1;
                const isFirstRow = index === 0;

                // Calculate border radius for clean card rounding of the table body block
                const topLeftRadius = isFirstRow ? "10px" : "0px";
                const topRightRadius = isFirstRow ? "10px" : "0px";
                const bottomLeftRadius = isLastRow ? "10px" : "0px";
                const bottomRightRadius = isLastRow ? "10px" : "0px";

                const bottomBorder = isLastRow ? "none" : "1px solid #e2e8f0";

                return (
                  <tr 
                    key={order.id} 
                    style={{ cursor: "pointer", transition: "background-color 0.2s" }} 
                    onClick={() => onSelectOrder(order)}
                  >
                    <td className="px-4 py-3 text-start text-dark" style={{ fontSize: "13px", borderBottom: bottomBorder, borderTopLeftRadius: topLeftRadius, borderBottomLeftRadius: bottomLeftRadius, backgroundColor: cellBgColor, borderLeft: "none" }}>{order.order_number || order.id}</td>
                    <td className="px-4 py-3 text-center" style={{ borderBottom: bottomBorder, backgroundColor: cellBgColor }}>
                      <div className="fw-medium text-dark" style={{ fontSize: "13px" }}>
                        {formatCustomerName(order)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-dark" style={{ borderBottom: bottomBorder, backgroundColor: cellBgColor, fontSize: "13px" }}>
                      {Number(order.items_count || order.items?.length || 0)}
                    </td>
                    <td className="px-4 py-3 text-center fw-medium text-dark" style={{ fontSize: "13px", borderBottom: bottomBorder, backgroundColor: cellBgColor }}>
                      PHP {Number(order.total_amount || order.payable_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center" style={{ borderBottom: bottomBorder, backgroundColor: cellBgColor }}>
                      <span
                        className="fw-semibold"
                        style={{
                          fontSize: "13px",
                          color:
                            order.status === "ready_for_pickup" || order.status === "ready"
                              ? "#10b981"
                              : "#64748b",
                        }}
                      >
                        {order.status === "ready_for_pickup" || order.status === "ready"
                          ? "Ready"
                          : "Completed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()} style={{ borderBottom: bottomBorder, borderTopRightRadius: topRightRadius, borderBottomRightRadius: bottomRightRadius, backgroundColor: cellBgColor, borderRight: "none" }}>
                      <button
                        type="button"
                        className="btn btn-sm text-white fw-medium rounded-pill px-4 shadow-sm"
                        style={{
                          backgroundColor: "#48aad9",
                          borderColor: "#48aad9",
                          fontSize: "12px"
                        }}
                        onClick={() => onSelectOrder(order)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Footer inside Table Card */}
        {!loading && !fetchError && (filteredOrders || orders).length > 0 && (
          <div className="p-3 bg-transparent border-0">
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
