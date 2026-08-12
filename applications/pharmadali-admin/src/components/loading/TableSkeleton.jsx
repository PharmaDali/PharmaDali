import React from "react";
import Skeleton from "./Skeleton";

export function TableSkeleton({ rows = 5, columns = 6, showAvatar = true }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={`table-skel-row-${rowIndex}`}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={`table-skel-col-${colIndex}`} className="align-middle py-3">
              {colIndex === 0 && showAvatar ? (
                <div className="d-flex align-items-center gap-2">
                  <Skeleton variant="rectangular" width={36} height={36} borderRadius={6} />
                  <div className="d-flex flex-column gap-1 flex-grow-1" style={{ maxWidth: 160 }}>
                    <Skeleton width="85%" height={14} />
                    <Skeleton width="55%" height={11} />
                  </div>
                </div>
              ) : colIndex === columns - 1 ? (
                <Skeleton variant="pill" width={70} height={24} />
              ) : colIndex % 2 === 0 ? (
                <Skeleton width="60%" height={14} />
              ) : (
                <Skeleton width="40%" height={14} />
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default TableSkeleton;
