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
  
  const displayTime = item.dateTime || "Aug. 23, 2026 9:36 A.M";

  return (
    <div
      onClick={() => onSelect(item)}
      className={`notification-card ${isUnread ? "is-unread" : "is-read"}`}
    >
      <div className="d-flex flex-column gap-2">
        {/* Top Row: Badges and Actions */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          {/* Left: Badges */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className={`alert-badge ${meta.bgClass}`}>
              {meta.label}
            </span>

            {currentStock !== undefined && currentStock !== null && (
              <span className="alert-badge-stock-units">
                Stock: {currentStock} Units
              </span>
            )}

            {daysOfStock !== undefined && daysOfStock !== null && (
              <span className="alert-badge-warning">
                <i className="fa-regular fa-clock me-1" />
                Will last less than {daysOfStock <= 1 ? "1 day" : "7 days"} ({daysOfStock}d remaining)
              </span>
            )}
            
            {!isUnread && (
                <span className="badge bg-light text-muted border" style={{ fontSize: "0.7rem" }}>
                  Read
                </span>
            )}
          </div>

          {/* Right: Timestamp and Action Buttons */}
          <div className="d-flex align-items-center gap-3">
             <div className="d-flex align-items-center gap-1">
               {isUnread && <span className="unread-dot me-1" />}
               <span className="timestamp-text">
                 {displayTime}
               </span>
             </div>
             
             <div className="d-flex gap-2 align-items-center">
               <button
                  type="button"
                  className="card-action-btn"
                  title="Mark as read"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(item.id);
                  }}
                >
                  <i className="fa-solid fa-circle-check" />
                </button>
                <button
                  type="button"
                  className="card-action-btn"
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                >
                  <i className="fa-solid fa-trash-can" />
                </button>
             </div>
          </div>
        </div>

        {/* Message and Product Info */}
        <div className="mt-1">
          <p className={`mb-1 ${isUnread ? "fw-bold text-dark" : "fw-medium text-secondary"}`} style={{fontSize: "0.95rem"}}>
            {item.message || item.data?.message}
          </p>
          {productName && (
            <p className="text-muted small mb-0" style={{fontSize: "0.85rem"}}>
              Product: <span className="fw-semibold text-dark">{productName}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationCardItem;

