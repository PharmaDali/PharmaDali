import React from "react";
import { getWeeksLeft } from "../../../utils/inventoryUtils";

export function InventorySideCards({ lowStockItems, expiringItems }) {
  return (
    <div className="inventory-side-stack h-100">
      <article className="inventory-side-card">
        <h6 className="inventory-side-title">Priority restocks</h6>
        <div className="inventory-side-table">
          <div className="inventory-side-head">
            <span>Product</span>
            <span>Qty.</span>
            <span>Will Last (Weeks)</span>
          </div>
          {lowStockItems.map((item) => (
            <div key={item.id} className="inventory-side-row">
              <span className="inventory-side-name">{item.name}</span>
              <span className="inventory-side-sub">{item.quantity} left</span>
              <span className="inventory-side-pill inventory-side-pill-warn">
                {getWeeksLeft(item)}
              </span>
            </div>
          ))}
        </div>
      </article>

      <article className="inventory-side-card">
        <h6 className="inventory-side-title">Expiring Soon</h6>
        <div className="inventory-side-table">
          <div className="inventory-side-head">
            <span>Product</span>
            <span>Qty.</span>
            <span>Expires In (Days)</span>
          </div>
          {expiringItems.map((item) => (
            <div key={item.id} className="inventory-side-row">
              <span className="inventory-side-name">{item.name}</span>
              <span className="inventory-side-sub">{item.quantity} left</span>
              <span className="inventory-side-pill inventory-side-pill-danger">
                {item.expiringInDays}
              </span>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

export default InventorySideCards;
