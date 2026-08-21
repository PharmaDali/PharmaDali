/**
 * Formats a value as Philippine Peso (PHP).
 * @param {number|string} val
 * @returns {string} 
 */
export const formatCurrency = (val) => {
  return `PHP ${Number(val).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};


export const formatNumber = (val) => {
  return `${Number(val).toLocaleString()} units`;
};

/**
 * Formats a date string into a human readable format (e.g. Aug 21, 2026, 4:05 PM).
 * @param {string|Date} dateString
 * @returns {string}
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return String(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return String(dateString);
  }
};

/**
 * Robustly extracts and formats a customer name from an order object.
 * @param {Object} order
 * @returns {string}
 */
export const formatCustomerName = (order) => {
  if (!order) return "Customer";

  if (order.customer_name && String(order.customer_name).trim()) {
    return String(order.customer_name).trim();
  }

  const u = order.customer?.user || order.user || order.customer;
  if (u) {
    if (u.first_name || u.last_name) {
      const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim();
      if (fullName) return fullName;
    }
    if (u.name && String(u.name).trim()) return String(u.name).trim();
    if (u.full_name && String(u.full_name).trim()) return String(u.full_name).trim();
    if (u.email) return u.email.split("@")[0];
  }

  if (order.billing_first_name || order.billing_last_name) {
    const billingName = `${order.billing_first_name || ""} ${order.billing_last_name || ""}`.trim();
    if (billingName) return billingName;
  }

  if (order.first_name || order.last_name) {
    const directName = `${order.first_name || ""} ${order.last_name || ""}`.trim();
    if (directName) return directName;
  }

  return "Customer";
};

/**
 * Extracts contact number from an order object.
 * @param {Object} order
 * @returns {string}
 */
export const formatCustomerPhone = (order) => {
  if (!order) return "";
  const raw = (
    order.customer_phone ||
    order.customer?.user?.mobile_number ||
    order.customer?.user?.phone ||
    order.user?.mobile_number ||
    order.user?.phone ||
    order.customer?.mobile_number ||
    order.customer?.phone ||
    order.phone ||
    ""
  );
  return (raw === "—" || raw === "--") ? "" : raw;
};
