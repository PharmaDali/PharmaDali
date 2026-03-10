import { useState } from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import SideBar from "../components/SideBar";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="layout-wrapper">
      <NavBar onToggleSidebar={toggleSidebar} />
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
