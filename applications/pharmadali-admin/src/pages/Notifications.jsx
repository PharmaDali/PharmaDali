import React from "react";
import { useNotificationsPage, TAB_CATEGORIES } from "../hooks/useNotificationsPage";
import NotificationDetail from "../components/Notifications/NotificationDetail";
import NotificationCardItem from "../components/Notifications/NotificationCardItem";
import { ListSkeleton } from "../shared/components/loading";
import Pagination from "../shared/components/Pagination";

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
    paginatedNotifications,
    currentPage,
    totalPages,
    visiblePageNumbers,
    handlePageChange,
    handleTabChange,
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
      <header className="mb-4">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div>
            <h4 className="notifications-page-title mb-1">Notifications</h4>
            <p className="notifications-page-subtitle mb-0">
              Real -time pharmacy alerts, stocks, threshold warnings, and system updates.
            </p>
          </div>
          {unreadCount > 0 && (
            <div className="header-unread-badge d-flex align-items-center gap-1">
              <i className="fa-regular fa-bell" />
              <span>{unreadCount} Unread</span>
            </div>
          )}
        </div>
      </header>

      {/* Bootstrap Filter Nav Pills */}
      <div className="nav nav-pills notifications-nav-pills gap-2 mb-3">
        {TAB_CATEGORIES.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = categoryCounts[tab.id] || 0;

          return (
            <button
              key={tab.id}
              type="button"
              className={`nav-link position-relative ${isActive ? "active" : ""}`}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.icon && <i className={`fa-solid ${tab.icon}`} />}
              <span>{tab.label}</span>
              {count > 0 && (
                <>
                  <span className="badge-count ms-1 d-none d-md-inline-block">{count}</span>
                  <span className="mobile-notif-dot d-md-none"></span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Action Buttons (Aligned Right Below Tabs) */}
      <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
        {unreadCount > 0 && (
          <button
            type="button"
            className="btn btn-sm d-inline-flex align-items-center gap-1 rounded-pill px-3 py-1"
            style={{ fontSize: "0.8rem", fontWeight: "600", color: "#2aabe2", backgroundColor: "#ffffff", border: "1px solid #2aabe2" }}
            onClick={markAllAsRead}
          >
            <i className="fa-solid fa-circle-check" />
            <span>Mark all as read</span>
          </button>
        )}

        {unreadNotifications.length > 0 && (
          <button
            type="button"
            className="btn btn-sm d-inline-flex align-items-center gap-1 rounded-pill px-3 py-1"
            style={{ fontSize: "0.8rem", fontWeight: "600", color: "#ef4444", backgroundColor: "#ffffff", border: "1px solid #ef4444" }}
            onClick={() => {
              if (window.confirm("Are you sure you want to delete all notifications?")) {
                deleteAllNotifications();
              }
            }}
          >
            <i className="fa-regular fa-trash-can" />
            <span>Delete all</span>
          </button>
        )}
      </div>

      {/* Notifications Card List Container */}
      <div className="d-flex flex-column gap-3">
        {loading ? (
          <ListSkeleton count={4} />
        ) : paginatedNotifications.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-4 text-center py-5">
            <div className="card-body py-4">
              <h6 className="fw-semibold text-dark mb-1">No notifications found</h6>
              <p className="text-muted small mb-0">There are no alerts in this category right now.</p>
            </div>
          </div>
        ) : (
          <>
            {paginatedNotifications.map((item) => (
              <NotificationCardItem
                key={item.id}
                item={item}
                onSelect={setSelectedNotification}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
              />
            ))}

            {/* Pagination Footer */}
            {!loading && filteredNotifications.length > 0 && (
              <div className="p-3 bg-transparent border-0 mt-2">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredNotifications.length}
                  itemsPerPage={10}
                  onPageChange={handlePageChange}
                  visiblePageNumbers={visiblePageNumbers}
                  ariaLabel="Notifications table pagination"
                />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default Notifications;