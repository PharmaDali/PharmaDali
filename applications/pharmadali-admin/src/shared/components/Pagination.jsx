import React, { useMemo } from "react";
import "../../assets/css/inventory.css";

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
  visiblePageNumbers: customVisiblePages,
  containerClassName = "",
  ariaLabel = "Table pagination navigation",
}) {
  // Compute visible page numbers if not explicitly provided
  const visiblePages = useMemo(() => {
    if (customVisiblePages && Array.isArray(customVisiblePages)) {
      return customVisiblePages;
    }
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const endPage = Math.min(totalPages, startPage + 4);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  }, [currentPage, totalPages, customVisiblePages]);

  if (totalPages <= 1 && (totalItems === undefined || totalItems === 0)) {
    return null;
  }

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage && onPageChange) {
      onPageChange(page);
    }
  };

  const startItem = totalItems !== undefined ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = totalItems !== undefined ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  return (
    <div className={`inventory-pagination-bar ${containerClassName}`.trim()}>
      {totalItems !== undefined && (
        <span className="inventory-pagination-info">
          {totalItems > 0
            ? `Showing ${startItem}–${endItem} of ${totalItems}`
            : "No items available"}
        </span>
      )}

      {totalPages > 1 && (
        <nav aria-label={ariaLabel}>
          <ul className="inventory-pagination">
            {/* Previous Page Button */}
            <li className={`inventory-page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                type="button"
                className="inventory-page-link inventory-page-nav"
                onClick={() => handlePageClick(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <i className="fa-solid fa-chevron-left" aria-hidden="true" />
              </button>
            </li>

            {/* First Page Link if not in visible range */}
            {visiblePages[0] > 1 && (
              <>
                <li className="inventory-page-item">
                  <button
                    type="button"
                    className="inventory-page-link"
                    onClick={() => handlePageClick(1)}
                  >
                    1
                  </button>
                </li>
                {visiblePages[0] > 2 && (
                  <li className="inventory-page-item inventory-page-ellipsis">
                    <span>…</span>
                  </li>
                )}
              </>
            )}

            {/* Main Page Links */}
            {visiblePages.map((pageNumber) => (
              <li
                key={pageNumber}
                className={`inventory-page-item ${currentPage === pageNumber ? "active" : ""}`}
              >
                <button
                  type="button"
                  className="inventory-page-link"
                  onClick={() => handlePageClick(pageNumber)}
                >
                  {pageNumber}
                </button>
              </li>
            ))}

            {/* Last Page Link if not in visible range */}
            {visiblePages[visiblePages.length - 1] < totalPages && (
              <>
                {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                  <li className="inventory-page-item inventory-page-ellipsis">
                    <span>…</span>
                  </li>
                )}
                <li className="inventory-page-item">
                  <button
                    type="button"
                    className="inventory-page-link"
                    onClick={() => handlePageClick(totalPages)}
                  >
                    {totalPages}
                  </button>
                </li>
              </>
            )}

            {/* Next Page Button */}
            <li className={`inventory-page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button
                type="button"
                className="inventory-page-link inventory-page-nav"
                onClick={() => handlePageClick(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <i className="fa-solid fa-chevron-right" aria-hidden="true" />
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default Pagination;
