import React, { useEffect } from "react";

const padRight = (str, len) => (String(str) + " ".repeat(len)).slice(0, len);
const padLeft = (str, len) => (" ".repeat(len) + String(str)).slice(-len);
const centerText = (str, width = 25) => {
  const text = String(str || "");
  if (text.length >= width) return text.slice(0, width);
  const leftPadding = Math.floor((width - text.length) / 2);
  return " ".repeat(leftPadding) + text;
};

// Word-wrapping function for product names and footer text in 58mm receipts
const wrapText = (text, maxLen = 10) => {
  if (!text) return [];
  const words = String(text).trim().split(/\s+/);
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    if ((currentLine + (currentLine ? " " : "") + word).length <= maxLen) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      if (currentLine) lines.push(currentLine);
      if (word.length > maxLen) {
        let remaining = word;
        while (remaining.length > maxLen) {
          lines.push(remaining.slice(0, maxLen));
          remaining = remaining.slice(maxLen);
        }
        currentLine = remaining;
      } else {
        currentLine = word;
      }
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
};

const generatePlainTextReceipt = (receiptData, width = 25) => {
  const pharmacy = receiptData?.pharmacy || {};
  const settings = receiptData?.receipt_settings || {};
  const invoice = receiptData?.invoice || {};
  const items = receiptData?.items || [];
  const discount = receiptData?.discount || {};
  const totals = receiptData?.totals || {};
  const payment = receiptData?.payment || {};

  const pharmacyName = pharmacy.name || "PharmaDali";
  const defaultFooter = `Thank you for choosing ${pharmacyName}! Get well soon.`;
  const rawFooter = settings.footer ? settings.footer : defaultFooter;

  const headerText = settings.header || pharmacyName;
  const showDiscount = settings.show_discount ?? true;
  const showVat = settings.show_vat_breakdown ?? true;

  const lineSep = "-".repeat(width);
  const doubleLineSep = "=".repeat(width);

  const lines = [];

  // Header
  lines.push(doubleLineSep);
  lines.push(centerText(headerText, width));
  if (pharmacy.address) lines.push(centerText(pharmacy.address, width));
  if (pharmacy.contact_number) lines.push(centerText(`Tel: ${pharmacy.contact_number}`, width));
  if (pharmacy.tin) lines.push(centerText(`TIN: ${pharmacy.tin}`, width));
  lines.push(doubleLineSep);

  // Metadata
  lines.push(`Receipt: ${invoice.invoice_no || "POS-ORDER"}`);
  lines.push(`Date   : ${invoice.date || ""}`);
  lines.push(`Cashier: ${invoice.cashier || "Cashier"}`);
  lines.push(`Client : ${invoice.customer || "Walk-in"}`);
  lines.push(lineSep);

  // Items Header: QTY(3) ITEM NAME(10) PRICE(6) TOTAL(6) = 25 cols (safe right margin)
  lines.push(padRight("QTY", 3) + padRight("ITEM NAME", 10) + padLeft("PRICE", 6) + padLeft("TOTAL", 6));
  lines.push(lineSep);

  items.forEach((item) => {
    const qtyStr = padRight(`${item.qty}x`, 3);
    const priceStr = padLeft((item.unit_price || 0).toFixed(2), 6);
    const totalStr = padLeft((item.line_total || 0).toFixed(2), 6);
    const nameLines = wrapText(item.name || "", 10);

    if (nameLines.length === 0) {
      lines.push(qtyStr + padRight("", 10) + priceStr + totalStr);
    } else {
      // First line includes QTY, first chunk of product name, PRICE, and TOTAL
      lines.push(qtyStr + padRight(nameLines[0], 10) + priceStr + totalStr);
      // Remaining product name lines are printed on subsequent lines indented under ITEM NAME
      for (let i = 1; i < nameLines.length; i++) {
        lines.push(padRight("", 3) + padRight(nameLines[i], 10));
      }
    }
  });

  lines.push(lineSep);

  // Financial Breakdown (formatted to 25 cols max for generous 58mm margin safety)
  const formatTotalLine = (label, valStr) => {
    const spaceForVal = width - label.length;
    return label + padLeft(valStr, Math.max(1, spaceForVal));
  };

  const subtotalVal = Number(totals.subtotal || 0).toFixed(2);
  lines.push(formatTotalLine("Subtotal:", subtotalVal));

  if (showDiscount && (discount.amount > 0 || discount.type !== "None")) {
    const discLabel = `Discount (${discount.type}):`;
    const discVal = "-" + Number(discount.amount || 0).toFixed(2);
    lines.push(formatTotalLine(discLabel, discVal));
  }

  if (discount.id_number) {
    lines.push(formatTotalLine("Discount ID:", String(discount.id_number)));
  }

  if (showVat) {
    const netVal = Number(totals.net_subtotal || 0).toFixed(2);
    const vatVal = Number(totals.vat_amount || 0).toFixed(2);
    lines.push(formatTotalLine("VATable:", netVal));
    lines.push(formatTotalLine("VAT 12%:", vatVal));
  }

  lines.push(lineSep);
  const totalVal = Number(totals.total_amount || 0).toFixed(2);
  lines.push(formatTotalLine("TOTAL:", totalVal));
  lines.push(lineSep);

  // Payment Breakdown
  const paymentMethodStr = String(payment.method || "Cash");
  const receivedVal = Number(payment.amount_received || 0).toFixed(2);
  const changeVal = Number(payment.change_amount || 0).toFixed(2);

  lines.push(formatTotalLine("Payment:", paymentMethodStr));
  lines.push(formatTotalLine("Received:", receivedVal));
  lines.push(formatTotalLine("Change:", changeVal));
  lines.push(doubleLineSep);

  // Dynamic Footer Message (wrapped to 25 cols)
  const footerLines = wrapText(rawFooter, width);
  footerLines.forEach((fLine) => {
    lines.push(centerText(fLine, width));
  });
  lines.push(centerText("*** OFFICIAL RECEIPT ***", width));
  lines.push(doubleLineSep);
  lines.push("\n\n");

  return lines.join("\n");
};

export const PosReceiptModal = ({ receiptData, onPrintCompleted }) => {
  useEffect(() => {
    if (!receiptData) return;

    // Formatted for 58mm roll width (25 character columns with right margin padding)
    const plainTextContent = generatePlainTextReceipt(receiptData, 25);

    // Create an invisible iframe for direct plain text thermal printing
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;

    const receiptHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt 58mm</title>
  <style>
    @page {
      size: 58mm auto;
      margin: 0mm;
    }
    body, pre {
      font-family: 'Courier New', Courier, monospace !important;
      font-size: 10.5px !important;
      font-weight: bold !important;
      line-height: 1.2 !important;
      color: #000000 !important;
      background: #ffffff !important;
      margin: 0 !important;
      padding: 1mm 1.5mm 1.5mm 1mm !important;
      white-space: pre !important;
    }
  </style>
</head>
<body><pre>${plainTextContent}</pre></body>
</html>`;

    doc.open();
    doc.write(receiptHtml);
    doc.close();

    const timer = setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error("58mm plain text print error:", err);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          if (onPrintCompleted) {
            onPrintCompleted();
          }
        }, 1000);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    };
  }, [receiptData, onPrintCompleted]);

  return null;
};

export default PosReceiptModal;
