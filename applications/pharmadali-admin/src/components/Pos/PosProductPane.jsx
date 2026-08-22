import React from "react";
import { usePosContext } from "../../context/PosContext";
import PosProductTable from "./PosProductTable";
import PosEmptyState from "./PosEmptyState";
import { TableSkeleton } from "../../shared/components/loading";

export default function PosProductPane() {
  const {
    search,
    setSearch,
    debouncedSearch,
    products,
    loading,
  } = usePosContext();

  return (
    <div className="d-flex flex-column flex-grow-1 pos-pane" style={{ minWidth: 0 }}>
      <div className="card border-0 shadow-md pos-card pos-product-card rounded-4 overflow-hidden">
        <div className="card-header bg-white border-0 d-flex align-items-center gap-3 flex-wrap pt-3 pb-2 px-3">
          <h6
            className="fw-bold mb-0 flex-shrink-0 pos-title"
            style={{ color: "var(--pd-soft-black-dark, #1e293b)", fontSize: 20 }}
          >
            Product List
          </h6>
          <div
            className="d-flex align-items-center gap-2 px-3 py-2 flex-grow-1 pos-search"
            style={{
              background: "#E3EBF3",
              border: "1px solid #c9d6e4",
              borderRadius: "8px",
              maxWidth: "500px",
            }}
          >
            <i
              className="fa-solid fa-magnifying-glass"
              style={{ color: "#64748b", fontSize: 14 }}
            />
            <input
              type="text"
              className="border-0 bg-transparent w-100"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                fontSize: 13,
                color: "#1f2937",
                outline: "none",
                boxShadow: "none",
              }}
            />
          </div>
        </div>
        <div className="card-body p-3 pt-3 overflow-hidden pos-product-body" style={{ flex: 1, minHeight: 0 }}>
          <div className="card border-1 shadow-md rounded-4 overflow-hidden" style={{ height: "100%", overflow: "hidden" }}>
            <div className="card-body d-flex flex-column p-0" style={{ flex: 1, minHeight: 0 }}>
              {loading && products.length === 0 ? (
                <div className="table-responsive p-3">
                  <table className="table pos-table align-middle mb-0">
                    <tbody>
                      <TableSkeleton rows={6} columns={5} showAvatar={true} />
                    </tbody>
                  </table>
                </div>
              ) : products.length > 0 ? (
                <PosProductTable />
              ) : (
                <PosEmptyState
                  minHeight="100%"
                  iconWidth={92}
                  className="pos-order-empty-state"
                  message={debouncedSearch.trim() ? "No products found." : "Search for items"}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
