import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import SalesReports from "./pages/SalesReports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="sales-reports" element={<SalesReports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
