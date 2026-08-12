import React from "react";
import Skeleton from "./Skeleton";

export function ListSkeleton({ count = 4 }) {
  return (
    <div className="d-flex flex-column gap-3 w-100">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`list-skel-${index}`}
          className="p-3 bg-white rounded-3 border shadow-sm d-flex align-items-center justify-content-between gap-3"
        >
          <div className="d-flex align-items-center gap-3 flex-grow-1">
            <Skeleton variant="circular" width={40} height={40} className="flex-shrink-0" />
            <div className="d-flex flex-column gap-1 flex-grow-1">
              <Skeleton width="45%" height={15} />
              <Skeleton width="75%" height={12} />
            </div>
          </div>
          <Skeleton width={60} height={12} className="flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function QuickInsightSkeleton({ count = 4 }) {
  return (
    <div className="d-flex flex-column gap-2 w-100 py-1">
      {Array.from({ length: count }).map((_, index) => (
        <div key={`qi-skel-${index}`} className="d-flex justify-content-between align-items-center py-2 border-bottom">
          <div className="d-flex flex-column gap-1 flex-grow-1 me-3">
            <Skeleton width="40%" height={11} />
            <Skeleton width="70%" height={15} />
          </div>
          <div className="d-flex flex-column align-items-end gap-1" style={{ minWidth: 60 }}>
            <Skeleton width={50} height={15} />
            <Skeleton width={35} height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ListSkeleton;
