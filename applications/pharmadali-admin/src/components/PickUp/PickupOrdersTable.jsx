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
  statusFilter,
}) {
  return (
    <article className="h-100 d-flex flex-column flex-grow-1" style={{ backgroundColor: "transparent", minHeight: 0 }}>
      {/* Table Wrapper with horizontal scrolling */}
      <div
        className="table-responsive flex-grow-1"
        style={{
          overflowX: "auto",
          overflowY: "hidden",
          backgroundColor: "transparent",
          borderTopLeftRadius: "0px",
          borderTopRightRadius: "0px",
          borderBottomLeftRadius: "10px",
          borderBottomRightRadius: "10px"
        }}
      >
        <table className="table align-middle mb-0 inventory-table" style={{ backgroundColor: "transparent", borderCollapse: "separate", borderSpacing: "0", border: "none", minWidth: "750px" }}>
          <thead>
            <tr style={{ backgroundColor: "#e2f2fa" }}>
              <th className="fw-semibold px-2 px-md-4 py-3 text-start text-nowrap text-uppercase text-secondary" style={{ backgroundColor: "#e2f2fa", border: "none", fontSize: "11px", letterSpacing: "0.5px" }}>Order ID</th>
              <th className="fw-semibold px-2 px-md-4 py-3 text-center text-nowrap text-uppercase text-secondary" style={{ backgroundColor: "#e2f2fa", border: "none", fontSize: "11px", letterSpacing: "0.5px" }}>Customer</th>
              <th className="fw-semibold px-2 px-md-4 py-3 text-center text-nowrap text-uppercase text-secondary" style={{ backgroundColor: "#e2f2fa", border: "none", fontSize: "11px", letterSpacing: "0.5px" }}>Items</th>
              <th className="fw-semibold px-2 px-md-4 py-3 text-center text-nowrap text-uppercase text-secondary" style={{ backgroundColor: "#e2f2fa", border: "none", fontSize: "11px", letterSpacing: "0.5px" }}>Total</th>
              <th className="fw-semibold px-4 py-3 text-center text-uppercase text-secondary" style={{ backgroundColor: "#e2f2fa", border: "none", fontSize: "11px", letterSpacing: "0.5px" }}>Status</th>
              <th className="fw-semibold px-4 py-3 text-center text-uppercase text-secondary" style={{ backgroundColor: "#e2f2fa", border: "none", fontSize: "11px", letterSpacing: "0.5px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={5} columns={6} showAvatar={false} />
            ) : fetchError ? (
              <tr className="inventory-empty-row" style={{ cursor: "default", backgroundColor: "#ffffff" }}>
                <td colSpan={6} className="text-center py-5" style={{ backgroundColor: "#ffffff", borderTopLeftRadius: "0px", borderTopRightRadius: "0px", borderBottomLeftRadius: "10px", borderBottomRightRadius: "10px" }}>
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
                <td colSpan={6} className="text-center py-5" style={{ backgroundColor: "#ffffff", borderTopLeftRadius: "0px", borderTopRightRadius: "0px", borderBottomLeftRadius: "10px", borderBottomRightRadius: "10px" }}>
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
                const topLeftRadius = "0px";
                const topRightRadius = "0px";
                const bottomLeftRadius = isLastRow ? "10px" : "0px";
                const bottomRightRadius = isLastRow ? "10px" : "0px";

                const bottomBorder = isLastRow ? "none" : "1px solid #e2e8f0";
                const showMobileDot = true; // Always show status dot on mobile view
                const isReady = order.status === "ready_for_pickup" || order.status === "ready";

                return (
                  <tr
                    key={order.id}
                    style={{ cursor: "pointer", transition: "background-color 0.2s" }}
                    onClick={() => onSelectOrder(order)}
                  >
                    <td className="px-2 px-md-4 py-3 text-start text-dark text-nowrap" style={{ fontSize: "13px", borderBottom: bottomBorder, borderTopLeftRadius: topLeftRadius, borderBottomLeftRadius: bottomLeftRadius, backgroundColor: cellBgColor, borderLeft: "none" }}>
                      <span className="d-inline-block rounded-circle me-2 d-md-none" style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: isReady ? "#10b981" : "#94a3b8"
                      }}></span>
                      {order.order_number || order.id}
                    </td>
                    <td className="px-2 px-md-4 py-3 text-center text-nowrap" style={{ borderBottom: bottomBorder, backgroundColor: cellBgColor }}>
                      <div className="fw-medium text-dark" style={{ fontSize: "13px" }}>
                        {order.customer_name ? order.customer_name : formatCustomerName(order)}
                      </div>
                    </td>
                    <td className="px-2 px-md-4 py-3 text-center text-dark text-nowrap" style={{ borderBottom: bottomBorder, backgroundColor: cellBgColor, fontSize: "13px" }}>
                      {Number(order.items_count || order.items?.length || 0)}
                    </td>
                    <td className="px-2 px-md-4 py-3 text-center fw-medium text-dark text-nowrap" style={{ fontSize: "13px", borderBottom: bottomBorder, backgroundColor: cellBgColor }}>
                      PHP {Number(order.total_amount || order.payable_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-center" style={{ borderBottom: bottomBorder, backgroundColor: cellBgColor }}>
                      <span
                        className="fw-semibold"
                        style={{
                          fontSize: "13px",
                          color: isReady ? "#10b981" : "#64748b",
                        }}
                      >
                        {isReady ? "Ready" : "Completed"}
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
      </div>

      {/* Pagination Footer outside Table scroll wrapper */}
      {!loading && !fetchError && paginatedOrders.length > 0 && (
        <div className="p-3 bg-transparent border-0 mt-auto">
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
    </article>
  );
}

export default PickupOrdersTable;
