import React from "react";
import PosCurrentOrder from "./PosCurrentOrder";

export default function PosOrderPane() {
  return (
    <div className="d-flex flex-column pos-pane pos-order-pane" style={{ minWidth: 0 }}>
      <div className="card border-0 shadow-sm pos-card pos-order-card rounded-4 overflow-hidden">
        <div className="card-header bg-white border-0 d-flex align-items-center gap-3 flex-wrap pt-4 pb-2 px-3">
          <h6 className="fw-semibold mb-0 flex-shrink-0 pos-title" style={{ color: "#222", fontSize: 20 }}>
            Current Order
          </h6>
        </div>
        <div className="card-body p-3 pt-1 overflow-y-auto pos-order-body" style={{ flex: 1, minHeight: 0 }}>
          <PosCurrentOrder />
        </div>
      </div>
    </div>
  );
}
