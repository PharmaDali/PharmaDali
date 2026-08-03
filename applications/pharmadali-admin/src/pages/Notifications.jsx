import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

// ─── Type Metadata & Styling Configuration ─────────────────────────────────────
const TYPE_META = {
  "Low Stocks": {
    label: "Low Stocks",
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    badgeBg: "#dbeafe",
    badgeText: "#1e40af",
    icon: "fa-boxes-stacked",
    gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
  },
  "Shortage Alert": {
    label: "Shortage Alert",
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    badgeBg: "#fee2e2",
    badgeText: "#991b1b",
    icon: "fa-triangle-exclamation",
    gradient: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
  },
  "Expiry Warning": {
    label: "Expiry Warning",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    badgeBg: "#fef3c7",
    badgeText: "#92400e",
    icon: "fa-hourglass-half",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  },
  "System Alert": {
    label: "System Alert",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    badgeBg: "#ede9fe",
    badgeText: "#5b21b6",
    icon: "fa-bell",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
  },
};

/**
 * Safely resolves the notification type string.
 * Handles cases where type is a raw Laravel PHP class name (e.g. App\Notifications\AdminAlertNotification)
 */
const resolveNotificationType = (item) => {
  if (!item) return "System Alert";
  let t = item.type || item.data?.type || "System Alert";
  if (typeof t === "string" && (t.includes("\\") || t.startsWith("App"))) {
    t = item.data?.type || item.alertType || "System Alert";
  }
  return TYPE_META[t] ? t : "System Alert";
};

const getMeta = (typeKey) => TYPE_META[typeKey] ?? TYPE_META["System Alert"];

const TAB_CATEGORIES = [
  { id: "All", label: "Primary", typeFilter: null, icon: "fa-star" },
  { id: "Low Stocks", label: "Stocks", typeFilter: "Low Stocks", icon: "fa-boxes-stacked" },
  { id: "Expiry Warning", label: "Expiring", typeFilter: "Expiry Warning", icon: "fa-hourglass-half" },
  { id: "Shortage Alert", label: "Shortage", typeFilter: "Shortage Alert", icon: "fa-triangle-exclamation" },
  { id: "System Alert", label: "System Alert", typeFilter: "System Alert", icon: "fa-shield-halved" },
];

