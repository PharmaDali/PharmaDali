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
}) {
  return (
    <article className="pharmacists-card">
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

      <div className="pharmacists-table-scroll">
        <table className="table mb-0 pharmacists-table">
          <thead>
            <tr>
              <th>Employee Number</th>
              <th>Pharmacist Name</th>
              <th>Mobile Number</th>
              <th>Age</th>
              <th>Status</th>
              <th>Action</th>
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
              rows.map((item) => (
                <tr key={item.id}>
                  <td>{item.pharmacist?.employee_number || "—"}</td>
                  <td>{`${item.first_name} ${item.last_name}`}</td>
                  <td>{item.mobile_number}</td>
                  <td>{item.date_of_birth ? calculateAge(item.date_of_birth) : "N/A"}</td>
                  <td>
                    <span className={`pharmacists-status-badge pharmacists-status-${item.is_active ? "active" : "inactive"}`}>
                      {item.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm pharmacists-btn-details"
                        onClick={() => onOpenDetailsModal(item)}
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 py-1 px-2 rounded-2"
                        style={{ borderColor: "#2aabe2", color: "#2aabe2", fontSize: "0.8rem" }}
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
    </article>
  );
}

export default PharmacistsTable;
