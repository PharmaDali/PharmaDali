import { formatDateTime } from "../../utils/formatUtils";
import { Skeleton } from "../../shared/components/loading";

const TIMEFRAME_OPTIONS = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

export default function InsightsBox({
  text,
  loading = false,
  source = "gemini",
  timeframe = "daily",
  onTimeframeChange,
  generatedAt = null,
  activeTab = "demand",
}) {
  return (
    <div className="analytics-insight-card h-100 d-flex flex-column">
      <div className="analytics-table-header d-flex align-items-center justify-content-between mb-3">
        <h5 className="analytics-table-title mb-0">AI Insights</h5>
        <span
          className="badge rounded-pill bg-info-subtle text-info border border-info-subtle px-2 py-1"
          style={{ fontSize: "11px", fontWeight: 600 }}
        >
          <i className={`fa-solid fa-wand-magic-sparkles me-1 ${loading ? "fa-spin" : ""}`} />
          {loading ? "Analyzing..." : "Gemini AI"}
        </span>
      </div>

      <div className="analytics-insight-timeframe-pills d-flex align-items-center gap-1 mb-3">
        {TIMEFRAME_OPTIONS.map((opt) => {
          const isActive = timeframe === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              className={`btn btn-sm flex-fill py-1 px-2 rounded-pill border-0 ${
                isActive ? "text-white shadow-sm" : "text-muted"
              }`}
              style={{
                fontSize: "11px",
                fontWeight: isActive ? 600 : 500,
                backgroundColor: isActive ? "var(--pd-primary, #2aabe2)" : "#f1f5f9",
                transition: "all 0.15s ease-in-out",
                opacity: loading ? 0.65 : 1,
              }}
              onClick={() => onTimeframeChange && onTimeframeChange(opt.value)}
              disabled={loading}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="analytics-insight-box flex-grow-1 d-flex flex-column justify-content-between">
        {loading ? (
          <div className="d-flex flex-column gap-2 py-2 flex-grow-1 justify-content-center">
            <Skeleton width="96%" height={13} borderRadius={4} />
            <Skeleton width="100%" height={13} borderRadius={4} />
            <Skeleton width="88%" height={13} borderRadius={4} />
            <Skeleton width="65%" height={13} borderRadius={4} />
          </div>
        ) : (
          <p className="mb-0" style={{ fontSize: "13.5px", lineHeight: "1.6" }}>
            {text || "No AI insight available for this timeframe."}
          </p>
        )}

        <div
          className="analytics-insight-footer pt-2 mt-3 border-top border-info-subtle d-flex align-items-center justify-content-between text-muted"
          style={{ fontSize: "10.5px" }}
        >
          {loading ? (
            <>
              <Skeleton width={115} height={11} borderRadius={4} />
              <Skeleton width={26} height={11} borderRadius={4} />
            </>
          ) : (
            <>
              <span>
                <i className="fa-solid fa-clock-rotate-left me-1" />
                {generatedAt ? `Updated ${formatDateTime(generatedAt)}` : "Daily scheduled update"}
              </span>
              <span className="text-secondary opacity-75">
                PST
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

