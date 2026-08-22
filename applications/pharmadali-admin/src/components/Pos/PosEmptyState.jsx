import React from "react";
import adminMedsIcon from "../../assets/icons/admin-meds.svg";

export default function PosEmptyState({
  minHeight = 260,
  iconWidth = 90,
  className = "",
  message = "Search for items",
}) {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center h-100 p-4 ${className}`.trim()}
      style={{ minHeight, padding: "28px 20px" }}
    >
      <img src={adminMedsIcon} alt="No items" width={iconWidth} className="mb-3" />
      <p className="mb-0 fw-medium" style={{ fontSize: 13, color: "#94a3b8" }}>
        {message}
      </p>
    </div>
  );
}
