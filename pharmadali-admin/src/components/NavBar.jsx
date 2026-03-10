import { useState, useEffect } from "react";

function NavBar({ onToggleSidebar }) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
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
    <div className="navbar-bar d-flex align-items-center p-3 gap-3 position-sticky top-0">
      <div
        className="d-flex flex-column justify-content-between hamburger-menu"
        onClick={onToggleSidebar}
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </div>

      <div className="flex-shrink-0">
        <img
          src="/main_logo.svg"
          alt="PharmaDali"
          style={{ height: 30, width: "auto" }}
        />
      </div>

      <div className="d-flex align-items-center gap-3 ms-auto flex-shrink-0">
        <div className="d-flex align-items-center gap-2 fw-medium">
          <i
            className={`fa-solid ${iconClass}`}
            style={{ fontSize: 24, color: iconColor }}
          />
          <span>{greeting}</span>
        </div>
        <div className="small">
          <div>{date}</div>
          <div>{time}</div>
        </div>
      </div>
    </div>
  );
}

export default NavBar;
