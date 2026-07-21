import { useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { DiscountOverlay } from "./DiscountRules";
import { SurchargeOverlay } from "./SurchargeRules";
import { TaxOverlay } from "./TaxOverlay";
import "../../assets/css/settings/common.css";

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

export const PricingRules = ({ onNavigate }) => {
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [isSurchargeOpen, setIsSurchargeOpen] = useState(false);
  const [isTaxOpen, setIsTaxOpen] = useState(false);

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

      <div className="settings-list-container">
        {items.map((item) => (
          <div
            key={item.id}
            className="settings-list-item"
            onClick={() => {
              if (item.id === "discount") {
                setIsDiscountOpen(true);
              } else if (item.id === "surcharge") {
                setIsSurchargeOpen(true);
              } else if (item.id === "tax") {
                setIsTaxOpen(true);
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
                } else if (item.id === "surcharge") {
                  setIsSurchargeOpen(true);
                } else if (item.id === "tax") {
                  setIsTaxOpen(true);
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
            <span className="settings-list-item-arrow">›</span>
          </div>
        ))}
      </div>

      <DiscountOverlay isOpen={isDiscountOpen} onClose={() => setIsDiscountOpen(false)} />
      <SurchargeOverlay isOpen={isSurchargeOpen} onClose={() => setIsSurchargeOpen(false)} />
      <TaxOverlay isOpen={isTaxOpen} onClose={() => setIsTaxOpen(false)} />
    </>
  );
};
