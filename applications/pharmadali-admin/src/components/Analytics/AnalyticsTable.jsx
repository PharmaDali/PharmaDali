import arrowDropDownIcon from "../../assets/icons/analytics-and-forecasting/arrow_drop_down.svg";
import TrendArrow from "./icons/TrendArrow";
import { TableSkeleton } from "../../shared/components/loading";

export default function AnalyticsTable({ 
  data, 
  columnLabel, 
  tableTitle, 
  timeframe, 
  onTimeframeChange, 
  timeframeOptions, 
  loading,
  periodInfo,
  onPrevPeriod,
  onNextPeriod,
}) {
  return (
    <div className="analytics-panel h-100 p-4 d-flex flex-column">
      <div className="analytics-table-header">
        <h5 className="analytics-table-title">{tableTitle}</h5>
        
        <div className="analytics-filter ms-auto d-flex align-items-center gap-3">
          {periodInfo && (
            <div className="analytics-period-box">
              <button 
                type="button"
                className="analytics-period-arrow" 
                onClick={onPrevPeriod}
                disabled={loading}
                title="Previous Period"
              >
                &#9664;
              </button>
              <span className="analytics-period-label">
                {periodInfo.label}
              </span>
              <button 
                type="button"
                className="analytics-period-arrow" 
                onClick={onNextPeriod}
                disabled={loading || periodInfo.isCurrentPeriod}
                title="Next Period"
              >
                &#9654;
              </button>
            </div>
          )}

          <div className="d-flex align-items-center">
            <span className="analytics-filter-label">Sort by:</span>
            <div className="position-relative d-inline-block">
              <select 
                className="form-select form-select-sm analytics-select" 
                aria-label="Timeframe filter"
                value={timeframe}
                onChange={(e) => onTimeframeChange(e.target.value)}
                disabled={loading}
              >
                {timeframeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <img 
                src={arrowDropDownIcon} 
                alt="" 
                className="analytics-select-icon position-absolute top-50 translate-middle-y" 
                style={{right: '10px', pointerEvents: 'none'}} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-table-wrapper flex-grow-1">
        <table className="table analytics-table table-borderless mb-0">
          <thead>
            <tr>
              <th>Product Name</th>
              <th className="text-end">{columnLabel}</th>
              <th className="text-end" style={{width: '90px'}}>Trend</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableSkeleton rows={5} columns={3} showAvatar={false} />
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-muted">
                  No data available for the selected timeframe.
                </td>
              </tr>
            ) : (
              data.map((item, index) => {
                let direction = "stable";
                let color = "#ffc107"; // yellow for stable
                let sign = "";
                
                if (item.delta > 0) {
                  direction = "up";
                  color = "#28a745"; // green
                  sign = "+";
                } else if (item.delta < 0) {
                  direction = "down";
                  color = "#dc3545"; // red
                }

                return (
                  <tr key={index}>
                    <td>{item.product}</td>
                    <td className="text-end fw-semibold" style={{color: '#344767'}}>{item.value}</td>
                    <td className="text-end fw-medium" style={{fontSize: '13px', color}}>
                      <TrendArrow direction={direction} /> {sign}{item.delta}%
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
      </div>
    </div>
  );
}
