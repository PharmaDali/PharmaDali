import React from "react";
import "./WavingDots.css";

export function WavingDots({ color = "#94a3b8", size = "8px" }) {
  return (
    <span className="waving-dots-loader" aria-label="Loading metric...">
      <span style={{ backgroundColor: color, width: size, height: size }} />
      <span style={{ backgroundColor: color, width: size, height: size }} />
      <span style={{ backgroundColor: color, width: size, height: size }} />
    </span>
  );
}

export default WavingDots;
