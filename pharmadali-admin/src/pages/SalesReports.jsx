
import { useState } from "react";
import calendarIcon from "../assets/icons/sale-and-reports/calendar.svg";
import pdfIcon from "../assets/icons/sale-and-reports/pdf-icon.svg";
import printIcon from "../assets/icons/sale-and-reports/print.svg";

const REVENUE_CARDS = [
  { label: "Daily Sales", amount: "20,003", currency: "PHP" },
  { label: "Weekly Sales", amount: "20,003", currency: "PHP" },
  { label: "Monthly Sales", amount: "20,003", currency: "PHP" },
  { label: "Total Transactions", amount: "20,003" },
];

const SALES_ROWS = [
  {
    id: "ORD-1025",
    items: 6,
    processedBy: "Denmar Redondo",
    total: "120.00",
    date: "2026-01-01 10:03",
    orderItems: [
      { name: "Amoxicillin Amoxil 500mg Caps", qty: 2, price: 20.00, subtotal: 40.00 },
      { name: "Paracetamol Biogesic 500mg", qty: 2, price: 20.00, subtotal: 40.00 },
      { name: "Cetirizine Ceticit 10mg", qty: 1, price: 20.00, subtotal: 20.00 },
      { name: "Vitamin C Poten Cee", qty: 1, price: 20.00, subtotal: 20.00 },
    ],
  },
  {
    id: "ORD-1026",
    items: 3,
    processedBy: "Denmar Redondo",
    total: "30.00",
    date: "2026-01-01 10:04",
    orderItems: [
      { name: "Aspirin 500mg", qty: 3, price: 10.00, subtotal: 30.00 },
    ],
  },
  {
    id: "ORD-1027",
    items: 1,
    processedBy: "Denmar Redondo",
    total: "70.00",
    date: "2026-01-01 10:13",
    orderItems: [
      { name: "Ibuprofen 400mg", qty: 1, price: 70.00, subtotal: 70.00 },
    ],
  },
  {
    id: "ORD-1028",
    items: 3,
    processedBy: "Denmar Redondo",
    total: "39.00",
    date: "2026-01-01 10:13",
    orderItems: [
      { name: "Loratadine 10mg", qty: 3, price: 13.00, subtotal: 39.00 },
    ],
  },
  {
    id: "ORD-1029",
    items: 1,
    processedBy: "Denmar Redondo",
    total: "215.00",
    date: "2026-01-01 10:20",
    orderItems: [
      { name: "Omeprazole 20mg", qty: 1, price: 215.00, subtotal: 215.00 },
    ],
  },
  {
    id: "ORD-1030",
    items: 5,
    processedBy: "Denmar Redondo",
    total: "50.00",
    date: "2026-01-01 10:29",
    orderItems: [
      { name: "Vitamin B Complex", qty: 5, price: 10.00, subtotal: 50.00 },
    ],
  },
  {
    id: "ORD-1031",
    items: 30,
    processedBy: "Denmar Redondo",
    total: "390.00",
    date: "2026-01-01 10:43",
    orderItems: [
      { name: "Cough Syrup 100ml", qty: 30, price: 13.00, subtotal: 390.00 },
    ],
  },
  {
    id: "ORD-1032",
    items: 7,
    processedBy: "Denmar Redondo",
    total: "830.00",
    date: "2026-01-01 10:44",
    orderItems: [
      { name: "Amoxicillin Amoxil 500mg Caps", qty: 7, price: 118.57, subtotal: 830.00 },
    ],
  },
  {
    id: "ORD-1033",
    items: 10,
    processedBy: "Denmar Redondo",
    total: "30.00",
    date: "2026-01-01 10:55",
    orderItems: [
      { name: "Paracetamol 500mg", qty: 10, price: 3.00, subtotal: 30.00 },
    ],
  },
  {
    id: "ORD-1034",
    items: 3,
    processedBy: "Denmar Redondo",
    total: "189.00",
    date: "2026-01-01 11:03",
    orderItems: [
      { name: "Metformin 500mg", qty: 3, price: 63.00, subtotal: 189.00 },
    ],
  },
];

