import { useAnalyticsData } from "../hooks/useAnalyticsData";
import TabBar from "../components/Analytics/TabBar";
import InsightsBox from "../components/Analytics/InsightsBox";
import AnalyticsTable from "../components/Analytics/AnalyticsTable";
import AnalyticsChart from "../components/Analytics/AnalyticsChart";
import AnalyticsMetrics from "../components/Analytics/AnalyticsMetrics";
import "../assets/css/analytics.css";

export default function Analytics() {
  const { tab, metrics, insight, table, chart } = useAnalyticsData();

  return (
    <section className="analytics-page" aria-label="Analytics overview">
      <header className="mb-4">
        <h4 className="fw-bold mb-1 admin-page-title">Analytics</h4>
        <p className="analytics-subtitle mb-0">Analytics and sales trends related to the pharmacy.</p>
      </header>

      <TabBar activeTab={tab.active} onTabChange={tab.setActive} />

      <AnalyticsMetrics metrics={metrics.data} loading={metrics.loading} />

      <div className="row g-4 mb-4">
        <div className="col-lg-3">
          <InsightsBox text={insight.text} loading={insight.loading} source={insight.source} />
        </div>
        <div className="col-lg-9">
          <AnalyticsTable {...table} />
        </div>
      </div>

      <AnalyticsChart {...chart} />
    </section>
  );
}
