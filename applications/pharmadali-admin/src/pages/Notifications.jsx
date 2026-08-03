import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

// ─── Alert Category Configurations ─────────────────────────────────────────────
const TYPE_META = {
  "Low Stocks": {
    label: "Stocks",
    fullTitle: "Low Stocks Alert",
    color: "#2aabe2",
    bgClass: "alert-badge-stocks",
    icon: "fa-boxes-stacked",
  },
  "Shortage Alert": {
    label: "Shortage",
    fullTitle: "Shortage Warning",
    color: "#ef4444",
    bgClass: "alert-badge-shortage",
    icon: "fa-triangle-exclamation",
  },
  "Expiry Warning": {
    label: "Expiring",
    fullTitle: "Expiry Notice",
    color: "#f59e0b",
    bgClass: "alert-badge-expiry",
    icon: "fa-clock",
  },
  "System Alert": {
    label: "Alerts",
    fullTitle: "System Alert",
    color: "#6b7280",
    bgClass: "alert-badge-system",
    icon: "fa-circle-info",
  },
};

/**
 * Normalizes backend notification type (handles PHP class names like App\Notifications\AdminAlertNotification)
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
  { id: "Expiry Warning", label: "Expiring", typeFilter: "Expiry Warning", icon: "fa-clock" },
  { id: "Shortage Alert", label: "Shortage", typeFilter: "Shortage Alert", icon: "fa-triangle-exclamation" },
  { id: "System Alert", label: "Alerts", typeFilter: "System Alert", icon: "fa-circle-info" },
];

// ─── Detail View Component ───────────────────────────────────────────────────
function NotificationDetail({ notification, onBack, onMarkAsRead, onDelete }) {
  const typeKey = resolveNotificationType(notification);
  const meta = getMeta(typeKey);
  const isRead = Boolean(notification.read_at);

  const handleMarkRead = () => {
    onMarkAsRead(notification.id);
  };

  const handleDelete = () => {
    onDelete(notification.id);
    onBack();
  };

  return (
    <section className="py-2">
      <button
        type="button"
        className="btn btn-link p-0 mb-4 d-inline-flex align-items-center gap-2 text-decoration-none fw-semibold"
        style={{ color: "#2aabe2" }}
        onClick={onBack}
      >
        <i className="fa-solid fa-arrow-left" />
        <span>Back to Notifications</span>
      </button>

      <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
          <div className="d-flex align-items-center gap-2">
            <span className={`alert-badge ${meta.bgClass}`}>
              <i className={`fa-solid ${meta.icon}`} />
              {meta.fullTitle}
            </span>
            {isRead ? (
              <span className="badge bg-light text-muted border">Read</span>
            ) : (
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle">Unread</span>
            )}
          </div>

          <span className="text-muted small d-flex align-items-center gap-1">
            <i className="fa-solid fa-clock text-muted" />
            {notification.dateTime || "Just now"}
          </span>
        </div>

        <h4 className="fw-bold mb-4 text-dark" style={{ lineHeight: 1.4 }}>
          {notification.message || notification.data?.message}
        </h4>

        {notification.data && (notification.data.product_name || notification.data.current_stock !== undefined) && (
          <div className="p-3 rounded-3 mb-4 bg-light border">
            <div className="row g-3 text-sm">
              {notification.data.product_name && (
                <div className="col-6 col-md-3">
                  <span className="text-muted d-block small">Product Name</span>
                  <span className="fw-bold text-dark">{notification.data.product_name}</span>
                </div>
              )}
              {notification.data.current_stock !== undefined && (
                <div className="col-6 col-md-3">
                  <span className="text-muted d-block small">Current Stock Level</span>
                  <span className="fw-bold text-danger">{notification.data.current_stock} units</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="d-flex gap-2 flex-wrap pt-3 border-top mt-3">
          {!isRead && (
            <button
              type="button"
              className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 px-3 py-2 rounded-3"
              style={{ backgroundColor: "#2aabe2", borderColor: "#2aabe2" }}
              onClick={handleMarkRead}
            >
              <i className="fa-solid fa-circle-check" />
              Mark as Read
            </button>
          )}
          <button
            type="button"
            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 px-3 py-2 rounded-3"
            onClick={handleDelete}
          >
            <i className="fa-solid fa-trash-can" />
            Delete Notification
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Notification Card Item Component ──────────────────────────────────────────
function NotificationCardItem({ item, onSelect, onMarkAsRead, onDelete }) {
  const typeKey = resolveNotificationType(item);
  const meta = getMeta(typeKey);
  const isUnread = !item.read_at;

  const currentStock = item.data?.current_stock ?? item.current_stock;
  const productName = item.data?.product_name ?? item.product_name;

  return (
    <div
      onClick={() => onSelect(item)}
      className={`notification-card ${isUnread ? "is-unread" : "is-read"}`}
    >
      <div className="d-flex align-items-start gap-3">
        {/* Category Avatar Icon */}
        <div
          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
          style={{
            width: "42px",
            height: "42px",
            backgroundColor: isUnread ? "#eef8fc" : "#f1f5f9",
            color: meta.color,
            fontSize: "16px",
          }}
        >
          <i className={`fa-solid ${meta.icon}`} />
        </div>

        {/* Content Body */}
        <div className="flex-grow-1 min-w-0">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-1">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              {/* Category Badge */}
              <span className={`alert-badge ${meta.bgClass}`}>
                <i className={`fa-solid ${meta.icon}`} />
                {meta.label}
              </span>

              {/* Stock Info Pill */}
              {currentStock !== undefined && currentStock !== null && (
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill">
                  Stock: {currentStock} units
                </span>
              )}

              {!isUnread && (
                <span className="badge bg-light text-muted border" style={{ fontSize: "0.7rem" }}>
                  Read
                </span>
              )}
            </div>

            {/* Unread Status & Timestamp */}
            <div className="d-flex align-items-center gap-2">
              {isUnread && <span className="unread-pulse" title="Unread notification" />}
              <span className="text-muted small">
                <i className="fa-solid fa-clock me-1 text-muted" />
                {item.dateTime || "Just now"}
              </span>
            </div>
          </div>

          {/* Main Message */}
          <h6 className={`mb-1 ${isUnread ? "fw-bold text-dark" : "fw-normal text-secondary"}`}>
            {item.message || item.data?.message}
          </h6>

          {productName && (
            <span className="text-muted small">
              Product: <strong className="text-dark">{productName}</strong>
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="d-flex gap-1 align-items-center ms-2 flex-shrink-0">
          {isUnread && (
            <button
              type="button"
              className="btn-action-icon"
              title="Mark as read"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(item.id);
              }}
            >
              <i className="fa-solid fa-circle-check" style={{ fontSize: "14px" }} />
            </button>
          )}
          <button
            type="button"
            className="btn-action-icon btn-delete"
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
          >
            <i className="fa-solid fa-trash-can" style={{ fontSize: "14px" }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Notifications Component ─────────────────────────────────────────────
function Notifications() {
  const { notifications } = useOutletContext();
  const { unreadNotifications = [], unreadCount = 0, loading, markAsRead, markAllAsRead, deleteNotification } = notifications;

  const [activeTab, setActiveTab] = useState("All");
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Compute category unread counts
  const categoryCounts = useMemo(() => {
    const counts = { All: unreadCount };
    TAB_CATEGORIES.forEach((cat) => {
      if (cat.typeFilter) {
        counts[cat.id] = unreadNotifications.filter(
          (n) => !n.read_at && resolveNotificationType(n) === cat.typeFilter
        ).length;
      }
    });
    return counts;
  }, [unreadNotifications, unreadCount]);

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
            <h4 className="notifications-page-title mb-0">Notifications</h4>
            {unreadCount > 0 && (
              <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 fw-semibold">
                <i className="fa-solid fa-bell me-1" />
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="notifications-page-subtitle mb-0">
            Real-time pharmacy alerts, stock threshold warnings, and system updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 rounded-3 px-3 py-2"
            onClick={markAllAsRead}
          >
            <i className="fa-solid fa-circle-check text-success" />
            <span>Mark all as read</span>
          </button>
        )}
      </header>

      {/* Bootstrap Filter Nav Pills */}
      <div className="nav nav-pills notifications-nav-pills gap-2 mb-4">
        {TAB_CATEGORIES.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = categoryCounts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              type="button"
              className={`nav-link ${isActive ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedNotification(null);
              }}
            >
              <i className={`fa-solid ${tab.icon}`} />
              <span>{tab.label}</span>
              {count > 0 && <span className="badge-count ms-1">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Notifications Card List Container */}
      <div className="d-flex flex-column gap-3">
        {loading ? (
          <div className="text-center py-5 bg-white rounded-4 border shadow-sm">
            <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
            <span className="text-muted small">Loading notifications…</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-4 text-center py-5">
            <div className="card-body py-4">
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