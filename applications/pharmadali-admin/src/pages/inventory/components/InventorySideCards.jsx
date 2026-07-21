import React from "react";
import { getWeeksLeft } from "../../../utils/inventoryUtils";

export function InventorySideCards({ lowStockItems, expiringItems, expiredItems }) {
  const cardStyle = { flex: "1 1 0", minHeight: 0 };
  const emptyStateStyle = { textAlign: "center", padding: "2rem 1rem", color: "#6c757d", fontSize: "0.9rem" };

  return (
    <div className="d-flex flex-column h-100 gap-3">
      <article className="card border-0 shadow-sm p-3 d-flex flex-column" style={cardStyle}>
        <h6 className="inventory-side-title mb-3">Priority restocks</h6>
        <div className="inventory-side-table flex-fill overflow-auto">
          <div className="inventory-side-head">
            <span>Product</span>
            <span>Qty.</span>
            <span>Will Last (Weeks)</span>
          </div>
          {lowStockItems && lowStockItems.length > 0 ? (
            lowStockItems.map((item) => (
              <div key={item.id} className="inventory-side-row">
                <span className="inventory-side-name">{item.name}</span>
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

      <article className="card border-0 shadow-sm p-3 d-flex flex-column" style={cardStyle}>
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
                <span className="inventory-side-name">{item.name}</span>
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

      <article className="card border-0 shadow-sm p-3 d-flex flex-column" style={cardStyle}>
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
                <span className="inventory-side-name">{item.name}</span>
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
