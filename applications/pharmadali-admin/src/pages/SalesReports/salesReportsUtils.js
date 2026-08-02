/**
 * Utility functions for generating sales report export files entirely on the frontend.
 */

/**
 * Escapes a single CSV cell value per RFC 4180.
 * @param {*} val
 * @returns {string}
 */
function escapeCell(val) {
  const str = String(val ?? "");
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str;
}

/**
 * Builds a CSV string from the export data returned by the backend and
 * triggers a browser file download.
 *
 * @param {{ date_range: string, total_amount: string, orders: object[] }} data
 */
export function downloadSalesCsv(data) {
  const headers = ["Order ID", "Total Items", "Processed By", "Total Amount (PHP)", "Date Completed", "Items Breakdown"];

  const rows = (data.orders ?? []).map((row) =>
    [
      row.order_number,
      row.total_items,
      row.processed_by,
      row.total_amount,
      row.completed_at,
      row.items_breakdown ?? "",
    ]
      .map(escapeCell)
      .join(",")
  );

  // UTF-8 BOM + header + data rows
  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Builds a print-ready HTML document from the export data and opens it in
 * a new tab. The tab auto-triggers window.print() on load.
 *
 * @param {{ date_range: string, total_amount: string, orders: object[] }} data
 */
export function openSalesPdf(data) {
  const orders = data.orders ?? [];
  const generatedOn = new Date().toISOString().slice(0, 16).replace("T", " ");

  const tableRows = orders
    .map(
      (row) => `
        <tr>
          <td>${row.order_number}</td>
          <td>${row.total_items}</td>
          <td>${row.processed_by}</td>
          <td>PHP ${row.total_amount}</td>
          <td>${row.completed_at}</td>
        </tr>`
    )
    .join("");

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Sales Report</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 30px; font-size: 13px; }
    .header { margin-bottom: 30px; }
    .title { font-size: 24px; color: #2aabe2; font-weight: bold; margin-bottom: 5px; }
    .subtitle { color: #666; font-size: 12px; }
    .meta { margin-bottom: 20px; color: #555; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #96D2EE; color: #333; font-weight: bold; padding: 10px; text-align: left; }
    td { padding: 10px; border-bottom: 1px solid #e0e0e0; }
    tr:nth-child(even) td { background: #fafafa; }
    .total { text-align: right; font-weight: bold; font-size: 15px; margin-top: 20px; color: #2aabe2; }
    .footer { margin-top: 50px; text-align: center; color: #aaa; font-size: 10px; }
    @media print { body { margin: 20px; } button { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">Sales Report</div>
    <div class="subtitle">PharmaDali Pharmacy Management System</div>
  </div>
  <div class="meta">
    <strong>Date Range:</strong> ${data.date_range}<br>
    <strong>Generated On:</strong> ${generatedOn}
  </div>
  <table>
    <thead>
      <tr>
        <th>Order ID</th>
        <th>Items</th>
        <th>Processed By</th>
        <th>Total</th>
        <th>Date</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="total">TOTAL: PHP ${data.total_amount}</div>
  <div class="footer">Generated automatically by PharmaDali.</div>
  <script>window.onload = function() { window.print(); }<\/script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const printWindow = window.open(url, "_blank");
  if (!printWindow) {
    alert("Please allow popups to print/save PDF.");
  }
}
