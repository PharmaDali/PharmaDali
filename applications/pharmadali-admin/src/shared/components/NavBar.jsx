import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function getGreeting(hour) {
  if (hour < 12) return { text: "Good Morning", icon: "fa-sun", color: "#FFD700" };
  if (hour < 18) return { text: "Good Afternoon", icon: "fa-cloud-sun", color: "#FFA500" };
  return { text: "Good Evening", icon: "fa-moon", color: "#6B7280" };
}

function NavBar({ onToggleSidebar, sidebarOpen }) {
  const now = new Date();
  // Greeting + date change at most once per hour — keep as React state (rare re-renders)
  const [greeting, setGreeting] = useState(() => getGreeting(now.getHours()));
  const [date] = useState(() =>
    now.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
  );
  const [shortDate] = useState(() =>
    now.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
  );

  // Time (updates every second) — written directly to DOM via ref.
  // This BYPASSES React's render cycle entirely so the sticky navbar never
  // triggers a React re-render during scroll, preventing compositor freezes.
  const timeRef = useRef(null);

  useEffect(() => {
    // Write initial time immediately
    if (timeRef.current) {
      timeRef.current.textContent = new Date().toLocaleTimeString("en-US", { hour12: false });
    }

    const tick = () => {
      const n = new Date();
      // Update time via DOM ref — zero React re-renders
      if (timeRef.current) {
        timeRef.current.textContent = n.toLocaleTimeString("en-US", { hour12: false });
      }
      // Update greeting via state only when the hour changes
      const newGreeting = getGreeting(n.getHours());
      setGreeting((prev) => {
        if (prev.text === newGreeting.text) return prev; // no re-render if unchanged
        return newGreeting;
      });
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
          <span className="d-none d-sm-inline">{date}</span>
          <span className="d-inline d-sm-none">{shortDate}</span>
          {/* timeRef: updated every second directly in the DOM — no React re-render */}
          <span ref={timeRef} />
        </div>
      </div>
    </div>
  );
}

export default NavBar;
