import React from "react";
import { getWeeksLeft } from "../../utils/inventoryUtils";

export function InventorySideCards({ lowStockItems, expiringItems, expiredItems, handleMarkOrdered }) {
  const cardStyle = { flex: "1 1 0", minHeight: 0 };
  const emptyStateStyle = { textAlign: "center", padding: "2rem 1rem", color: "#6c757d", fontSize: "0.9rem" };

  return (
    <div className="inventory-side-wrapper d-flex flex-column gap-3">
      <article className="card border-0 shadow-sm p-3 d-flex flex-column inventory-side-card">
        <h6 className="inventory-side-title mb-3">Priority Restocks</h6>
        <div className="inventory-side-table flex-fill overflow-auto">
          <div className="inventory-side-head">
            <span>Product</span>
            <span>Qty.</span>
            <span>Will Last (Weeks)</span>
          </div>
          {lowStockItems && lowStockItems.length > 0 ? (
            lowStockItems.map((item) => (
              <div key={item.id} className="inventory-side-row">
                <div className="d-flex flex-column gap-1">
                  <span className="inventory-side-name">
                    {item.name}
                    {item.batches && item.batches.length > 0 && (
                      <div style={{ fontSize: "10px", color: "#6c757d", fontWeight: "normal", marginTop: "2px" }}>
                        {item.batches.map((b) => b.batch_number).filter(Boolean).join(", ")}
                      </div>
                    )}
                  </span>
                  {!item.ordered_at && handleMarkOrdered && (
                    <button
                      className="btn btn-sm py-0 px-2 mt-1"
                      style={{ 
                        fontSize: "10px", 
                        width: "fit-content", 
                        borderRadius: "10px",
                        color: "var(--pd-primary)",
                        border: "1px solid var(--pd-primary)",
                        backgroundColor: "transparent"
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
                    <span style={{ fontSize: "10px", color: "#28a745", fontWeight: "600" }}>✓ Ordered</span>
                  )}
                </div>
                <span className="inventory-side-sub">{item.quantity} left</span>
                <span className="inventory-side-pill inventory-side-pill-warn">
                  {getWeeksLeft(item)}
                </span>
              </div>
            ))
          ) : (
            <div style={emptyStateStyle}>Currently no priority restock products</div>
          )}
        </div>
      </article>

      <article className="card border-0 shadow-sm p-3 d-flex flex-column inventory-side-card">
        <h6 className="inventory-side-title mb-3">Expiring Soon</h6>
        <div className="inventory-side-table flex-fill overflow-auto">
          <div className="inventory-side-head">
            <span>Product</span>
            <span>Qty.</span>
            <span>Expires In (Days)</span>
          </div>
          {expiringItems && expiringItems.length > 0 ? (
            expiringItems.map((item) => (
              <div key={item.id} className="inventory-side-row">
                <span className="inventory-side-name">
                  {item.name}
                  {item.batches && item.batches.length > 0 && (
                    <div style={{ fontSize: "10px", color: "#6c757d", fontWeight: "normal", marginTop: "2px" }}>
                      {item.batches
                        .filter((b) => b.status === "Expiring soon")
                        .map((b) => b.batch_number)
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  )}
                </span>
                <span className="inventory-side-sub">{item.quantity} left</span>
                <span className="inventory-side-pill inventory-side-pill-danger">
                  {item.expiringInDays}
                </span>
              </div>
            ))
          ) : (
            <div style={emptyStateStyle}>No expiring soon products</div>
          )}
        </div>
      </article>

      <article className="card border-0 shadow-sm p-3 d-flex flex-column inventory-side-card">
        <h6 className="inventory-side-title mb-3">Expired Products</h6>
        <div className="inventory-side-table flex-fill overflow-auto">
          <div className="inventory-side-head">
            <span>Product</span>
            <span>Qty.</span>
            <span>Expired (Days Ago)</span>
          </div>
          {expiredItems && expiredItems.length > 0 ? (
            expiredItems.map((item) => (
              <div key={item.id} className="inventory-side-row">
                <span className="inventory-side-name">
                  {item.name}
                  {item.batches && item.batches.length > 0 && (
                    <div style={{ fontSize: "10px", color: "#6c757d", fontWeight: "normal", marginTop: "2px" }}>                      {item.batches
                        .filter((b) => b.status === "Expired")
                        .map((b) => b.batch_number)
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  )}
                </span>
                <span className="inventory-side-sub">{item.quantity} left</span>
                <span className="inventory-side-pill inventory-side-pill-danger">
                  {Math.abs(item.expiringInDays)}
                </span>
              </div>
            ))
          ) : (
            <div style={emptyStateStyle}>No expired products</div>
          )}
        </div>
      </article>
    </div>
  );
}

export default InventorySideCards;