function SalesReports() {
  const [selectedRow, setSelectedRow] = useState(null);

  const handleRowClick = (row, index) => {
    setSelectedRow({ ...row, rowIndex: index });
  };

  const totalAmount = SALES_ROWS.reduce((sum, row) => sum + parseFloat(row.total), 0);

  return (
    <section>
      <header className="admin-page-header">
        <h4 className="fw-bold mb-1 admin-page-title">Sales &amp; Report</h4>
        <p className="admin-page-subtitle">Sales and reports related to the pharmacy.</p>
      </header>

      <div className="mt-4">
        <h2 className="fw-semibold section-title">Sales Summary</h2>
        <div className="summary-cards">
          {REVENUE_CARDS.map((card) => (
            <div key={card.label} className="summary-card">
              <div className="summary-label fw-medium">{card.label}</div>
              <div className="summary-value">
                {card.currency ? (
                  <span className="summary-currency">{card.currency}</span>
                ) : null}
                <span className="summary-amount">{card.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="report-card">
          <div className="report-header">
            <h3 className="report-title">Sales Report</h3>
            <div className="report-tools">
              <div className="report-filters">
                <div className="report-input">
                  <input type="text" placeholder="Start Date - Time" />
                  <img src={calendarIcon} alt="calendar" className="report-input-icon" />
                </div>
                <div className="report-input">
                  <input type="text" placeholder="End Date - Time" />
                  <img src={calendarIcon} alt="calendar" className="report-input-icon" />
                </div>
              </div>
              <div className="report-actions">
                <button className="report-action" type="button">
                  <img src={pdfIcon} alt="pdf" className="report-action-icon" />
                  <span>PDF</span>
                </button>
                <button className="report-action" type="button">
                  <img src={printIcon} alt="print" className="report-action-icon" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>

          <div className="report-table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Items</th>
                  <th>Processed By</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {SALES_ROWS.map((row, index) => (
                  <tr
                    key={`${row.id}-${index}`}
                    onClick={() => handleRowClick(row, index)}
                    style={{
                      cursor: "pointer",
                      backgroundColor: selectedRow?.id === row.id && selectedRow?.rowIndex === index ? "#d9d9d9" : "transparent",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    <td>{row.id}</td>
                    <td>{row.items}</td>
                    <td>{row.processedBy}</td>
                    <td>{row.total}</td>
                    <td>{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="report-total" style={{ color: "#48AAD9" }}>
            <span>TOTAL</span>
            <strong>{totalAmount.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {selectedRow && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setSelectedRow(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "32px",
              maxWidth: "800px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedRow(null)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#999",
              }}
            >
              ✕
            </button>

            <h2 style={{ color: "#48AAD9", marginBottom: "24px", fontSize: "24px", fontWeight: "600" }}>
              Transaction Details
            </h2>

            <hr style={{ borderColor: "#e0e0e0", marginBottom: "20px" }} />

            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ color: "#666", fontSize: "14px" }}>Order ID</span>
                <span style={{ fontSize: "16px", fontWeight: "600" }}>{selectedRow.id}</span>
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px", gap: "16px", marginBottom: "12px" }}>
                <div style={{ fontWeight: "600", fontSize: "14px", color: "#666" }}>Items</div>
                <div style={{ fontWeight: "600", fontSize: "14px", color: "#666", textAlign: "right" }}>Qty</div>
                <div style={{ fontWeight: "600", fontSize: "14px", color: "#666", textAlign: "right" }}>Price</div>
                <div style={{ fontWeight: "600", fontSize: "14px", color: "#666", textAlign: "right" }}>Subtotal</div>
              </div>

              {selectedRow.orderItems?.map((item, idx) => (
                <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 80px", gap: "16px", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid #f0f0f0" }}>
                  <div style={{ fontSize: "14px" }}>{item.name}</div>
                  <div style={{ textAlign: "right", fontSize: "14px" }}>{item.qty}</div>
                  <div style={{ textAlign: "right", fontSize: "14px" }}>{item.price.toFixed(2)}</div>
                  <div style={{ textAlign: "right", fontSize: "14px" }}>{item.subtotal.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <hr style={{ borderColor: "#e0e0e0", marginBottom: "20px" }} />

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", fontSize: "16px", fontWeight: "600" }}>
              <span>TOTAL</span>
              <span>{parseFloat(selectedRow.total).toFixed(2)}</span>
            </div>

            <hr style={{ borderColor: "#e0e0e0", marginBottom: "20px" }} />

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#666", fontSize: "14px" }}>Processed By</span>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>{selectedRow.processedBy}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#666", fontSize: "14px" }}>Date</span>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>{selectedRow.date}</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default SalesReports;
