import { Breadcrumb } from "./Breadcrumb";

const rules = [
  {
    id: "discount",
    name: "Branch-wide discount",
    helper: "Apply a percentage discount to selected product groups.",
  },
  {
    id: "rounding",
    name: "Price rounding",
    helper: "Round prices to your preferred denomination.",
  },
];

export const PricingRules = ({ onNavigate }) => (
  <>
    <Breadcrumb
      crumbs={[
        { label: "Settings", view: "settings" },
        { label: "Products and Pricing", view: "products" },
        { label: "Pricing Rules", view: "pricing-rules" },
      ]}
      onNavigate={onNavigate}
    />

    <header className="settings-detail-header">
      <div>
        <h5 className="fw-bold settings-detail-title">Pricing Rules</h5>
        <p className="settings-detail-subtitle">Define pricing behavior for products and promos.</p>
      </div>
    </header>

    <div className="settings-form-container">
      <div className="settings-section-list">
        {rules.map((rule, index) => (
          <div
            key={rule.id}
            className={`settings-section-row${index === rules.length - 1 ? " is-last" : ""}`}
          >
            <div className="settings-section-left">
              <p className="settings-section-title">{rule.name}</p>
              <p className="settings-section-helper">{rule.helper}</p>
            </div>
            <div className="settings-section-right">
              <button type="button" className="btn btn-outline-primary btn-sm">
                Configure
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
);
