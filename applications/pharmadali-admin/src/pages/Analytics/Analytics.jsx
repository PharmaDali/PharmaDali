import { useAnalyticsData } from "./hooks/useAnalyticsData";
import { demandOptions, salesOptions } from "./constants";
import TabBar from "./components/TabBar";
import InsightsBox from "./components/InsightsBox";
import AnalyticsTable from "./components/AnalyticsTable";
import AnalyticsChart from "./components/AnalyticsChart";
import AnalyticsMetrics from "./components/AnalyticsMetrics";
import "../../assets/css/analytics.css";

export default function Analytics() {
  const {
    activeTab,
    setActiveTab,
    currentMetrics,
    tableTimeframe,
    setTableTimeframe,
    demandData,
    salesData,
    tableLoading,
    periodInfo,
    onPrevPeriod,
    onNextPeriod,
    chartTimeframe,
    setChartTimeframe,
    chartTimeseries,
    chartLoading,
    insightText,
    insightLoading,
    insightSource,
    isDemand,
  } = useAnalyticsData();

  return (
    <section className="analytics-page" aria-label="Analytics overview">
      <header className="mb-4">
        <h4 className="fw-bold mb-1 analytics-title">Analytics</h4>
        <p className="analytics-subtitle mb-0">Analytics and sales trends related to the pharmacy.</p>
      </header>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      <AnalyticsMetrics metrics={currentMetrics} loading={tableLoading} />

      <div className="row g-4 mb-4">
        <div className="col-lg-3">
          <InsightsBox text={insightText} loading={insightLoading} source={insightSource} />
        </div>
        <div className="col-lg-9">
          <AnalyticsTable
            data={isDemand ? demandData : salesData}
            columnLabel={isDemand ? "Demand" : "Sales"}
            tableTitle={isDemand ? "Top Demand Products" : "Top Sales Products"}
            timeframe={tableTimeframe}
            onTimeframeChange={setTableTimeframe}
            timeframeOptions={isDemand ? demandOptions : salesOptions}
            loading={tableLoading}
            periodInfo={periodInfo}
            onPrevPeriod={onPrevPeriod}
            onNextPeriod={onNextPeriod}
          />
        </div>
      </div>

      <AnalyticsChart
        chartData={chartTimeseries}
        chartTitle={isDemand ? "Demand Trend Chart" : "Sales Trend Chart"}
        isCurrency={!isDemand}
        timeframe={chartTimeframe}
        onTimeframeChange={setChartTimeframe}
        timeframeOptions={isDemand ? demandOptions : salesOptions}
        loading={chartLoading}
        chartType={isDemand ? "bar" : "line"}
      />
    </section>
  );
}
