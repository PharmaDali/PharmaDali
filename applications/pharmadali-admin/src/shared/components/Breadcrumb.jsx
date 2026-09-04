import React from "react";
import { useNavigate } from "react-router-dom";

export const Breadcrumb = ({ crumbs = [], onNavigate, className = "" }) => {
  const navigate = useNavigate();

  const handleClick = (crumb) => {
    if (crumb.onClick) {
      crumb.onClick();
    } else if (crumb.to || crumb.path) {
      navigate(crumb.to || crumb.path);
    } else if (onNavigate && crumb.view) {
      onNavigate(crumb.view);
    }
  };

  return (
    <nav className={`app-breadcrumb ${className}`.trim()} aria-label="Breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="d-inline-flex align-items-center">
            {i !== 0 && (
              <span className="app-breadcrumb-separator" aria-hidden="true">
                &rsaquo;
              </span>
            )}
            {isLast ? (
              <span className="app-breadcrumb-current" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <button
                type="button"
                className="app-breadcrumb-link"
                onClick={() => handleClick(crumb)}
              >
                {crumb.label}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
