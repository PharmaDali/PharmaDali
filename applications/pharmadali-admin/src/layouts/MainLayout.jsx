import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import NavBar from "../shared/components/NavBar";
import SideBar from "../shared/components/SideBar";
import ToastNotification from "../shared/components/ToastNotification";
import Modal from "../shared/components/Modal";
import infoIcon from "../assets/icons/modal-icons/info.svg";
import { getCurrentUser } from "../services/loginService";
import { usePickupOrdersCount } from "../hooks/usePickupOrders";
import { useNotifications } from "../hooks/useNotifications";

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const { readyPickupCount } = usePickupOrdersCount();
  const notifications = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  useEffect(() => {
    /**
    * Triggers the auth interceptor to handle potential token expiration on mount.
    * Rejections are suppressed to prevent uncaught promise warnings in the console,
    * as auth failures are handled globally.
    */
    getCurrentUser()
      .then((data) => {
        setUser(data);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (user?.requires_password_change) {
      if (location.pathname !== "/settings") {
        setShowPasswordPrompt(true);
      } else {
        setShowPasswordPrompt(false);
      }
    } else {
      setShowPasswordPrompt(false);
    }
  }, [user, location.pathname]);

  const handleGoToSettings = () => {
    setShowPasswordPrompt(false);
    navigate("/settings?view=account", { replace: true });
  };

  return (
    <div className="layout-wrapper">
      <ToastNotification toast={notifications.activeToast} onClose={notifications.clearToast} />
      <NavBar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <SideBar isOpen={sidebarOpen} onToggle={toggleSidebar} readyPickupOrdersCount={readyPickupCount} unreadNotificationsCount={notifications.unreadCount} user={user} />
      <main
        className={`main-content${sidebarOpen ? " sidebar-open" : ""}`}
      >
        <Outlet context={{ notifications, user, setUser }} />
      </main>

      <Modal 
        isOpen={showPasswordPrompt} 
        onClose={() => {}} 
        size="sm" 
        closeOnOverlay={false} 
        closeOnEscape={false}
        showCloseButton={false}
      >
        <div className="text-center py-3 px-2">
          <div className="mb-3 d-flex justify-content-center">
             <img src={infoIcon} alt="Info" style={{ width: "60px", height: "60px" }} />
          </div>
          <h5 className="fw-bold mb-3">Action Required</h5>
          <p className="text-muted small mb-4">
            You are using a system-generated temporary password. For your security, you must create a new password before you can access the dashboard.
          </p>
          <button 
            className="btn btn-primary w-100" 
            onClick={handleGoToSettings} 
            style={{ backgroundColor: "var(--pd-primary)", border: "none" }}
          >
            Go to Password Settings
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default MainLayout;


