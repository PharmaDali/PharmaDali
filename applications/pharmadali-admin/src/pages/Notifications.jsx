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

        {notification.data && (notification.data.product_name || notification.data.current_stock !== undefined) && (
          <div className="p-3 rounded-3 mb-4 border" style={{ backgroundColor: "#f8fafc" }}>
            <div className="row g-3 text-sm">
              {notification.data.product_name && (
                <div className="col-6 col-md-3">
                  <span className="text-muted d-block small">Product Name</span>
                  <span className="fw-bold text-dark fs-6">{notification.data.product_name}</span>
                </div>
              )}
              {notification.data.current_stock !== undefined && (
                <div className="col-6 col-md-3">
                  <span className="text-muted d-block small">Current Stock Level</span>
                  <span className="fw-bold text-danger fs-6">{notification.data.current_stock} units</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="d-flex gap-2 flex-wrap pt-3 border-top mt-4">
          {!notification.read_at && (
            <button
              type="button"
              className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 px-3 py-2 rounded-3"
              onClick={handleMarkRead}
            >
              <i className="fa-regular fa-circle-check" />
              Mark as Read
            </button>
          )}
          <button
            type="button"
            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 px-3 py-2 rounded-3"
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

// ─── Rich Notification Card Component ──────────────────────────────────────────
function NotificationCardItem({ item, onSelect, onMarkAsRead, onDelete }) {
  const typeKey = resolveNotificationType(item);
  const meta = getMeta(typeKey);
  const isUnread = !item.read_at;

  const currentStock = item.data?.current_stock ?? (item.current_stock);
  const productName = item.data?.product_name ?? (item.product_name);

  return (
    <div
      onClick={() => onSelect(item)}
      className={`notification-card-item ${isUnread ? "unread" : "read"}`}
    >
      <div className="d-flex align-items-start gap-3">
        {/* Category Avatar Icon */}
        <div
          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
          style={{
            width: "48px",
            height: "48px",
            backgroundColor: meta.bg,
            color: meta.color,
            fontSize: "20px",
            border: `1px solid ${meta.border}`,
          }}
        >
          <i className={`fa-solid ${meta.icon}`} />
        </div>

        {/* Content Body */}
        <div className="flex-grow-1 min-w-0">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {/* Category Pill */}
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

              {/* Product / Stock Info Pill */}
              {currentStock !== undefined && currentStock !== null && (
                <span
                  className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle"
                  style={{ fontSize: "0.75rem", fontWeight: 600 }}
                >
                  <i className="fa-solid fa-layer-group me-1" />
                  Stock: {currentStock}
                </span>
              )}
            </div>

            {/* Unread Status & Timestamp */}
            <div className="d-flex align-items-center gap-2">
              {isUnread && <span className="unread-pulse-dot" title="Unread notification" />}
              <span className="text-muted small" style={{ fontSize: "0.8rem" }}>
                <i className="fa-regular fa-clock me-1" />
                {item.dateTime || "Just now"}
              </span>
            </div>
          </div>

          {/* Main Message Title */}
          <h6
            className={`mb-1 ${isUnread ? "fw-bold text-dark" : "fw-medium text-secondary"}`}
            style={{ fontSize: "0.95rem", lineHeight: 1.4 }}
          >
            {item.message || item.data?.message}
          </h6>

          {productName && (
            <p className="text-muted mb-0 small" style={{ fontSize: "0.82rem" }}>
              Product: <span className="fw-semibold text-dark">{productName}</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="d-flex gap-1 align-items-center ms-2 flex-shrink-0">
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
              <i className="fa-regular fa-circle-check" style={{ fontSize: 14 }} />
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
            <i className="fa-regular fa-trash-can" style={{ fontSize: 14 }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Notifications Page ──────────────────────────────────────────────────
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
      {/* Page Header */}
      <header className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h4 className="fw-bold mb-0 text-dark">Notifications</h4>
            {unreadNotifications.length > 0 && (
              <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fw-semibold" style={{ fontSize: "0.78rem" }}>
                <i className="fa-solid fa-bell me-1" />
                {unreadNotifications.length} Unread
              </span>
            )}
          </div>
          <p className="text-muted small mb-0">
            Real-time pharmacy alerts, stock threshold warnings, and system updates.
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

      {/* Filter Nav Tabs */}
      <div className="notifications-nav-tabs mb-4">
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

      {/* Notifications Rich Card List Container */}
      <div className="notifications-container">
        {loading ? (
          <div className="text-center py-5 bg-white rounded-4 border">
            <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
            <span className="text-muted small">Loading notifications…</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border">
            <div className="py-4">
              <i className="fa-regular fa-bell-slash text-muted fs-2 mb-3 d-block" />
              <h6 className="fw-semibold text-dark mb-1">No notifications found</h6>
              <p className="text-muted small mb-0">There are no alerts in this category right now.</p>
            </div>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <NotificationCardItem
              key={item.id}
              item={item}
              onSelect={setSelectedNotification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default Notifications;