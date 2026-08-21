import React from "react";
import { useNotificationsPage, TAB_CATEGORIES } from "../hooks/useNotificationsPage";
import NotificationDetail from "../components/Notifications/NotificationDetail";
import NotificationCardItem from "../components/Notifications/NotificationCardItem";
import { ListSkeleton } from "../shared/components/loading";

export function Notifications() {
  const {
    unreadNotifications,
    unreadCount,
    loading,
    activeTab,
    setActiveTab,
    selectedNotification,
    setSelectedNotification,
    categoryCounts,
    filteredNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotificationsPage();

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

        <div className="d-flex align-items-center gap-2 flex-wrap">
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

          {unreadNotifications.length > 0 && (
            <button
              type="button"
              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 rounded-3 px-3 py-2"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete all notifications?")) {
                  deleteAllNotifications();
                }
              }}
            >
              <i className="fa-solid fa-trash-can" />
              <span>Delete all</span>
            </button>
          )}
        </div>
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
          <ListSkeleton count={4} />
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