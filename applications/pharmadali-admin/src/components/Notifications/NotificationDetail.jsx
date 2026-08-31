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

      <div className="card border-0 shadow-sm p-3 p-md-5 bg-white notification-detail-card" style={{ borderRadius: "12px" }}>
        <div className="d-flex flex-column flex-md-row align-items-md-start justify-content-between gap-2 mb-3">
          
          {/* Timestamp: Top Right on Mobile, Right on Desktop */}
          <div className="d-flex justify-content-end order-1 order-md-2 mb-1 mb-md-0">
            <span className="text-dark d-flex align-items-center gap-2 fw-semibold detail-timestamp-text">
              <i className="fa-regular fa-clock" />
              {displayTime}
            </span>
          </div>

          {/* Badges: Below Timestamp on Mobile, Left on Desktop */}
          <div className="d-flex align-items-center gap-2 order-2 order-md-1">
            <span className="detail-category-badge">
              {meta.fullTitle}
            </span>
          </div>

        </div>

        <h4 className="fw-bold mb-4 text-dark detail-main-text" style={{ lineHeight: 1.4 }}>
          {notification.message || notification.data?.message}
        </h4>

        {(productName || currentStock !== undefined || daysOfStock !== undefined) && (
          <div className="p-3 mb-4" style={{ backgroundColor: "#f8fafc", borderRadius: "8px" }}>
            <div className="row g-3">
              {productName && (
                <div className="col-12 col-md-4">
                  <span className="d-block mb-1 detail-label-text" style={{ color: "#475569" }}>Product Name</span>
                  <span className="fw-bold text-dark detail-value-text">{productName}</span>
                </div>
              )}
              {currentStock !== undefined && (
                <div className="col-12 col-md-4">
                  <span className="d-block mb-1 detail-label-text" style={{ color: "#475569" }}>Current Stock</span>
                  <span className="fw-bold text-danger detail-value-text">{currentStock} Units</span>
                </div>
              )}
              {daysOfStock !== undefined && (
                <div className="col-12 col-md-4">
                  <span className="d-block mb-1 detail-label-text" style={{ color: "#475569" }}>Stock Forecast</span>
                  <span className="fw-bold detail-value-text" style={{ color: "#854d0e" }}>
                    Will last less than {daysOfStock <= 1 ? "1 day" : "7 days"} ({daysOfStock} days left)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="d-flex gap-2 gap-md-3 flex-nowrap flex-md-wrap pt-3 mt-2 justify-content-center justify-content-md-start w-100" style={{ borderTop: "1px solid #e2e8f0" }}>
          <button
            type="button"
            className="detail-btn-delete d-inline-flex align-items-center justify-content-center gap-1 gap-md-2 flex-grow-1 flex-md-grow-0"
            onClick={handleDelete}
          >
            <i className="fa-solid fa-trash" />
            Delete Notifications
          </button>
        </div>
      </div>
    </section>
  );
}

export default NotificationDetail;
