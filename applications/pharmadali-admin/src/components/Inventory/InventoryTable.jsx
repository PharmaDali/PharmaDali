import React from "react";
import { ITEMS_PER_PAGE } from "../../constants/inventoryConstants";
import { TableSkeleton } from "../../shared/components/loading";
import Pagination from "../../shared/components/Pagination";

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
  isPharmacist = false,
}) {
  return (
    <article className="inventory-table-card h-100">
      <div className="inventory-table-actions">
        <div className="inventory-action-group">
          {!isPharmacist && (
            <button
              type="button"
              className="admin-btn-primary"
              onClick={() => setIsAddModalOpen(true)}
            >
              + Add New Product
            </button>
          )}
          <button
            type="button"
            className="admin-btn-secondary"
            onClick={() => navigate("/inventory/logs")}
          >
            View Inventory Logs
          </button>
        </div>
      </div>

      <div className="inventory-table-scroll">
        <table className="admin-table mb-0">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th className="text-center">Stock Quantity</th>
              <th className="text-center">Expiry Date</th>
              <th className="text-center">Selling Price</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={5} columns={6} showAvatar={true} />
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
                    <div className="d-flex align-items-center gap-2">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="rounded border"
                          style={{ width: "36px", height: "36px", objectFit: "cover", backgroundColor: "var(--pd-bg-sidebar)" }}
                        />
                      ) : (
                        <div
                          className="rounded border d-flex align-items-center justify-content-center text-secondary"
                          style={{ width: "36px", height: "36px", backgroundColor: "var(--pd-bg-sidebar)" }}
                        >
                          <i className="fa-solid fa-pills" style={{ fontSize: "14px", color: "var(--pd-text-placeholder)" }} />
                        </div>
                      )}
                      <div>
                        <p className="inventory-item-name mb-0">{item.name}</p>
                        <p className="inventory-item-meta mb-0">{item.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td className="text-center">{item.quantity}</td>
                  <td className="text-center">{item.expiryLabel}</td>
                  <td className="text-center">{item.sellingPrice.toFixed(2)}</td>
                  <td className="text-center">
                    <span
                      className={`inventory-status-chip inventory-status-${item.status
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {item.status === "Expired" && item.batches
                        ? `${item.batches.filter((b) => b.status === "Expired").reduce((sum, b) => sum + parseInt(b.stock, 10), 0)} units expired`
                        : item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {!loading && filteredItems.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredItems.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
          visiblePageNumbers={visiblePageNumbers}
          ariaLabel="Inventory product table pagination"
        />
      )}
    </article>
  );
}

export default InventoryTable;
