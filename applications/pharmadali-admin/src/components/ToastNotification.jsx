import { useEffect } from "react";

const TYPE_META = {
  "Low Stocks": {
    color: "#2aabe2",
    bg: "#eef8fc",
    badgeBg: "#2aabe2",
    badgeText: "#ffffff",
    icon: "fa-boxes-stacked",
  },
  "Shortage Alert": {
    color: "#ef4444",
    bg: "#fef2f2",
    badgeBg: "#ef4444",
    badgeText: "#ffffff",
    icon: "fa-triangle-exclamation",
  },
  "Expiry Warning": {
    color: "#f59e0b",
    bg: "#fffbeb",
    badgeBg: "#f59e0b",
    badgeText: "#ffffff",
    icon: "fa-clock",
  },
  "System Alert": {
    color: "#6b7280",
    bg: "#f3f4f6",
    badgeBg: "#6b7280",
    badgeText: "#ffffff",
    icon: "fa-circle-info",
  },
};

const getMeta = (type) => TYPE_META[type] ?? TYPE_META["System Alert"];

function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const meta = getMeta(toast.type);

  return (
    <div
      className="position-fixed top-0 end-0 p-3"
      style={{ zIndex: 1080, maxWidth: "400px", width: "100%" }}
    >
      <div
        className="card border-0 shadow-lg overflow-hidden"
        style={{
          borderRadius: "12px",
          background: "#ffffff",
          borderLeft: `5px solid ${meta.color}`,
        }}
      >
        <div className="card-body p-3">
          <div className="d-flex align-items-start gap-3">
            {/* Category Icon */}
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: meta.bg,
                color: meta.color,
                fontSize: "16px",
              }}
            >
              <i className={`fa-solid ${meta.icon}`} />
            </div>

            {/* Content */}
            <div className="flex-grow-1 min-w-0">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span
                  className="badge rounded-pill"
                  style={{
                    backgroundColor: meta.badgeBg,
                    color: meta.badgeText,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  {toast.type}
                </span>
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                  Just now
                </span>
              </div>
              <p
                className="mb-0 text-dark fw-medium"
                style={{ fontSize: "0.88rem", lineHeight: 1.35 }}
              >
                {toast.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              className="btn-close text-muted ms-auto flex-shrink-0"
              style={{ fontSize: "0.75rem" }}
              aria-label="Close"
              onClick={onClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ToastNotification;
