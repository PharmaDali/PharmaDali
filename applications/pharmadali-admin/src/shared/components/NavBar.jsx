import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function formatDatetime(now) {
  return {
    time: now.toLocaleTimeString("en-US", { hour12: false }),
    date: now.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }),
    shortDate: now.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }),
  };
}

function getGreeting(now) {
  const hour = now.getHours();
  if (hour < 12) return { text: "Good Morning", icon: "fa-sun", color: "#FFD700" };
  if (hour < 18) return { text: "Good Afternoon", icon: "fa-cloud-sun", color: "#FFA500" };
  return { text: "Good Evening", icon: "fa-moon", color: "#6B7280" };
}

function NavBar({ onToggleSidebar, sidebarOpen }) {
  const now = new Date();
  const [datetime, setDatetime] = useState(() => formatDatetime(now));
  const [greeting, setGreeting] = useState(() => getGreeting(now));

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setDatetime(formatDatetime(n));
      setGreeting(getGreeting(n));
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="navbar-bar d-flex align-items-center p-3 gap-2 gap-sm-3 position-sticky top-0">
      <div
        className={`d-flex flex-column justify-content-between hamburger-menu${sidebarOpen ? " d-none" : ""}`}
        onClick={onToggleSidebar}
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </div>

      <div className="flex-shrink-0 navbar-logo-wrap">
        <Link to="/">
          <img
            src="/main_logo.svg"
            alt="PharmaDali"
            className="navbar-logo"
          />
        </Link>
      </div>

      <div className="d-flex flex-column align-items-end ms-auto navbar-meta-wrap">
        <div className="d-flex align-items-center gap-2 fw-medium navbar-greeting-wrap">
          <i
            className={`fa-solid ${greeting.icon} navbar-greeting-icon`}
            style={{ color: greeting.color }}
          />
          <span className="navbar-greeting-text">{greeting.text}</span>
        </div>
        <div className="small text-muted d-flex flex-column flex-sm-row align-items-end align-items-sm-center gap-0 gap-sm-2 navbar-datetime" style={{ fontSize: '0.8rem' }}>
          <span className="d-none d-sm-inline">{datetime.date}</span>
          <span className="d-inline d-sm-none">{datetime.shortDate}</span>
          <span>{datetime.time}</span>
        </div>
      </div>
    </div>
  );
}

export default NavBar;

