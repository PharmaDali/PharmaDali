import { useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { DiscountOverlay } from "./DiscountRules";

const items = [
  {
    id: "discount",
    label: "Discount",
    description: "Add, delete, and update discount.",
  },
  {
    id: "surcharge",
    label: "Surcharge",
    description: "Add, delete, and update surcharge.",
  },
  {
    id: "tax",
    label: "Tax",
    description: "Setup tax.",
  },
];

export const ProductsPricing = ({ onNavigate }) => {
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);

  return (
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
          <p className="settings-detail-subtitle">Configure product categories, items, and pricing rules.</p>
        </div>
      </header>

      <div className="settings-list-container settings-list-container--nested">
        {items.map((item) => (
          <div
            key={item.id}
            className="settings-list-item"
            onClick={() => {
              if (item.id === "discount") {
                setIsDiscountOpen(true);
              } else {
                onNavigate(item.id);
              }
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                if (item.id === "discount") {
                  setIsDiscountOpen(true);
                } else {
                  onNavigate(item.id);
                }
              }
            }}
          >
            <div className="settings-list-item-content">
              <h6 className="settings-list-item-label">{item.label}</h6>
              <p className="settings-list-item-description">{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      <DiscountOverlay isOpen={isDiscountOpen} onClose={() => setIsDiscountOpen(false)} />
    </>
  );
};
