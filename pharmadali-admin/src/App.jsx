import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashBoard from "./pages/DashBoard";
import SalesReports from "./pages/SalesReports";
import Settings from "./pages/Settings";
import PosPage from "./pages/PosPage";
import PickUp from "./pages/PickUp";
import Notifications from "./pages/Notifications";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AnalyticsAndForecasting from "./pages/AnalyticsAndForecasting";
import Inventory from "./pages/Inventory";
import InventoryLogs from "./pages/InventoryLogs";
import Pharmacists from "./pages/Pharmacists";
import GetTechnicalHelp from "./pages/GetTechnicalHelp";

function App() {
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
          <Route path="analytics-and-forecasting" element={<AnalyticsAndForecasting />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/logs" element={<InventoryLogs />} />
          <Route path="pharmacists" element={<Pharmacists />} />
          <Route path="get-technical-help" element={<GetTechnicalHelp />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
