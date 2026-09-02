import React from "react";
import { getWeeksLeft } from "../../utils/inventoryUtils";

export function InventorySideCards({ lowStockItems, expiringItems, expiredItems, handleMarkOrdered }) {
  const emptyStateStyle = { textAlign: "center", padding: "1.5rem 1rem", color: "var(--pd-text-muted)", fontSize: "0.85rem" };

  return (
    <div className="inventory-side-wrapper d-flex flex-column gap-3">
      {/* Priority Restocks */}
      <article className="card border-0 shadow-sm p-3 d-flex flex-column inventory-side-card">
        <h6 className="inventory-side-title mb-2">Priority Restocks</h6>
        <div className="flex-fill table-responsive inventory-side-scroll border-0 m-0 p-0">
          {lowStockItems && lowStockItems.length > 0 ? (
            <table className="inventory-side-table" style={{ tableLayout: "fixed", minWidth: "380px" }}>
              <thead>
                <tr>
                  <th style={{ width: "32%" }}>Product</th>
                  <th style={{ width: "16%" }}>Qty.</th>
                  <th style={{ width: "24%" }} className="text-center">Will Last (Weeks)</th>
                  <th style={{ width: "28%" }} className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="inventory-side-name d-block text-truncate">
                        {item.name}
                      </span>
                      {item.batches && item.batches.length > 0 && (
                        <span style={{ fontSize: "10px", color: "var(--pd-text-muted)", display: "block" }}>
                          {item.batches.map((b) => b.batch_number).filter(Boolean).join(", ")}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="inventory-side-sub">{item.quantity} left</span>
                    </td>
                    <td className="text-center">
                      <span className="inventory-side-pill inventory-side-pill-warn">
                        {getWeeksLeft(item)}
                      </span>
                    </td>
                    <td className="text-center">
                      {!item.ordered_at && handleMarkOrdered && (
                        <button
                          className="btn btn-sm py-0 px-2"
                          style={{ 
                            fontSize: "10px", 
                            borderRadius: "10px",
                            color: "var(--pd-primary)",
                            border: "1px solid var(--pd-primary)",
                            backgroundColor: "transparent",
                            whiteSpace: "nowrap"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "var(--pd-primary)";
                            e.target.style.color = "white";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.color = "var(--pd-primary)";
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkOrdered(item.id);
                          }}
                        >
                          Mark as Ordered
                        </button>
                      )}
                      {item.ordered_at && (
                        <span style={{ fontSize: "10px", color: "var(--pd-success)", fontWeight: "600", whiteSpace: "nowrap" }}>✓ Ordered</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={emptyStateStyle}>Currently no priority restock products</div>
          )}
        </div>
      </article>

      {/* Expiring Soon */}
      <article className="card border-0 shadow-sm p-3 d-flex flex-column inventory-side-card">
        <h6 className="inventory-side-title mb-2">Expiring Soon</h6>
        <div className="flex-fill table-responsive inventory-side-scroll border-0 m-0 p-0">
          {expiringItems && expiringItems.length > 0 ? (
            <table className="inventory-side-table" style={{ tableLayout: "fixed", minWidth: "350px" }}>
              <thead>
                <tr>
                  <th style={{ width: "42%" }}>Product</th>
                  <th style={{ width: "23%" }}>Qty.</th>
                  <th style={{ width: "35%" }} className="text-center">Expires In (Days)</th>
                </tr>
              </thead>
              <tbody>
                {expiringItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="inventory-side-name d-block">
                        {item.name}
                      </span>
                      {item.batches && item.batches.length > 0 && (
                        <span style={{ fontSize: "10px", color: "var(--pd-text-muted)", display: "block" }}>
                          {item.batches
                            .filter((b) => b.status === "Expiring soon")
                            .map((b) => b.batch_number)
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="inventory-side-sub">{item.quantity} left</span>
                    </td>
                    <td className="text-center">
                      <span className="inventory-side-pill inventory-side-pill-danger">
                        {item.expiringInDays}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={emptyStateStyle}>No expiring soon products</div>
          )}
        </div>
      </article>

      {/* Expired Products */}
      <article className="card border-0 shadow-sm p-3 d-flex flex-column inventory-side-card">
        <h6 className="inventory-side-title mb-2">Expired Products</h6>
        <div className="flex-fill table-responsive inventory-side-scroll border-0 m-0 p-0">
          {expiredItems && expiredItems.length > 0 ? (
            <table className="inventory-side-table" style={{ tableLayout: "fixed", minWidth: "350px" }}>
              <thead>
                <tr>
                  <th style={{ width: "42%" }}>Product</th>
                  <th style={{ width: "23%" }}>Qty.</th>
                  <th style={{ width: "35%" }} className="text-center">Expired (Days Ago)</th>
                </tr>
              </thead>
              <tbody>
                {expiredItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="inventory-side-name d-block">
                        {item.name}
                      </span>
                      {item.batches && item.batches.length > 0 && (
                        <span style={{ fontSize: "10px", color: "var(--pd-text-muted)", display: "block" }}>
                          {item.batches
                            .filter((b) => b.status === "Expired")
                            .map((b) => b.batch_number)
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="inventory-side-sub">
                        {item.batches && item.batches.length > 0
                          ? item.batches.filter(b => b.status === "Expired").reduce((sum, b) => sum + (Number(b.stock) || 0), 0)
                          : item.quantity}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="inventory-side-pill inventory-side-pill-danger">
                        {Math.abs(item.expiringInDays)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={emptyStateStyle}>No expired products</div>
          )}
        </div>
      </article>
    </div>
  );
}

export default InventorySideCards;
