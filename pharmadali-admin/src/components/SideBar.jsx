import { NavLink } from "react-router-dom";

const MENU_SECTIONS = [
  {
    items: [
      { to: "/", icon: "fa-th-large", label: "Dashboard" },
      { to: "/pos", icon: "fa-store", label: "POS" },
      { to: "/pickup-orders", icon: "fa-chart-line", label: "Pickup Orders" },
      { to: "/inventory", icon: "fa-boxes", label: "Inventory" },
    ],
  },
  {
    items: [
      { to: "/ai-forecasting", icon: "fa-brain", label: "AI Forecasting" },
      {
        to: "/sales-reports",
        icon: "fa-chart-bar",
        label: "Sales & Reports",
      },
    ],
  },
  {
    items: [
      { to: "/users", icon: "fa-users", label: "Users" },
      {
        to: "/notifications",
        icon: "fa-bell",
        label: "Notifications",
        badge: "01",
      },
      { to: "/settings", icon: "fa-cog", label: "Settings" },
      {
        to: "/help",
        icon: "fa-question-circle",
        label: "Get Technical Help",
      },
    ],
  },
];

function SideBar({ isOpen, onToggle }) {
  return (
    <>
      <div
        className={`sidebar-overlay${isOpen ? " active" : ""}`}
        onClick={onToggle}
      />

      <div
        className={`sidebar position-fixed p-0 overflow-auto${isOpen ? " active" : ""}`}
      >
        <div className="sidebar-profile">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div className="position-relative d-inline-block">
                <img
                  src="https://ui-avatars.com/api/?name=Denmar&background=4A90E2&color=fff&size=45"
                  alt="Profile"
                  className="rounded-2 profile-avatar"
                />
                <span className="online-indicator position-absolute rounded-circle" />
              </div>
              <div>
                <p className="fw-semibold m-0 profile-name">Denmar</p>
                <p className="m-0 profile-pharmacy">Laily&#39;s Pharmacy</p>
              </div>
            </div>
            <i
              className="fa-solid fa-ellipsis-vertical"
              style={{ cursor: "pointer", fontSize: 20, color: "#333" }}
            />
          </div>
        </div>

        <nav className="p-0">
          {MENU_SECTIONS.map((section, sIdx) => (
            <div key={sIdx}>
              {sIdx > 0 && <div className="sidebar-divider" />}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `menu-item d-flex align-items-center gap-3 position-relative text-decoration-none${isActive ? " active" : ""}`
                  }
                >
                  <i
                    className={`fa-solid ${item.icon}`}
                    style={{
                      fontSize: 16,
                      width: 20,
                      textAlign: "center",
                    }}
                  />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="menu-badge position-absolute rounded-pill fw-semibold">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <button
        className={`sidebar-toggle position-fixed d-flex align-items-center justify-content-center border-0${isOpen ? " open" : ""}`}
        onClick={onToggle}
      >
        <i className="fa-solid fa-chevron-left" />
      </button>
    </>
  );
}

export default SideBar;
