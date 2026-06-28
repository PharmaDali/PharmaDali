import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/loginService";
import dashboardIcon from "../assets/icons/sidebar-icons/dashboard.svg";
import posIcon from "../assets/icons/sidebar-icons/pos.svg";
import pickupOrdersIcon from "../assets/icons/sidebar-icons/pickup-orders.svg";
import inventoryIcon from "../assets/icons/sidebar-icons/inventory.svg";
import aiAnalyticsIcon from "../assets/icons/sidebar-icons/ai-analytics&forecasting.svg";
import salesReportsIcon from "../assets/icons/sidebar-icons/sales-and-reports.svg";
import pharmacistsIcon from "../assets/icons/sidebar-icons/pharmacists.svg";
import notificationsIcon from "../assets/icons/sidebar-icons/notifications.svg";
import settingsIcon from "../assets/icons/sidebar-icons/settings.svg";
import getTechnicalHelpIcon from "../assets/icons/sidebar-icons/get-technical-help.svg";

const VISUAL_UNREAD_BADGE = 1;

const formatUnreadBadge = (count) => {
  const numericCount = Number(count);

  if (!Number.isFinite(numericCount) || numericCount <= 0) {
    return null;
  }

  if (numericCount > 99) {
    return "99+";
  }

  return String(Math.trunc(numericCount)).padStart(2);
};

const MENU_SECTIONS = [
  {
    items: [
      { to: "/", icon: dashboardIcon, label: "Dashboard" },
      { to: "/pos", icon: posIcon, label: "POS" },
      { to: "/pick-up", icon: pickupOrdersIcon, label: "Pickup Orders", badgeKey: "pickup" },
      { to: "/inventory", icon: inventoryIcon, label: "Inventory" },
    ],
  },
  {
    items: [
      { to: "/analytics-and-forecasting", icon: aiAnalyticsIcon, label: "AI Analytics & Forecasting" },
      {
        to: "/sales-reports",
        icon: salesReportsIcon,
        label: "Sales & Reports",
      },
    ],
  },
  {
    items: [
      { to: "/pharmacists", icon: pharmacistsIcon, label: "Pharmacists" },
      {
        to: "/notifications",
        icon: notificationsIcon,
        label: "Notifications",
        badgeKey: "notifications",
      },
      { to: "/settings", icon: settingsIcon, label: "Settings" },
      {
        to: "/get-technical-help",
        icon: getTechnicalHelpIcon,
        label: "Get Technical Help",
      },
    ],
  },
];

function SideBar({ isOpen, onToggle, unreadNotificationsCount = null, readyPickupOrdersCount = 0, user = null }) {

  const navigate = useNavigate();
  const notificationsBadge = formatUnreadBadge(
    unreadNotificationsCount ?? VISUAL_UNREAD_BADGE
  );

  const pickupBadge = formatUnreadBadge(readyPickupOrdersCount);

  const displayName = user ? `${user.first_name}` : "Admin";
  const pharmacyName = user?.pharmacy?.pharmacy_name || "PharmaDali Pharmacy";
  const avatarUrl = user 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name)}+${encodeURIComponent(user.last_name)}&background=4A90E2&color=fff&size=45`
    : "https://ui-avatars.com/api/?name=Admin&background=4A90E2&color=fff&size=45";
  
  const handleLogout = async (event) => {
    event.preventDefault();

    try {
      await logout();
    } finally {
      localStorage.removeItem("isAuthenticated");
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      <div
        className={`sidebar-overlay${isOpen ? " active" : ""}`}
        onClick={onToggle}
      />

      <div
        className={`sidebar position-fixed p-0 overflow-y-auto${isOpen ? " active" : ""}`}
      // style={{ overflowX: "visible" }}
      >
        <div className="sidebar-profile">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <div className="position-relative d-inline-block">
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="rounded-2 profile-avatar"
                />
                <span className="online-indicator position-absolute rounded-circle" />
              </div>
              <div>
                <p className="fw-semibold m-0 profile-name">{displayName}</p>
                <p className="m-0 profile-pharmacy">{pharmacyName}</p>
              </div>
            </div>
            <div className="dropdown">
              <button
                type="button"
                className="btn p-0 border-0 bg-transparent"
                style={{ cursor: "pointer", fontSize: 20, color: "#333" }}
                data-bs-toggle="dropdown"
                data-bs-offset="0,0"
                data-bs-strategy="fixed"
                aria-expanded="false"
              >
                <svg
                  className="sidebar-ellipsis"
                  viewBox="0 0 4 16"
                  aria-hidden="true"
                  focusable="false"
                >
                  <circle cx="2" cy="2" r="2" fill="currentColor" />
                  <circle cx="2" cy="8" r="2" fill="currentColor" />
                  <circle cx="2" cy="14" r="2" fill="currentColor" />
                </svg>
              </button>

              <ul className="dropdown-menu">
                <li>
                  <a className="dropdown-item" href="#">
                    <i className="bi bi-person text-black me-2">
                    </i>My profile</a>
                </li>
                <li>
                  <a className="dropdown-item " href="#" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right text-danger me-2">
                    </i>Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <nav className="p-0">
          {MENU_SECTIONS.map((section, sIdx) => (
            <div key={sIdx}>
              {sIdx > 0 && <div className="sidebar-divider" />}
              {section.items.map((item) => {
                const badgeValue =
                  item.badgeKey === "notifications"
                    ? notificationsBadge
                    : item.badgeKey === "pickup"
                    ? pickupBadge
                    : null;

                return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `menu-item d-flex align-items-center gap-3 position-relative text-decoration-none${isActive ? " active" : ""}`
                  }
                >
                  <img src={item.icon} alt="" className="menu-icon" aria-hidden="true" />
                  <span>{item.label}</span>
                  {badgeValue && (
                    <span className="menu-badge position-absolute rounded-pill fw-semibold">
                      {badgeValue}
                    </span>
                  )}
                </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      <button
        className={`sidebar-toggle position-fixed d-flex align-items-center justify-content-center border-0${isOpen ? " open" : ""}`}
        onClick={onToggle}
      >
        <svg
          className="sidebar-toggle-icon"
          viewBox="0 0 12 20"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M10 2L3 10L10 18"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </>
  );
}

export default SideBar;
