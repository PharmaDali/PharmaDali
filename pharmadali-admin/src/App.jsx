import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashBoard from "./pages/DashBoard";
import SalesReports from "./pages/SalesReports";
import Settings from "./pages/Settings";
import PosPage from "./pages/PosPage";
import PickUp from "./pages/PickUp";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<DashBoard />} />
          <Route path="sales-reports" element={<SalesReports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="pos" element={<PosPage />} />
          <Route path="pick-up" element={<PickUp />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
