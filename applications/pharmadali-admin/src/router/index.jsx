import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashBoard from "../pages/DashBoard";
import SalesReports from "../pages/SalesReports";
import Settings from "../pages/Settings";
import PosPage from "../pages/PosPage";
import PickUp from "../pages/PickUp";
import Notifications from "../pages/Notifications";
import Login from "../pages/Login";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import Analytics from "../pages/Analytics";
import Inventory from "../pages/Inventory";
import InventoryLogs from "../pages/InventoryLogs";
import Pharmacists from "../pages/Pharmacists";
import GetTechnicalHelp from "../pages/GetTechnicalHelp";


import Profile from "../pages/Profile";

import PermissionGuard from "../shared/components/PermissionGuard";
import { useOutletContext } from "react-router-dom";

function RouteGuard({ permission, element }) {
  const context = useOutletContext() || {};
  return (
    <PermissionGuard user={context.user} permission={permission}>
      {element}
    </PermissionGuard>
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashBoard />} />
          <Route path="sales-reports" element={<RouteGuard permission="view_sales_reports" element={<SalesReports />} />} />
          <Route path="settings" element={<RouteGuard permission="manage_settings" element={<Settings />} />} />
          <Route path="pos" element={<RouteGuard permission="access_pos" element={<PosPage />} />} />
          <Route path="pick-up" element={<RouteGuard permission="access_pickup" element={<PickUp />} />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="analytics" element={<RouteGuard permission="view_analytics" element={<Analytics />} />} />
          <Route path="inventory" element={<RouteGuard permission="view_inventory" element={<Inventory />} />} />
          <Route path="inventory/logs" element={<RouteGuard permission="view_inventory" element={<InventoryLogs />} />} />
          <Route path="pharmacists" element={<RouteGuard permission="manage_pharmacists" element={<Pharmacists />} />} />
                    <Route path="get-technical-help" element={<GetTechnicalHelp />} />

          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
