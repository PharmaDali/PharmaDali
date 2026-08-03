import { useEffect } from "react";

const TYPE_META = {
  "Low Stocks": {
    title: "Low Stock Alert",
    color: "#2aabe2",
    bg: "#eef8fc",
    badgeBg: "#2aabe2",
    badgeText: "#ffffff",
    icon: "fa-boxes-stacked",
  },
  "Shortage Alert": {
    title: "Inventory Shortage Alert",
    color: "#ef4444",
    bg: "#fef2f2",
    badgeBg: "#ef4444",
    badgeText: "#ffffff",
    icon: "fa-triangle-exclamation",
  },
  "Expiry Warning": {
    title: "Product Expiry Notice",
    color: "#f59e0b",
    bg: "#fffbeb",
    badgeBg: "#f59e0b",
    badgeText: "#ffffff",
    icon: "fa-clock",
  },
  "System Alert": {
    title: "System Alert",
    color: "#6b7280",
    bg: "#f3f4f6",
    badgeBg: "#6b7280",
    badgeText: "#ffffff",
    icon: "fa-circle-info",
  },
};

const getMeta = (type) => TYPE_META[type] ?? TYPE_META["System Alert"];

const sanitizeMessage = (msg) => {
  if (!msg) return "A new inventory update is available.";
  if (msg.includes("\\") || msg.startsWith("App")) {
    return "You have received a new pharmacy update.";
  }
  return msg;
};

function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const typeKey = toast.type || toast.data?.type || "System Alert";
  const meta = getMeta(typeKey);
  const friendlyMessage = sanitizeMessage(toast.message || toast.data?.message);

  return (
    <div
      className="position-fixed top-0 end-0 p-3"
      style={{ zIndex: 1080, maxWidth: "420px", width: "100%" }}
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
            {/* Category Avatar Icon */}
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: "42px",
                height: "42px",
                backgroundColor: meta.bg,
                color: meta.color,
                fontSize: "18px",
              }}
            >
              <i className={`fa-solid ${meta.icon}`} />
            </div>

            {/* Content Body */}
            <div className="flex-grow-1 min-w-0">
              <div className="d-flex align-items-center justify-content-between mb-1">
                <span
                  className="badge rounded-pill"
                  style={{
                    backgroundColor: meta.badgeBg,
                    color: meta.badgeText,
                    fontSize: "0.72rem",
                    fontWeight: 600,
                  }}
                >
                  {meta.title}
                </span>
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                  Just now
                </span>
              </div>
              <p
                className="mb-0 text-dark fw-medium"
                style={{ fontSize: "0.88rem", lineHeight: 1.4 }}
              >
                {friendlyMessage}
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
