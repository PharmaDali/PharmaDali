import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";
import { getCurrentUser } from "../services/loginService";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    /**
    * Triggers the auth interceptor to handle potential token expiration on mount.
    * Rejections are suppressed to prevent uncaught promise warnings in the console,
    * as auth failures are handled globally.
    */
    getCurrentUser().catch(() => { });
  }, []);

  return (
    <div className="layout-wrapper">
      <NavBar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <SideBar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <main
        className={`main-content${sidebarOpen ? " sidebar-open" : ""}`}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