// ─── Detail View Component ───────────────────────────────────────────────────
function NotificationDetail({ notification, onBack, onMarkAsRead, onDelete }) {
  const typeKey = resolveNotificationType(notification);
  const meta = getMeta(typeKey);

  const handleMarkRead = () => {
    onMarkAsRead(notification.id);
    onBack();
  };

  const handleDelete = () => {
    onDelete(notification.id);
    onBack();
  };

  return (
    <section className="py-2">
      <button
        type="button"
        className="btn btn-link p-0 mb-4 d-inline-flex align-items-center gap-2 text-decoration-none fw-semibold text-dark"
        onClick={onBack}
      >
        <i className="fa-solid fa-arrow-left" style={{ fontSize: "14px" }} />
        <span>Back to Notifications</span>
      </button>

      <div className="notification-detail-card">
        <div
          className="notification-detail-header-bar"
          style={{ background: meta.gradient }}
        />

        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
          <span
            className="alert-type-pill"
            style={{
              backgroundColor: meta.badgeBg,
              color: meta.badgeText,
              border: `1px solid ${meta.border}`,
            }}
          >
            <i className={`fa-solid ${meta.icon}`} />
            {typeKey}
          </span>

          <span className="text-muted small d-flex align-items-center gap-1">
            <i className="fa-regular fa-clock" />
            {notification.dateTime || "Just now"}
          </span>
        </div>

        <h3 className="fw-bold mb-4 text-dark" style={{ lineHeight: 1.4 }}>
          {notification.message || notification.data?.message}
        </h3>

        {notification.data && notification.data.product_name && (
          <div className="p-3 rounded-3 mb-4 border" style={{ backgroundColor: "#f8fafc" }}>
            <div className="row g-2 text-sm">
              <div className="col-6 col-md-3">
                <span className="text-muted d-block small">Product</span>
                <span className="fw-semibold text-dark">{notification.data.product_name}</span>
              </div>
              {notification.data.current_stock !== undefined && (
                <div className="col-6 col-md-3">
                  <span className="text-muted d-block small">Current Stock</span>
                  <span className="fw-semibold text-danger">{notification.data.current_stock} units</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="d-flex gap-2 flex-wrap pt-3 border-top mt-4">
          {!notification.read_at && (
            <button
              type="button"
              className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 px-3"
              onClick={handleMarkRead}
            >
              <i className="fa-regular fa-circle-check" />
              Mark as Read
            </button>
          )}
          <button
            type="button"
            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 px-3"
            onClick={handleDelete}
          >
            <i className="fa-regular fa-trash-can" />
            Delete Notification
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Table Row Component ──────────────────────────────────────────────────────
function NotificationRow({ item, onSelect, onMarkAsRead, onDelete }) {
  const typeKey = resolveNotificationType(item);
  const meta = getMeta(typeKey);
  const isUnread = !item.read_at;

  return (
    <tr
      onClick={() => onSelect(item)}
      className="align-middle notification-row"
      style={{ cursor: "pointer", backgroundColor: isUnread ? "#ffffff" : "#fcfcfd" }}
    >
      {/* Unread Indicator */}
      <td className="ps-3 pe-2" style={{ width: "24px" }}>
        {isUnread && (
          <span
            className="unread-indicator-dot"
            style={{ backgroundColor: meta.color }}
            title="Unread"
          />
        )}
      </td>

      {/* Alert Type Badge */}
      <td style={{ width: "160px" }}>
        <span
          className="alert-type-pill"
          style={{
            backgroundColor: meta.badgeBg,
            color: meta.badgeText,
            border: `1px solid ${meta.border}`,
          }}
        >
          <i className={`fa-solid ${meta.icon}`} />
          {typeKey}
        </span>
      </td>

      {/* Message */}
      <td>
        <span
          className="d-block text-truncate"
          style={{
            color: isUnread ? "#0f172a" : "#475569",
            fontWeight: isUnread ? 600 : 400,
            maxWidth: "580px",
          }}
        >
          {item.message || item.data?.message}
        </span>
      </td>

      {/* Date & Time */}
      <td className="text-nowrap text-muted small" style={{ width: "170px" }}>
        {item.dateTime || "Just now"}
      </td>

      {/* Quick Actions */}
      <td className="pe-3 text-end" style={{ width: "80px" }}>
        <div className="d-flex gap-1 justify-content-end align-items-center">
          {isUnread && (
            <button
              type="button"
              className="notification-action-btn"
              title="Mark as read"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(item.id);
              }}
            >
              <i className="fa-regular fa-circle-check" style={{ fontSize: 13 }} />
            </button>
          )}
          <button
            type="button"
            className="notification-action-btn btn-delete"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
          >
            <i className="fa-regular fa-trash-can" style={{ fontSize: 13 }} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Notifications Component ─────────────────────────────────────────────
function Notifications() {
  const { notifications } = useOutletContext();
  const { unreadNotifications = [], loading, markAsRead, markAllAsRead, deleteNotification } = notifications;

  const [activeTab, setActiveTab] = useState("All");
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Compute category unread notification counts
  const categoryCounts = useMemo(() => {
    const counts = { All: unreadNotifications.length };
    TAB_CATEGORIES.forEach((cat) => {
      if (cat.typeFilter) {
        counts[cat.id] = unreadNotifications.filter(
          (n) => resolveNotificationType(n) === cat.typeFilter
        ).length;
      }
    });
    return counts;
  }, [unreadNotifications]);

  // Filter notifications based on active tab
  const filteredNotifications = useMemo(() => {
    const activeCategory = TAB_CATEGORIES.find((cat) => cat.id === activeTab);
    if (!activeCategory || !activeCategory.typeFilter) {
      return unreadNotifications;
    }
    return unreadNotifications.filter(
      (n) => resolveNotificationType(n) === activeCategory.typeFilter
    );
  }, [activeTab, unreadNotifications]);

  if (selectedNotification) {
    return (
      <NotificationDetail
        notification={selectedNotification}
        onBack={() => setSelectedNotification(null)}
        onMarkAsRead={markAsRead}
        onDelete={deleteNotification}
      />
    );
  }

  return (
    <section className="py-2">
      {/* Header */}
      <header className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h4 className="fw-bold mb-0 text-dark">Notifications</h4>
            {unreadNotifications.length > 0 && (
              <span className="notifications-title-badge">
                <i className="fa-solid fa-bell" />
                {unreadNotifications.length} Unread
              </span>
            )}
          </div>
          <p className="text-muted small mb-0">
            Real-time inventory alerts, shortage warnings, and system notifications.
          </p>
        </div>

        {unreadNotifications.length > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 rounded-3 px-3 py-2"
            onClick={markAllAsRead}
          >
            <i className="fa-regular fa-circle-check text-success" />
            <span>Mark all as read</span>
          </button>
        )}
      </header>

      {/* Filter Tabs */}
      <div className="notifications-nav-tabs mb-3">
        {TAB_CATEGORIES.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = categoryCounts[tab.id] || 0;
          const tabMeta = tab.typeFilter ? getMeta(tab.typeFilter) : null;

          return (
            <button
              key={tab.id}
              type="button"
              className={`notifications-nav-item ${isActive ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedNotification(null);
              }}
            >
              <i className={`fa-regular ${tab.icon}`} />
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className="tab-badge"
                  style={{
                    backgroundColor: isActive
                      ? (tabMeta ? tabMeta.color : "#2563eb")
                      : "#e2e8f0",
                    color: isActive ? "#ffffff" : "#475569",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications Table Card */}
      <div className="notifications-card">
        <div className="table-responsive">
          <table className="table notification-table mb-0">
            <thead>
              <tr>
                <th style={{ width: "24px" }} />
                <th style={{ width: "160px" }}>Alert Type</th>
                <th>Notification Message</th>
                <th style={{ width: "170px" }}>Date &amp; Time</th>
                <th className="text-end" style={{ width: "80px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
                    <span className="text-muted small">Loading notifications…</span>
                  </td>
                </tr>
              ) : filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5">
                    <div className="py-3">
                      <i className="fa-regular fa-bell-slash text-muted fs-3 mb-2 d-block" />
                      <p className="text-muted small mb-0">No notifications found for this category.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((item) => (
                  <NotificationRow
                    key={item.id}
                    item={item}
                    onSelect={setSelectedNotification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export default Notifications;