import { Breadcrumb } from "./Breadcrumb";
import "../../assets/css/settings/common.css";

const items = [
  {
    id: "product-config",
    label: "Product Configuration",
    description: "Basic pharmacy information and system display preferences.",
  },
  {
    id: "pricing-rules",
    label: "Pricing Rules",
    description: "Basic pharmacy information and system display preferences.",
  },
];

export const ProductsPricing = ({ onNavigate }) => (
  <>
    <Breadcrumb
      crumbs={[
        { label: "Settings", view: "settings" },
        { label: "Products and Pricing", view: "products" },
      ]}
      onNavigate={onNavigate}
    />

    <header className="settings-detail-header">
      <div>
        <h5 className="fw-bold settings-detail-title">Products and Pricing</h5>
        <p className="settings-detail-subtitle">Configure product categories, items, and pricing rules.</p>
      </div>
    </header>

    <div className="settings-list-container settings-list-container--nested">
      {items.map((item) => (
        <div
          key={item.id}
          className="settings-list-item"
          onClick={() => onNavigate(item.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onNavigate(item.id);
            }
          }}
        >
          <div className="settings-list-item-content">
            <h6 className="settings-list-item-label">{item.label}</h6>
            <p className="settings-list-item-description">{item.description}</p>
          </div>
          <span className="settings-list-item-arrow">›</span>
        </div>
      ))}
    </div>
  </>
);
