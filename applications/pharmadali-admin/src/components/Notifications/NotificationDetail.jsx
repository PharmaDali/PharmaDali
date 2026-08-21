import React from "react";
import { resolveNotificationType, getMeta } from "../../hooks/useNotificationsPage";

export function NotificationDetail({ notification, onBack, onMarkAsRead, onDelete }) {
  const typeKey = resolveNotificationType(notification);
  const meta = getMeta(typeKey);
  const isRead = Boolean(notification.read_at);

  const rawDays = notification.data?.days_of_stock ?? notification.days_of_stock;
  const daysOfStock = rawDays !== undefined && rawDays !== null ? rawDays : (meta.label === "Stocks" ? 7 : undefined);
  const currentStock = notification.data?.current_stock ?? notification.current_stock;
  const productName = notification.data?.product_name ?? notification.product_name;

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

        {(productName || currentStock !== undefined || daysOfStock !== undefined) && (
          <div className="p-3 rounded-3 mb-4 bg-light border">
            <div className="row g-3 text-sm">
              {productName && (
                <div className="col-6 col-md-4">
                  <span className="text-muted d-block small">Product Name</span>
                  <span className="fw-bold text-dark">{productName}</span>
                </div>
              )}
              {currentStock !== undefined && (
                <div className="col-6 col-md-4">
                  <span className="text-muted d-block small">Current Stock</span>
                  <span className="fw-bold text-danger">{currentStock} units</span>
                </div>
              )}
              {daysOfStock !== undefined && (
                <div className="col-6 col-md-4">
                  <span className="text-muted d-block small">Stock Forecast</span>
                  <span className="fw-bold text-warning-emphasis">Will last less than {daysOfStock <= 1 ? "1 day" : "7 days"} ({daysOfStock} days left)</span>
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

export default NotificationDetail;
