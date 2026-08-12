import React from "react";
import "../../assets/css/loading-system.css";

export function PageLoader({
  title = "Gathering your pharmacy data...",
  subtitle = "Please wait a moment while we update your workspace.",
  iconClass = "fa-solid fa-notes-medical",
  minHeight = 320,
}) {
  return (
    <div className="pd-page-loader-wrap" style={{ minHeight }}>
      <div className="pd-loader-pulse-icon">
        <i className={iconClass} aria-hidden="true" />
      </div>
      <h6 className="pd-page-loader-title">{title}</h6>
      <p className="pd-page-loader-sub mb-0">{subtitle}</p>
    </div>
  );
}

export default PageLoader;
