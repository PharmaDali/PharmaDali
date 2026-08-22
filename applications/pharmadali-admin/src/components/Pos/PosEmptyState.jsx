import React from "react";
import adminMedsIcon from "../../assets/icons/admin-meds.svg";

export default function PosEmptyState({
  minHeight = 260,
  iconWidth = 150,
  className = "",
  message = "Search for items",
}) {
  return (
    <div
      className={`d-flex flex-column align-items-center justify-content-center h-100 ${className}`.trim()}
      style={{ minHeight }}
    >
      <img src={adminMedsIcon} alt="No items" width={iconWidth} className="mb-2" />
      <p className="mb-0" style={{ fontSize: 13, color: "#b5bec8" }}>
        {message}
      </p>
    </div>
  );
}
