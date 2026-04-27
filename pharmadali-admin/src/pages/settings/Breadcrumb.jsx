export const Breadcrumb = ({ crumbs, onNavigate }) => (
  <nav className="settings-breadcrumb">
    {crumbs.map((crumb, i) => {
      const isLast = i === crumbs.length - 1;
      return (
        <span key={i} className="d-flex align-items-center gap-2">
          {i !== 0 && <span className="settings-breadcrumb-separator">&rsaquo;</span>}
          {isLast ? (
            <span className="settings-breadcrumb-current">{crumb.label}</span>
          ) : (
            <button
              className="settings-breadcrumb-link"
              onClick={() => onNavigate(crumb.view)}
            >
              {crumb.label}
            </button>
          )}
        </span>
      );
    })}
  </nav>
);
