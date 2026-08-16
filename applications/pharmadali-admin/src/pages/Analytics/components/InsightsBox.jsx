import aiIcon from "../../../assets/icons/analytics-and-forecasting/AI.svg";

export default function InsightsBox({ text, loading = false, source = "gemini" }) {
  return (
    <div className="analytics-insight-card h-100">
      <div className="analytics-insight-icon-wrap d-flex align-items-center justify-content-between">
        <span className="badge rounded-pill bg-info-subtle text-info border border-info-subtle px-2 py-1" style={{ fontSize: "11px", fontWeight: 600 }}>
          <i className="fa-solid fa-wand-magic-sparkles me-1" />
          {source === "gemini" ? "Gemini AI" : "AI Insight"}
        </span>
        <img src={aiIcon} alt="Insight Icon" style={{ width: 28, height: 28 }} />
      </div>
      <div className="analytics-insight-box mt-3">
        {loading ? (
          <div className="d-flex align-items-center justify-content-center py-3 text-muted">
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
            <span style={{ fontSize: 13 }}>Generating AI insight...</span>
          </div>
        ) : (
          text
        )}
      </div>
    </div>
  );
}
