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

  const displayTime = notification.dateTime || "Aug. 23, 2026 9:36 A.M";

  return (
    <section className="py-2">
      <button
        type="button"
        className="btn btn-link p-0 mb-4 d-inline-flex align-items-center gap-2 text-decoration-none fw-bold"
        style={{ color: "#2aabe2", fontSize: "0.95rem" }}
        onClick={onBack}
      >
        <i className="fa-solid fa-arrow-left" />
        <span>Back to Notifications</span>
      </button>

      <div className="card border-0 shadow-sm p-4 p-md-5 bg-white" style={{ borderRadius: "12px" }}>
        <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
          <div className="d-flex align-items-center gap-2">
            <span className="detail-category-badge">
              {meta.fullTitle}
            </span>
            {isRead ? (
              <span className="detail-read-badge">Read</span>
            ) : (
              <span className="detail-unread-badge">Unread</span>
            )}
          </div>

          <span className="text-dark small d-flex align-items-center gap-2 fw-semibold" style={{ fontSize: "0.85rem" }}>
            <i className="fa-regular fa-clock" />
            {displayTime}
          </span>
        </div>

        <h4 className="fw-bold mb-4 text-dark" style={{ lineHeight: 1.4, fontSize: "1.3rem" }}>
          {notification.message || notification.data?.message}
        </h4>

        {(productName || currentStock !== undefined || daysOfStock !== undefined) && (
          <div className="p-3 mb-4" style={{ backgroundColor: "#f8fafc", borderRadius: "8px" }}>
            <div className="row g-3">
              {productName && (
                <div className="col-4">
                  <span className="d-block mb-1" style={{ fontSize: "0.85rem", color: "#475569" }}>Product Name</span>
                  <span className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>{productName}</span>
                </div>
              )}
              {currentStock !== undefined && (
                <div className="col-4">
                  <span className="d-block mb-1" style={{ fontSize: "0.85rem", color: "#475569" }}>Current Stock</span>
                  <span className="fw-bold text-danger" style={{ fontSize: "0.95rem" }}>{currentStock} Units</span>
                </div>
              )}
              {daysOfStock !== undefined && (
                <div className="col-4">
                  <span className="d-block mb-1" style={{ fontSize: "0.85rem", color: "#475569" }}>Stock Forecast</span>
                  <span className="fw-bold" style={{ fontSize: "0.95rem", color: "#854d0e" }}>
                    Will last less than {daysOfStock <= 1 ? "1 day" : "7 days"} ({daysOfStock} days left)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="d-flex gap-3 flex-wrap pt-3 mt-2" style={{ borderTop: "1px solid #e2e8f0" }}>
          {!isRead && (
            <button
              type="button"
              className="detail-btn-mark d-inline-flex align-items-center gap-2"
              onClick={handleMarkRead}
            >
              <i className="fa-solid fa-circle-check" />
              Mark as Read
            </button>
          )}
          <button
            type="button"
            className="detail-btn-delete d-inline-flex align-items-center gap-2"
            onClick={handleDelete}
          >
            <i className="fa-regular fa-trash-can" />
            Delete Notifications
          </button>
        </div>
      </div>
    </section>
  );
}

export default NotificationDetail;
