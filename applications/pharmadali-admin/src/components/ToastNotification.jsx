import { useEffect } from "react";

const TYPE_META = {
  "Low Stocks": {
    color: "#2563eb",
    bg: "#eff6ff",
    border: "#bfdbfe",
    badgeBg: "#dbeafe",
    badgeText: "#1e40af",
    icon: "fa-boxes-stacked",
  },
  "Shortage Alert": {
    color: "#dc2626",
    bg: "#fef2f2",
    border: "#fecaca",
    badgeBg: "#fee2e2",
    badgeText: "#991b1b",
    icon: "fa-triangle-exclamation",
  },
  "Expiry Warning": {
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fde68a",
    badgeBg: "#fef3c7",
    badgeText: "#92400e",
    icon: "fa-hourglass-half",
  },
  "System Alert": {
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    badgeBg: "#ede9fe",
    badgeText: "#5b21b6",
    icon: "fa-bell",
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
      style={{ zIndex: 1080, maxWidth: "420px", width: "100%" }}
    >
      <div
        className="card border-0 shadow-lg overflow-hidden animate__animated animate__fadeInRight"
        style={{
          borderRadius: "14px",
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
                width: "42px",
                height: "42px",
                backgroundColor: meta.bg,
                color: meta.color,
                fontSize: "18px",
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
                    fontSize: "0.72rem",
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
                className="mb-0 text-dark fw-semibold"
                style={{ fontSize: "0.88rem", lineHeight: 1.35 }}
              >
                {toast.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              type="button"
              className="btn-close text-muted ms-auto flex-shrink-0"
              style={{ fontSize: "0.8rem" }}
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
