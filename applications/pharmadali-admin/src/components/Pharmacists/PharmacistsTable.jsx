import React from "react";
import { TableSkeleton } from "../../shared/components/loading";
import { calculateAge } from "../../hooks/usePharmacists";
import SearchBar from "../../shared/components/SearchBar";

export function PharmacistsTable({
  rows,
  loading,
  tableError,
  search,
  setSearch,
  onOpenModal,
  onOpenDetailsModal,
  onOpenPermissionsModal,
  onDelete,
}) {
  return (
    <article className="pharmacists-card bg-transparent border-0 shadow-none d-flex flex-column flex-grow-1">
      {/* Mobile Toolbar (Search + Add) */}
      <div className="d-flex flex-column d-md-none gap-2 mb-3">
        <div className="w-100" style={{ backgroundColor: "var(--pd-bg-sidebar)", borderRadius: "6px" }}>
          <SearchBar
            id="pharmacists-search-mobile"
            value={search}
            onChange={(val) => setSearch(val)}
            placeholder="Search by name, phone..."
          />
        </div>
        <button 
          type="button" 
          className="admin-btn-primary w-100" 
          onClick={() => onOpenModal()}
        >
          + Add new pharmacist
        </button>
      </div>

      {/* Mobile Card Layout */}
      <div className="d-block d-md-none">
        {loading ? (
          <div className="p-3 bg-white rounded-3 text-center shadow-sm">Loading...</div>
        ) : tableError ? (
          <div className="p-3 bg-white rounded-3 text-center text-danger shadow-sm">{tableError}</div>
        ) : rows.length === 0 ? (
          <div className="p-4 bg-white rounded-3 text-center text-muted shadow-sm">No pharmacist records found.</div>
        ) : (
          rows.map((item, index) => (
            <div key={`${item.id}-${index}`} className="bg-white rounded-3 p-3 mb-3 shadow-sm d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold text-dark" style={{ fontSize: "15px" }}>
                  {`${item.first_name || ""} ${item.last_name || ""}`.trim() || "—"}
                </span>
                <span 
                  className="badge rounded-pill" 
                  style={{ 
                    fontSize: "12px", 
                    padding: "4px 14px", 
                    backgroundColor: item.is_active ? "#a7f3d0" : "#e2e8f0", 
                    color: item.is_active ? "#047857" : "#475569",
                    fontWeight: "600"
                  }}
                >
                  {item.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="text-muted d-flex gap-4 mb-1" style={{ fontSize: "13px" }}>
                <span>ID: {item.pharmacist?.employee_number || "—"}</span>
                <span>Age: {item.date_of_birth ? calculateAge(item.date_of_birth) : "N/A"}</span>
              </div>
              <div className="text-muted mb-3" style={{ fontSize: "13px" }}>
                Mobile: {item.mobile_number}
              </div>
              <div className="d-flex justify-content-end gap-3 border-top pt-2 mt-1">
                <button
                  type="button"
                  className="btn btn-link p-0 text-primary"
                  onClick={() => onOpenPermissionsModal(item)}
                  title="Manage Staff Permissions"
                  aria-label="Manage Staff Permissions"
                >
                  <i className="fa-solid fa-key" style={{ fontSize: "16px", color: "var(--pd-primary-dark)" }} />
                </button>
                <button
                  type="button"
                  className="btn btn-link p-0 text-primary"
                  onClick={() => onOpenDetailsModal(item)}
                  title="View Details"
                  aria-label="View Details"
                >
                  <i className="fa-regular fa-pen-to-square" style={{ fontSize: "16px", color: "var(--pd-primary-dark)" }} />
                </button>
                <button
                  type="button"
                  className="btn btn-link p-0 text-danger"
                  onClick={() => onDelete(item.id)}
                  title="Delete"
                  aria-label="Delete"
                >
                  <i className="fa-regular fa-trash-can" style={{ fontSize: "16px", color: "var(--pd-danger)" }} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View */}
      <div className="d-none d-md-flex flex-column flex-grow-1 admin-card h-100">
        <div className="pharmacists-toolbar">
          <div className="pharmacists-toolbar-left">
            <h6 className="pharmacists-title mb-0">Pharmacist</h6>
            <span className="pharmacists-count">{rows.length} account(s)</span>
          </div>

          <div style={{ minWidth: 260 }}>
            <SearchBar
              id="pharmacists-search"
              value={search}
              onChange={(val) => setSearch(val)}
              placeholder="Search by name, phone..."
            />
          </div>
        </div>

        <div className="pharmacists-table-scroll flex-grow-1" style={{ minHeight: 0 }}>
        <table className="admin-table" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ width: "15%" }}>Employee Number</th>
              <th style={{ width: "20%" }}>Pharmacist Name</th>
              <th style={{ width: "15%" }}>Mobile Number</th>
              <th className="text-center" style={{ width: "10%" }}>Age</th>
              <th className="text-center" style={{ width: "15%" }}>Status</th>
              <th className="text-center" style={{ width: "25%" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={5} columns={6} showAvatar={false} />
            ) : tableError ? (
              <tr>
                <td colSpan={6} className="text-center text-danger py-4">
                  <i className="fa-solid fa-triangle-exclamation me-2" />
                  {tableError}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr className="pharmacists-empty-row" style={{ cursor: "default" }}>
                <td colSpan={6} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center justify-content-center py-4">
                    <i className="fa-solid fa-user-slash mb-3" style={{ fontSize: "3.5rem", color: "#94a3b8" }} />
                    <span className="fw-medium" style={{ fontSize: "15px", color: "#64748b" }}>No pharmacist records found.</span>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((item, index) => (
                <tr key={`${item.id}-${index}`}>
                  <td>{item.pharmacist?.employee_number || "—"}</td>
                  <td>{`${item.first_name || ""} ${item.last_name || ""}`.trim() || "—"}</td>
                  <td>{item.mobile_number || "—"}</td>
                  <td className="text-center">{item.date_of_birth ? calculateAge(item.date_of_birth) : "N/A"}</td>
                  <td className="text-center">
                    <span className={`pharmacists-status-badge pharmacists-status-${item.is_active ? "active" : "inactive"}`}>
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <button
                        type="button"
                        className="admin-btn-secondary btn-sm"
                        onClick={() => onOpenDetailsModal(item)}
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        className="admin-btn-secondary btn-sm"
                        onClick={() => onOpenPermissionsModal(item)}
                        title="Manage Staff Permissions"
                      >
                        <i className="fa-solid fa-key" />
                        Permissions
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
    </article>
  );
}

export default PharmacistsTable;
