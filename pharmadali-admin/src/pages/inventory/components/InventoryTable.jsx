import React from "react";
import { ITEMS_PER_PAGE } from "../inventoryConstants";

export function InventoryTable({
  loading,
  filteredItems,
  paginatedItems,
  selectedItem,
  handleSelectItem,
  currentPage,
  totalPages,
  visiblePageNumbers,
  handlePageChange,
  setIsAddModalOpen,
  navigate,
}) {
  return (
    <article className="inventory-table-card h-100">
      <div className="inventory-table-actions">
        <div className="inventory-action-group">
          <button
            type="button"
            className="btn inventory-action-btn inventory-action-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            + Add New Product
          </button>
          <button
            type="button"
            className="btn inventory-action-btn inventory-action-muted"
            onClick={() => navigate("/inventory/logs")}
          >
            View Inventory Logs
          </button>
        </div>
      </div>

      <div className="inventory-table-scroll">
        <table className="table inventory-table mb-0">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Stock Quantity</th>
              <th>Expiry Date</th>
              <th>Selling Price</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>
                  <div className="inventory-empty-state">
                    <div className="spinner-border text-primary mb-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mb-0">Loading inventory items...</p>
                  </div>
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="inventory-empty-state">
                    <i className="fa-regular fa-folder-open mb-2" aria-hidden="true" />
                    <p className="mb-0">No inventory item matches your filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  className={selectedItem?.id === item.id ? "inventory-row-selected" : ""}
                  onClick={() => handleSelectItem(item)}
                >
                  <td>
                    <p className="inventory-item-name mb-0">{item.name}</p>
                    <p className="inventory-item-meta mb-0">{item.brand}</p>
                  </td>
                  <td>{item.category}</td>
                  <td>{item.quantity}</td>
                  <td>{item.expiryLabel}</td>
                  <td>{item.sellingPrice.toFixed(2)}</td>
                  <td>
                    <span
                      className={`inventory-status-chip inventory-status-${item.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && filteredItems.length > 0 && (
        <div className="inventory-pagination-bar">
          <span className="inventory-pagination-info">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length}
          </span>

          <nav aria-label="Inventory product table pagination">
            <ul className="inventory-pagination">
              <li className={`inventory-page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button
                  type="button"
                  className="inventory-page-link inventory-page-nav"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                </button>
              </li>

              {visiblePageNumbers[0] > 1 && (
                <>
                  <li className="inventory-page-item">
                    <button
                      type="button"
                      className="inventory-page-link"
                      onClick={() => handlePageChange(1)}
                    >
                      1
                    </button>
                  </li>
                  {visiblePageNumbers[0] > 2 && (
                    <li className="inventory-page-item inventory-page-ellipsis">
                      <span>…</span>
                    </li>
                  )}
                </>
              )}

              {visiblePageNumbers.map((pageNumber) => (
                <li
                  key={pageNumber}
                  className={`inventory-page-item ${currentPage === pageNumber ? "active" : ""}`}
                >
                  <button
                    type="button"
                    className="inventory-page-link"
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                </li>
              ))}

              {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages && (
                <>
                  {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages - 1 && (
                    <li className="inventory-page-item inventory-page-ellipsis">
                      <span>…</span>
                    </li>
                  )}
                  <li className="inventory-page-item">
                    <button
                      type="button"
                      className="inventory-page-link"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </button>
                  </li>
                </>
              )}

              <li className={`inventory-page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button
                  type="button"
                  className="inventory-page-link inventory-page-nav"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </article>
  );
}

export default InventoryTable;
