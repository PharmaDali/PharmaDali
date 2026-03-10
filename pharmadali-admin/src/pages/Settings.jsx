import { useState } from "react";

const Breadcrumb = ({ crumbs, onNavigate }) => (
  <nav className="d-flex align-items-center gap-1 flex-wrap mb-1">
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
      { label: "Branch settings", view: null },
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
    <div className="card border-0 shadow-sm rounded-3 h-100">
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
      configurations related to the pharmacy applicaations.
    </p>
    <div className="card border-0 shadow-sm rounded-3 mx-auto" style={{ maxWidth: "600px" }}>
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

  return (
    <div className="p-4">
      <Breadcrumb
        crumbs={[{ label: "Settings", view: "settings" }]}
        onNavigate={handleNavigate}
      />
      <p className="text-muted small mb-4">
        configurations related to the pharmacy applicaations.
      </p>
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

