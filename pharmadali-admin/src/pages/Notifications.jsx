import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";

// ─── Type Metadata ────────────────────────────────────────────────────────────
const TYPE_META = {
  "Low Stocks": {
    color: "#2aabe2",
    bg: "#d2edf8",
    icon: "fa-box-open",
    badgeClass: "text-info",
  },
  "Shortage Alert": {
    color: "#ef4444",
    bg: "#fde3e1",
    icon: "fa-triangle-exclamation",
    badgeClass: "text-danger",
  },
  "Expiry Warning": {
    color: "#f59e0b",
    bg: "#fdf0dd",
    icon: "fa-clock",
    badgeClass: "text-warning",
  },
  "System Alert": {
    color: "#6b7280",
    bg: "#eceaea",
    icon: "fa-circle-info",
    badgeClass: "text-secondary",
  },
};

const getMeta = (type) => TYPE_META[type] ?? TYPE_META["System Alert"];

const TAB_TYPE_MAP = {
  Primary: null,
  Stocks: "Low Stocks",
  Expiring: "Expiry Warning",
  Shortage: "Shortage Alert",
  "System Alert": "System Alert",
};

const TABS = Object.keys(TAB_TYPE_MAP);

// ─── Detail View ──────────────────────────────────────────────────────────────
function NotificationDetail({ notification, onBack, onMarkAsRead, onDelete }) {
  const meta = getMeta(notification.type);

  const handleMarkRead = () => {
    onMarkAsRead(notification.id);
    onBack();
  };

  const handleDelete = () => {
    onDelete(notification.id);
    onBack();
  };

  return (
    <section>
      <button
        type="button"
        className="btn btn-link p-0 mb-3 d-flex align-items-center gap-2 text-decoration-none fw-bold fs-5"
        style={{ color: "#23252b" }}
        onClick={onBack}
      >
        <i className="fa-solid fa-chevron-left" style={{ fontSize: "13px" }} />
        <span>Notifications</span>
      </button>

      <div
        className="rounded-3 p-4 p-md-5"
        style={{ backgroundColor: meta.bg, minHeight: "420px" }}
      >
        {/* Type badge */}
        <span
          className="badge rounded-pill mb-3"
          style={{ backgroundColor: meta.color, fontSize: "0.85rem" }}
        >
          <i className={`fa-solid ${meta.icon} me-1`} />
          {notification.type}
        </span>

        <p
          className="mb-4 fw-semibold"
          style={{ color: meta.color, fontSize: "clamp(1.4rem, 3vw, 2.2rem)", lineHeight: 1.3 }}
        >
          {notification.message}
        </p>

        <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
          <i className="fa-regular fa-clock me-1" />
          {notification.dateTime}
        </p>

        <div className="d-flex gap-2 flex-wrap mt-auto">
          {!notification.read_at && (
            <button
              type="button"
              className="btn btn-sm btn-light border"
              onClick={handleMarkRead}
            >
              <i className="fa-regular fa-circle-check me-1" />
              Mark as Read
            </button>
          )}
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={handleDelete}
          >
            <i className="fa-regular fa-trash-can me-1" />
            Delete
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function NotificationRow({ item, onSelect, onMarkAsRead, onDelete }) {
  const meta = getMeta(item.type);
  const isUnread = !item.read_at;

  return (
    <tr
      onClick={() => onSelect(item)}
      className="align-middle notification-row"
      style={{ cursor: "pointer" }}
    >
      {/* Unread indicator */}
      <td className="ps-3 pe-1" style={{ width: "28px" }}>
        {isUnread && (
          <span
            className="d-block rounded-circle"
            style={{ width: 8, height: 8, backgroundColor: meta.color }}
          />
        )}
      </td>

      {/* Icon */}
      <td style={{ width: "40px" }}>
        <span
          className="d-flex align-items-center justify-content-center rounded-circle"
          style={{
            width: 32,
            height: 32,
            backgroundColor: meta.bg,
            color: meta.color,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          <i className={`fa-solid ${meta.icon}`} />
        </span>
      </td>

      {/* Type */}
      <td style={{ width: "140px" }}>
        <span className="fw-semibold" style={{ color: meta.color, fontSize: "0.85rem" }}>
          {item.type}
        </span>
      </td>

      {/* Message */}
      <td>
        <span
          className="text-truncate d-block"
          style={{
            color: isUnread ? "#23252b" : "#666",
            fontWeight: isUnread ? 500 : 400,
            maxWidth: "520px",
            fontSize: "0.88rem",
          }}
        >
          {item.message}
        </span>
      </td>

      {/* Timestamp */}
      <td className="text-nowrap text-muted" style={{ fontSize: "0.78rem", width: "170px" }}>
        {item.dateTime}
      </td>

      {/* Actions */}
      <td className="pe-3" style={{ width: "64px" }}>
        <div className="d-flex gap-2 align-items-center">
          {isUnread && (
            <button
              type="button"
              className="btn btn-link p-0 text-muted notification-action-btn"
              title="Mark as read"
              onClick={(e) => { e.stopPropagation(); onMarkAsRead(item.id); }}
            >
              <i className="fa-regular fa-circle-check" style={{ fontSize: 13 }} />
            </button>
          )}
          <button
            type="button"
            className="btn btn-link p-0 text-muted notification-action-btn"
            title="Delete"
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
          >
            <i className="fa-regular fa-trash-can" style={{ fontSize: 13 }} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function Notifications() {
  const { notifications } = useOutletContext();
  const { unreadNotifications, loading, markAsRead, markAllAsRead, deleteNotification } = notifications;

  const [activeTab, setActiveTab] = useState("Primary");
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Tab counts (only from unread)
  const tabCounts = useMemo(() => {
    return TABS.reduce((acc, tab) => {
      const filterType = TAB_TYPE_MAP[tab];
      acc[tab] = filterType
        ? unreadNotifications.filter((n) => n.type === filterType).length
        : unreadNotifications.length;
      return acc;
    }, {});
  }, [unreadNotifications]);

  const filteredNotifications = useMemo(() => {
    const filterType = TAB_TYPE_MAP[activeTab];
    if (!filterType) return unreadNotifications;
    return unreadNotifications.filter((n) => n.type === filterType);
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
    <section>
      <header className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1 admin-page-title">Notifications</h4>
          <p className="admin-page-subtitle mb-0">Real-time pharmacy alerts and system updates.</p>
        </div>
        {unreadNotifications.length > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={markAllAsRead}
          >
            <i className="fa-regular fa-circle-check me-1" />
            Mark all as read
          </button>
        )}
      </header>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-0 border-bottom border-2" style={{ borderColor: "#86878f" }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          const count = tabCounts[tab];
          return (
            <li className="nav-item" key={tab}>
              <button
                type="button"
                className={`nav-link border-0 border-bottom border-2 rounded-0 ${isActive ? "fw-semibold" : "fw-medium text-muted"}`}
                style={{
                  borderBottomColor: isActive ? "var(--pd-primary)" : "transparent",
                  color: isActive ? "var(--pd-primary)" : undefined,
                  marginBottom: "-2px",
                }}
                onClick={() => { setActiveTab(tab); setSelectedNotification(null); }}
              >
                {tab === "Primary" && <i className="fa-regular fa-star me-1" />}
                {tab}
                {count > 0 && (
                  <span className="badge rounded-pill ms-1 text-white"
                    style={{ backgroundColor: getMeta(TAB_TYPE_MAP[tab] ?? "Low Stocks").color, fontSize: "0.65rem" }}>
                    {count}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Table */}
      <div className="table-responsive rounded-3 mt-2">
        <table className="table align-middle mb-0 notification-table">
          <thead>
            <tr>
              <th style={{ width: "28px" }} />
              <th style={{ width: "40px" }} />
              <th>Type</th>
              <th>Message</th>
              <th>Date &amp; Time</th>
              <th style={{ width: "64px" }} />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-5">
                  <div className="spinner-border spinner-border-sm text-secondary" role="status" />
                  <span className="ms-2 text-muted small">Loading notifications…</span>
                </td>
              </tr>
            ) : filteredNotifications.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted small">
                  No notifications for this category.
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
    </section>
  );
}

export default Notifications;