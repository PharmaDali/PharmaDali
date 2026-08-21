import React from "react";
import Skeleton from "./Skeleton";

export function ChartSkeleton({ height = 280, title = "Loading Chart Data..." }) {
  return (
    <div className="pd-chart-skeleton-wrap d-flex flex-column h-100">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <Skeleton width={160} height={18} className="mb-1" />
          <Skeleton width={220} height={12} />
        </div>
        <Skeleton variant="pill" width={110} height={32} />
      </div>
      <div
        className="d-flex align-items-end justify-content-between gap-2 px-2 flex-grow-1"
        style={{ minHeight: height, borderBottom: "2px solid #e2e8f0" }}
      >
        {Array.from({ length: 7 }).map((_, index) => {
          const randomHeights = [40, 65, 30, 85, 50, 90, 70];
          const barHeight = `${randomHeights[index % randomHeights.length]}%`;
          return (
            <div key={`chart-bar-${index}`} className="d-flex flex-column align-items-center flex-grow-1 gap-2 h-100 justify-content-end">
              <Skeleton
                variant="rectangular"
                width="70%"
                height={barHeight}
                style={{ maxHeight: "80%", minHeight: 30 }}
              />
              <Skeleton width="60%" height={10} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ChartSkeleton;
