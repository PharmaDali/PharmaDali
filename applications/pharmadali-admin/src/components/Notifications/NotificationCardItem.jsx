import React from "react";
import { resolveNotificationType, getMeta } from "../../hooks/useNotificationsPage";

export function NotificationCardItem({ item, onSelect, onMarkAsRead, onDelete }) {
  const typeKey = resolveNotificationType(item);
  const meta = getMeta(typeKey);
  const isUnread = !item.read_at;

  const currentStock = item.data?.current_stock ?? item.current_stock;
  const rawDays = item.data?.days_of_stock ?? item.days_of_stock;
  const daysOfStock = rawDays !== undefined && rawDays !== null ? rawDays : (meta.label === "Stocks" ? 7 : undefined);
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

              {/* Predicted Days Remaining Pill */}
              {daysOfStock !== undefined && daysOfStock !== null && (
                <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill">
                  <i className="fa-solid fa-clock me-1" />
                  Will last less than {daysOfStock <= 1 ? "1 day" : "7 days"} ({daysOfStock}d remaining)
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

export default NotificationCardItem;
