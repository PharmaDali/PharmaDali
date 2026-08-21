import React from "react";
import { Navigate } from "react-router-dom";
import { useDashboard } from "../hooks/useDashboard";
import StatCard from "../components/Dashboard/StatCard";
import SalesTrend from "../components/Dashboard/SalesTrend";
import QuickInsights from "../components/Dashboard/QuickInsights";
import InventoryHealth from "../components/Dashboard/InventoryHealth";
import "../assets/css/dashboard.css";

export function DashBoard() {
  const { user, overviewData, loading, statCards, navigate } = useDashboard();

  if (user?.role === "pharmacist") {
    return <Navigate to="/pos" replace />;
  }

  return (
    <section className="dashboard-page" aria-label="Dashboard overview">
      <header className="dashboard-page-header mb-4">
        <h4 className="fw-bold mb-1 dashboard-title">Dashboard</h4>
        <p className="dashboard-subtitle mb-0">A quick operational snapshot of pharmacy sales, inventory, and analytics.</p>
      </header>

      <div className="row g-3 mb-4">
        {statCards.map((c) => (
          <div key={c.label} className="col-12 col-sm-6 col-md-4 col-lg">
            <StatCard {...c} loading={loading && !overviewData} />
          </div>
        ))}
      </div>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-7 col-lg-8">
          <SalesTrend initialTrend={overviewData?.sales_trend} loading={loading && !overviewData} />
        </div>
        <div className="col-12 col-md-5 col-lg-4">
          <QuickInsights items={overviewData?.quick_insights} loading={loading && !overviewData} />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <InventoryHealth data={overviewData?.inventory_health} onKnowMore={() => navigate("/inventory")} />
        </div>
      </div>
    </section>
  );
}

export default DashBoard;
