import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function NavBar({ onToggleSidebar, sidebarOpen }) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [shortDate, setShortDate] = useState("");
  const [greeting, setGreeting] = useState("Good Morning");
  const [iconClass, setIconClass] = useState("fa-sun");
  const [iconColor, setIconColor] = useState("#FFD700");

  useEffect(() => {
    function updateDateTime() {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false }));
      setDate(
        now.toLocaleDateString("en-US", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
      setShortDate(
        now.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      );
    }

    function updateGreeting() {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting("Good Morning");
        setIconClass("fa-sun");
        setIconColor("#FFD700");
      } else if (hour < 18) {
        setGreeting("Good Afternoon");
        setIconClass("fa-cloud-sun");
        setIconColor("#FFA500");
      } else {
        setGreeting("Good Evening");
        setIconClass("fa-moon");
        setIconColor("#6B7280");
      }
    }

    updateDateTime();
    updateGreeting();

    const timeInterval = setInterval(updateDateTime, 1000);
    const greetingInterval = setInterval(updateGreeting, 60000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(greetingInterval);
    };
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
            className={`fa-solid ${iconClass} navbar-greeting-icon`}
            style={{ color: iconColor }}
          />
          <span className="navbar-greeting-text">{greeting}</span>
        </div>
        <div className="small text-muted d-flex flex-column flex-sm-row align-items-end align-items-sm-center gap-0 gap-sm-2 navbar-datetime" style={{ fontSize: '0.8rem' }}>
          <span className="d-none d-sm-inline">{date}</span>
          <span className="d-inline d-sm-none">{shortDate}</span>
          <span>{time}</span>
        </div>
      </div>
    </div>
  );
}

export default NavBar;

