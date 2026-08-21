import React from "react";
import "../../../assets/css/loading-system.css";

export function Skeleton({
  variant = "text",
  width,
  height,
  borderRadius,
  className = "",
  style = {},
  ...props
}) {
  const variantClass =
    variant === "circular"
      ? "pd-skeleton-circular"
      : variant === "rectangular"
      ? "pd-skeleton-rectangular"
      : variant === "pill"
      ? "pd-skeleton-pill"
      : "pd-skeleton-text";

  const computedStyle = {
    width: width !== undefined ? width : undefined,
    height: height !== undefined ? height : undefined,
    borderRadius: borderRadius !== undefined ? borderRadius : undefined,
    ...style,
  };

  return (
    <span
      className={`pd-skeleton ${variantClass} ${className}`}
      style={computedStyle}
      aria-hidden="true"
      {...props}
    />
  );
}

export default Skeleton;
