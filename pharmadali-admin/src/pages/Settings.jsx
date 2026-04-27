import { useState } from "react";

const Breadcrumb = ({ crumbs, onNavigate }) => (
  <nav className="d-flex align-items-center gap-1 flex-wrap mb-1 fs-4">
    {crumbs.map((crumb, i) => {
      const isLast = i === crumbs.length - 1;
      return (
        <span key={i} className="d-flex align-items-center gap-1">
          {i !== 0 && <span style={{ color: "#29ABE2" }}>&rsaquo;</span>}
          {isLast ? (
            <span className="fw-bold" style={{ color: "#29ABE2" }}>
              {crumb.label}
            </span>
          ) : (
            <button
              className="btn btn-link p-0 text-decoration-none"
              style={{ color: "#29ABE2", opacity: 0.6, fontSize: "inherit" }}
              onClick={() => onNavigate(crumb.view)}
            >
              {crumb.label}
            </button>
          )}
        </span>
      );
    })}
  </nav>
);

const settingsGroups = [
  {
    title: "System Settings",
    items: [
      { label: "Pharmacy name", view: "pharmacyName" },
      { label: "Branch settings", view: "branchSettings" },
    ],
  },
  {
    title: "Alert Settings",
    items: [
      { label: "Low stock threshold", view: null },
      { label: "Expiry alert days", view: null },
    ],
  },
  {
    title: "Forecast Settings",
    items: [
      { label: "AI retraining", view: null },
      { label: "Forecast parameters", view: null },
    ],
  },
  {
    title: "Backup Settings",
    items: [
      { label: "Database backup", view: null },
      { label: "Restore system", view: null },
    ],
  },
];

