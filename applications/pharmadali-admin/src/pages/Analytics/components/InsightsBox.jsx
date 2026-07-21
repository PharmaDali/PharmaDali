import aiIcon from "../../../assets/icons/analytics-and-forecasting/AI.svg";

export default function InsightsBox({ text }) {
  return (
    <div className="analytics-insight-card h-100">
      <div className="analytics-insight-icon-wrap">
        <img src={aiIcon} alt="Insight Icon" />
      </div>
      <div className="analytics-insight-box">
        {text}
      </div>
    </div>
  );
}
