import React from "react";

function parseLowStock(item) {
  const name = item.name || "Unknown Product";
  let stock = item.stock ?? item.quantity ?? item.current_stock;
  let weeks = item.weeks;

  if (stock === undefined && item.note) {
    const matchStock = item.note.match(/\((\d+)\s+left\)/);
    if (matchStock) {
      stock = parseInt(matchStock[1], 10);
    }
  }

  if (!weeks && item.note) {
    if (item.note.includes("less than 1 day") || item.note.includes("less than 1 week")) {
      weeks = "Less than 1 week";
    } else {
      const matchDays = item.note.match(/(\d+)\s+days?\s+supply/);
      if (matchDays) {
        const d = parseInt(matchDays[1], 10);
        const w = Math.max(1, Math.ceil(d / 7));
        weeks = w === 1 ? "Less than 1 week" : `${w} weeks`;
      }
    }
  }

  if (weeks && weeks.includes("supply")) {
    weeks = weeks.replace(/\s+supply/, "").trim();
  }

  let finalWeeksText = weeks ? weeks.replace(/<\s*/g, "Less than ") : "Less than 1 week";

  return {
    name,
    stockText: stock !== undefined ? `${stock} left` : "Low stock",
    weeksText: finalWeeksText,
  };
}

function parseExpiring(item) {
  const name = item.name || "Unknown Product";
  let stock = item.stock ?? item.quantity;
  let weeks = item.weeks || item.days;

  if (!weeks && item.expiry_date) {
    const diffDays = Math.ceil((new Date(item.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    if (!isNaN(diffDays) && diffDays > 0) {
      const w = Math.max(1, Math.ceil(diffDays / 7));
      weeks = w === 1 ? "1 week left" : `${w} weeks left`;
    }
  }

  if (weeks && !weeks.includes("week")) {
    const d = parseInt(weeks, 10);
    if (!isNaN(d)) {
      const w = Math.max(1, Math.ceil(d / 7));
      weeks = w === 1 ? "1 week left" : `${w} weeks left`;
    }
  }

  return {
    name,
    stockText: stock !== undefined ? `${stock} left` : null,
    weeksText: weeks || "Expiring soon",
  };
}

export function InventoryHealth({ data, onKnowMore }) {
  const lowStock = (data?.low_stock ?? []).slice(0, 5);
  const expiringSoon = (data?.expiring_soon ?? []).slice(0, 5);

  return (
    <div className="card border-0 shadow-sm rounded-3 p-4 h-100 d-flex flex-column dashboard-panel">
      <h6 className="fw-bold mb-3" style={{ fontSize: 16, color: "#2aabe2" }}>Inventory Health</h6>
      
      <div className="d-flex flex-column flex-md-row gap-4 flex-grow-1" style={{ minHeight: 0 }}>
        {/* Low Stock Items Section */}
        <div style={{ flex: 1 }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span style={{ fontSize: 14, color: "#1e293b", fontWeight: 700 }}>
              Low Stock Items
            </span>
          </div>
          {lowStock.length === 0 ? (
            <div style={{ fontSize: 13, color: "#888", padding: "16px 0" }}>No low stock alerts</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-borderless align-middle mb-0" style={{ fontSize: 12 }}>
                <thead>
                  <tr style={{ color: "#64748b", borderBottom: "1.5px solid #e2e8f0" }}>
                    <th style={{ fontWeight: 600, paddingBottom: 6, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>Product Name</th>
                    <th className="text-center" style={{ fontWeight: 600, paddingBottom: 6, width: "100px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>Units Left</th>
                    <th className="text-end" style={{ fontWeight: 600, paddingBottom: 6, width: "120px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>Weeks Left</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((rawItem, index) => {
                    const item = parseLowStock(rawItem);
                    return (
                      <tr key={item.name + index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td className="fw-semibold py-2 text-truncate" style={{ color: "#334155", maxWidth: 160 }} title={item.name}>
                          {item.name}
                        </td>
                        <td className="text-center py-2">
                          <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1" style={{ fontSize: 11 }}>
                            {item.stockText}
                          </span>
                        </td>
                        <td className="text-end py-2">
                          <span className="badge bg-info-subtle text-info-emphasis border border-info-subtle px-2 py-1" style={{ fontSize: 11 }}>
                            {item.weeksText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Divider for desktop */}
        <div className="d-none d-md-block" style={{ width: 1, backgroundColor: "#e2e8f0" }} />

        {/* Expiring Soon Section */}
        <div style={{ flex: 1 }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span style={{ fontSize: 14, color: "#1e293b", fontWeight: 700 }}>
              Expiring Soon
            </span>
          </div>
          {expiringSoon.length === 0 ? (
            <div style={{ fontSize: 13, color: "#888", padding: "16px 0" }}>No expiring alerts</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-borderless align-middle mb-0" style={{ fontSize: 12 }}>
                <thead>
                  <tr style={{ color: "#64748b", borderBottom: "1.5px solid #e2e8f0" }}>
                    <th style={{ fontWeight: 600, paddingBottom: 6, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>Product Name</th>
                    <th className="text-center" style={{ fontWeight: 600, paddingBottom: 6, width: "100px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>Units Left</th>
                    <th className="text-end" style={{ fontWeight: 600, paddingBottom: 6, width: "120px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5px" }}>Weeks Left</th>
                  </tr>
                </thead>
                <tbody>
                  {expiringSoon.map((rawItem, index) => {
                    const item = parseExpiring(rawItem);
                    return (
                      <tr key={item.name + index} style={{ borderBottom: "1px solid #f1f5f9" }}>
                        <td className="fw-semibold py-2 text-truncate" style={{ color: "#334155", maxWidth: 160 }} title={item.name}>
                          {item.name}
                        </td>
                        <td className="text-center py-2">
                          <span className="badge bg-secondary-subtle text-secondary-emphasis border border-secondary-subtle px-2 py-1" style={{ fontSize: 11 }}>
                            {item.stockText || "—"}
                          </span>
                        </td>
                        <td className="text-end py-2">
                          <span className="badge bg-danger-subtle text-danger-emphasis border border-danger-subtle px-2 py-1" style={{ fontSize: 11 }}>
                            {item.weeksText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 text-end">
        <button
          type="button"
          className="btn btn-sm btn-link text-decoration-none p-0 fw-semibold"
          style={{ color: "#2aabe2", fontSize: 13 }}
          onClick={onKnowMore}
        >
          View Full Inventory
        </button>
      </div>
    </div>
  );
}

export default InventoryHealth;