const SettingsCard = ({ title, items, onNavigate }) => (
  <div className="col-md-6 mb-4">
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body p-4">
        <h6 className="fw-bold mb-3" style={{ color: "#29ABE2" }}>
          {title}
        </h6>
        <ul className="list-unstyled mb-0">
          {items.map((item, index) => (
            <li key={index}>
              {index !== 0 && <hr className="my-2" />}
              <button
                className="btn btn-link text-decoration-none text-dark w-100 d-flex justify-content-between align-items-center px-0 py-1"
                onClick={() => item.view && onNavigate(item.view)}
              >
                <span className="small">{item.label}</span>
                <span className="text-muted">&rsaquo;</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const PharmacyNameView = ({ onNavigate }) => (
  <>
    <Breadcrumb
      crumbs={[
        { label: "Settings", view: "settings" },
        { label: "System Settings", view: "settings" },
        { label: "Pharmacy Name", view: "pharmacyName" },
      ]}
      onNavigate={onNavigate}
    />
    <p className="text-muted small mb-4">
      System settings for the pharmacy application.
    </p>
    <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: "600px" }}>
      <div className="card-body px-5 py-4">
        <div className="d-flex justify-content-between align-items-center pb-2 border-bottom mb-3">
          <span className="text-muted small">Pharmacy Name</span>
          <span className="text-muted small">Action</span>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <span className="small fw-semibold">Lally&apos;s Pharmacy</span>
          <button className="btn btn-link p-0" style={{ color: "#29ABE2" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </>
);

const BranchSettingsView = ({ onNavigate }) => {
  const [branches, setBranches] = useState([
    {
      id: 1,
      name: "Landicho's Drug Store",
      address: "Lipa City",
      hours: "8:00am - 8:00pm",
    },
    {
      id: 2,
      name: "Puremed",
      address: "Tanauan City",
      hours: "8:00am - 11:00pm",
    },
  ]);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState(null);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [formError, setFormError] = useState("");
  const [branchForm, setBranchForm] = useState({
    name: "",
    address: "",
    hours: "",
  });

  const resetForm = () => {
    setBranchForm({ name: "", address: "", hours: "" });
    setFormError("");
    setEditingBranchId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsBranchModalOpen(true);
  };

  const handleOpenEditModal = (branch) => {
    setBranchForm({
      name: branch.name,
      address: branch.address,
      hours: branch.hours,
    });
    setEditingBranchId(branch.id);
    setFormError("");
    setIsBranchModalOpen(true);
  };

  const handleCloseBranchModal = () => {
    setIsBranchModalOpen(false);
    resetForm();
  };

  const handleChangeForm = (field, value) => {
    setBranchForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveBranch = (event) => {
    event.preventDefault();

    const name = branchForm.name.trim();
    const address = branchForm.address.trim();
    const hours = branchForm.hours.trim();

    if (!name || !address || !hours) {
      setFormError("Please complete all fields.");
      return;
    }

    if (editingBranchId === null) {
      setBranches((prev) => [
        ...prev,
        {
          id: Date.now(),
          name,
          address,
          hours,
        },
      ]);
    } else {
      setBranches((prev) =>
        prev.map((branch) =>
          branch.id === editingBranchId
            ? { ...branch, name, address, hours }
            : branch
        )
      );
    }

    handleCloseBranchModal();
  };

  const handleOpenDeleteModal = (branch) => {
    setBranchToDelete(branch);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setBranchToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!branchToDelete) {
      return;
    }

    setBranches((prev) => prev.filter((branch) => branch.id !== branchToDelete.id));
    handleCloseDeleteModal();
  };

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Settings", view: "settings" },
          { label: "System Settings", view: "settings" },
          { label: "Branch Settings", view: "branchSettings" },
        ]}
        onNavigate={onNavigate}
      />
      <p className="text-muted small mb-4">
        configurations related to the pharmacy applicaations.
      </p>

      <div className="d-flex justify-content-end mb-3">
        <button
          type="button"
          className="btn btn-sm text-white"
          style={{ backgroundColor: "#29ABE2", border: "none" }}
          onClick={handleOpenAddModal}
        >
          + Add new branch
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th className="text-muted small fw-normal ps-4">Branch Name</th>
                <th className="text-muted small fw-normal">Address</th>
                <th className="text-muted small fw-normal">Operating Hours</th>
                <th className="text-muted small fw-normal text-center pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((branch) => (
                <tr key={branch.id}>
                  <td className="small fw-semibold ps-4">{branch.name}</td>
                  <td className="small">{branch.address}</td>
                  <td className="small">{branch.hours}</td>
                  <td className="text-center pe-4">
                    <button
                      type="button"
                      className="btn btn-link p-0 me-3"
                      style={{ color: "#29ABE2" }}
                      onClick={() => handleOpenEditModal(branch)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-secondary"
                      onClick={() => handleOpenDeleteModal(branch)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v7a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0A.5.5 0 0 1 8.5 6v7a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0z" />
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 1 1 0-2H5.5l.5-.5h4l.5.5h3a1 1 0 0 1 1 1M4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {branches.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted small py-4">
                    No branches available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isBranchModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", zIndex: 1050 }}
        >
          <div className="card border-0 shadow" style={{ width: "100%", maxWidth: "520px" }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3" style={{ color: "#29ABE2" }}>
                {editingBranchId === null ? "Add New Branch" : "Edit Branch"}
              </h6>

              <form onSubmit={handleSaveBranch}>
                <div className="mb-3">
                  <label className="form-label small text-muted">Branch Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={branchForm.name}
                    onChange={(event) => handleChangeForm("name", event.target.value)}
                    placeholder="Enter branch name"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted">Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={branchForm.address}
                    onChange={(event) => handleChangeForm("address", event.target.value)}
                    placeholder="Enter address"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label small text-muted">Operating Hours</label>
                  <input
                    type="text"
                    className="form-control"
                    value={branchForm.hours}
                    onChange={(event) => handleChangeForm("hours", event.target.value)}
                    placeholder="Example: 8:00am - 6:00pm"
                  />
                </div>

                {formError && <p className="text-danger small mb-3">{formError}</p>}

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleCloseBranchModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm text-white"
                    style={{ backgroundColor: "#29ABE2", border: "none" }}
                  >
                    {editingBranchId === null ? "Add Branch" : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", zIndex: 1050 }}
        >
          <div className="card border-0 shadow" style={{ width: "100%", maxWidth: "420px" }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3" style={{ color: "#29ABE2" }}>
                Delete Branch
              </h6>
              <p className="small text-muted mb-4">
                Are you sure you want to delete {branchToDelete?.name}?
              </p>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={handleCloseDeleteModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={handleConfirmDelete}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

function Settings() {
  const [view, setView] = useState("settings");

  const handleNavigate = (target) => setView(target);

  if (view === "pharmacyName") {
    return (
      <div className="p-4">
        <PharmacyNameView onNavigate={handleNavigate} />
      </div>
    );
  }

  if (view === "branchSettings") {
    return (
      <div className="p-4">
        <BranchSettingsView onNavigate={handleNavigate} />
      </div>
    );
  }

  return (
    <div className="p-4">
      <header className="admin-page-header">
        <h4 className="fw-bold mb-1 admin-page-title">Settings</h4>
        <p className="admin-page-subtitle">System settings for the pharmacy application.</p>
      </header>
      <div className="row">
        {settingsGroups.map((group, index) => (
          <SettingsCard
            key={index}
            title={group.title}
            items={group.items}
            onNavigate={handleNavigate}
          />
        ))}
      </div>
    </div>
  );
}

export default Settings;

