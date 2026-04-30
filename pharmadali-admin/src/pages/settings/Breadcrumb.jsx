export const Breadcrumb = ({ crumbs, onNavigate }) => (
  <nav className="settings-breadcrumb">
    {crumbs.map((crumb, i) => {
      const isLast = i === crumbs.length - 1;
      return (
        <span key={i} className="d-flex align-items-center gap-2">
          {i !== 0 && <span className="settings-breadcrumb-separator" style={{ color: "#48aad9", margin: "0 0.5rem", fontWeight: "400" }}>&rsaquo;</span>}
          {isLast ? (
            <span className="settings-breadcrumb-current" style={{ color: "#48aad9", fontWeight: "700" }}>{crumb.label}</span>
          ) : (
            <button
              className="settings-breadcrumb-link"
              onClick={() => (crumb.onClick ? crumb.onClick() : onNavigate(crumb.view))}
              style={{ color: "#48aad9", opacity: 0.8, fontWeight: "600", background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: "inherit" }}
            >
              {crumb.label}
            </button>
          )}
        </span>
      );
    })}
  </nav>
);
