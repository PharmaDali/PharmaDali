/**
 * Utility functions for generating sales report export files entirely on the frontend.
 */

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function escapeCell(val) {
  const str = String(val ?? "");
  return str.includes(",") || str.includes('"') || str.includes("\n")
    ? `"${str.replace(/"/g, '""')}"`
    : str;
}

const getLogoDataUrl = () => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width || 452;
      canvas.height = img.height || 369;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = "/pharmadali_favicon.svg";
  });
};

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
 * Builds a PDF document from the export data and downloads it.
 *
 * @param {{ date_range: string, total_amount: string, orders: object[] }} data
 */
export async function openSalesPdf(data) {
  const orders = data.orders ?? [];
  const now = new Date();
  const generatedOn = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) + 
                      " " + 
                      now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const totalTransactions = orders.length;
  const totalItemsSold = orders.reduce((sum, order) => sum + (Number(order.total_items) || 0), 0);
  
  // Calculate Average Transaction safely
  const totalAmountNum = parseFloat(data.total_amount.replace(/,/g, '')) || 0;
  const averageTransaction = totalTransactions > 0 
    ? (totalAmountNum / totalTransactions).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0.00";

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Load Logo
  const logoDataUrl = await getLogoDataUrl();
  
  // Header Left
  if (logoDataUrl) {
    // 452x369 aspect ratio ~1.22
    // width 14.64mm, height 12mm
    doc.addImage(logoDataUrl, 'PNG', 14, 14, 14.64, 12);
    
    doc.setFontSize(16);
    doc.setTextColor(20, 20, 20); // Dark text
    doc.setFont("helvetica", "bold");
    doc.text("SALES REPORT", 31, 23); // Shifted right to make room for logo
  } else {
    doc.setFontSize(16);
    doc.setTextColor(20, 20, 20); // Dark text
    doc.setFont("helvetica", "bold");
    doc.text("SALES REPORT", 14, 22);
  }
  
  // Header Right
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text("PHARMADALI", pageWidth - 14, 18, { align: "right" });
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Pharmadali Management System", pageWidth - 14, 23, { align: "right" });
  
  // 1. Meta Box (Reporting Period, Type, Generated On, Currency)
  autoTable(doc, {
    head: [['Reporting Period', 'Report Type', 'Generated On', 'Currency']],
    body: [[
      data.date_range || 'All Time',
      'Detailed Sales Transactions',
      generatedOn,
      'Philippine Peso (PHP)'
    ]],
    startY: 35,
    theme: 'grid',
    headStyles: { fillColor: [243, 245, 247], textColor: [100, 100, 100], fontSize: 8, fontStyle: 'normal', lineColor: [220, 220, 220], lineWidth: 0.1 },
    bodyStyles: { fillColor: [243, 245, 247], textColor: [40, 40, 40], fontSize: 8, lineColor: [220, 220, 220], lineWidth: 0.1 },
    margin: { left: 14, right: 14 },
  });

  const finalY1 = doc.lastAutoTable.finalY;

  // 2. Summary Box (Total Sales, Transactions, Items Sold, Average)
  autoTable(doc, {
    head: [['TOTAL SALES', 'TOTAL TRANSACTIONS', 'TOTAL ITEMS SOLD', 'AVERAGE TRANSACTION']],
    body: [[
      `PHP ${data.total_amount}`,
      totalTransactions.toString(),
      totalItemsSold.toString(),
      `PHP ${averageTransaction}`
    ]],
    startY: finalY1 + 5,
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: [40, 40, 40], fontSize: 8, fontStyle: 'bold', lineColor: [220, 220, 220], lineWidth: 0.1 },
    bodyStyles: { fillColor: [255, 255, 255], textColor: [40, 40, 40], fontSize: 10, fontStyle: 'bold', lineColor: [220, 220, 220], lineWidth: 0.1 },
    didParseCell: function(cellData) {
      if (cellData.section === 'body' && cellData.column.index === 0) {
        cellData.cell.styles.fontSize = 12; // Make TOTAL SALES larger
      }
    },
    margin: { left: 14, right: 14 },
  });

  const finalY2 = doc.lastAutoTable.finalY;

  // Table Title
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  doc.text("Sales Transactions", 14, finalY2 + 15);

  // 3. Main Table
  const tableColumn = ["ORDER ID", "CHANNEL", "ITEMS", "PROCESSED BY", "UNIT PRICE", "TOTAL", "DATE"];
  const tableRows = [];

  orders.forEach((row) => {
    const channel = row.channel || "Walk-in";
    const totalNum = parseFloat(String(row.total_amount).replace(/,/g, '')) || 0;
    const itemsNum = Number(row.total_items) || 1;
    const unitPrice = row.unit_price 
      ? `PHP ${row.unit_price}` 
      : `PHP ${(totalNum / itemsNum).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    tableRows.push([
      row.order_number,
      channel,
      row.total_items,
      row.processed_by || "N/A",
      unitPrice,
      `PHP ${row.total_amount}`,
      row.completed_at
    ]);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: finalY2 + 18,
    theme: "plain",
    headStyles: { 
      fillColor: [240, 244, 248], 
      textColor: [20, 20, 20], 
      fontSize: 8, 
      fontStyle: 'bold',
      cellPadding: { top: 4, right: 4, bottom: 4, left: 4 }
    },
    bodyStyles: { 
      textColor: [40, 40, 40], 
      fontSize: 8,
      cellPadding: 4,
    },
    alternateRowStyles: {
      fillColor: [252, 253, 253] // Very subtle striping if any
    },
    didDrawCell: function(cellData) {
      // Add a subtle bottom border to each row
      if (cellData.section === 'body' || cellData.section === 'head') {
         doc.setDrawColor(230, 230, 230);
         doc.setLineWidth(0.1);
         doc.line(cellData.cell.x, cellData.cell.y + cellData.cell.height, cellData.cell.x + cellData.cell.width, cellData.cell.y + cellData.cell.height);
      }
    },
    margin: { left: 14, right: 14 },
  });

  const finalY3 = doc.lastAutoTable.finalY;

  // 4. Report Total Row (at bottom of table)
  autoTable(doc, {
    body: [[
      "REPORT TOTAL:",
      `PHP ${data.total_amount}`
    ]],
    startY: finalY3 + 8,
    theme: 'plain',
    bodyStyles: {
      fillColor: [238, 242, 246], // Light blue/grey
      textColor: [20, 20, 20],
      fontSize: 9,
      fontStyle: 'bold',
      cellPadding: 6,
    },
    columnStyles: {
      0: { halign: 'left' },
      1: { halign: 'right' }
    },
    margin: { left: 14, right: 14 },
  });

  // 5. Page Footer
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      "Generated automatically by PharmaDali Pharmacy Management System",
      14,
      doc.internal.pageSize.getHeight() - 14
    );
  }

  // Save the PDF
  doc.save(`sales_report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
