import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import DashBoard from "../pages/DashBoard";
import SalesReports from "../pages/SalesReports";
import Settings from "../pages/Settings";
import PosPage from "../pages/PosPage";
import PickUp from "../pages/PickUp";
import Notifications from "../pages/Notifications";
import Login from "../pages/Login";
import ProtectedRoute from "../components/ProtectedRoute";
import Analytics from "../pages/Analytics/Analytics";
import Inventory from "../pages/inventory/Inventory";
import InventoryLogs from "../pages/InventoryLogs";
import Pharmacists from "../pages/Pharmacists";
import GetTechnicalHelp from "../pages/GetTechnicalHelp";
import Profile from "../pages/Profile";

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
          <Route path="sales-reports" element={<SalesReports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="pos" element={<PosPage />} />
          <Route path="pick-up" element={<PickUp />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/logs" element={<InventoryLogs />} />
          <Route path="pharmacists" element={<Pharmacists />} />
          <Route path="get-technical-help" element={<GetTechnicalHelp />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
