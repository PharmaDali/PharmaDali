import React from "react";
import Skeleton from "./Skeleton";

export function CardSkeleton({ count = 5 }) {
  return (
    <div className="row g-3 w-100 m-0">
      {Array.from({ length: count }).map((_, index) => (
        <div key={`card-skel-${index}`} className="col-12 col-sm-6 col-md-4 col-lg p-1">
          <div className="pd-stat-card-skeleton d-flex flex-column justify-content-between">
            <Skeleton width="60%" height={12} className="mb-2" />
            <Skeleton width="80%" height={32} className="my-1" />
            <Skeleton width="40%" height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SingleStatCardSkeleton({ bg = "#ffffff" }) {
  return (
    <div
      className="rounded-3 p-3 h-100 d-flex flex-column justify-content-between"
      style={{ background: bg, border: "1px solid rgba(0,0,0,0.05)", minHeight: 90 }}
    >
      <Skeleton width="55%" height={13} className="mb-2" />
      <Skeleton width="75%" height={30} className="my-1" />
    </div>
  );
}

export default CardSkeleton;
