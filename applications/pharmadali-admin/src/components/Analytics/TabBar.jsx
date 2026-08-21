import DemandIcon from "./icons/DemandIcon";
import SalesIcon from "./icons/SalesIcon";

export default function TabBar({ activeTab, onTabChange }) {
  const isDemand = activeTab === "demand";
  const isSales = activeTab === "sales";

  return (
    <div className="analytics-tabs mb-4">
      <button 
        className={`analytics-tab ${isDemand ? "active" : ""}`}
        onClick={() => onTabChange("demand")}
      >
        <DemandIcon className="analytics-tab-icon" />
        Demand
      </button>
      <button 
        className={`analytics-tab ${isSales ? "active" : ""}`}
        onClick={() => onTabChange("sales")}
      >
        <SalesIcon className="analytics-tab-icon" />
        Sales
      </button>
    </div>
  );
}
