import { useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { CategoryManagement } from "./CategoryManagement";
import { ItemManagement } from "./ItemManagement";
import "../../assets/css/settings/common.css";

export const ProductConfiguration = ({ onNavigate }) => {
  const [view, setView] = useState("menu"); // "menu", "category", or "item"

  if (view === "category") {
    return <CategoryManagement onBack={() => setView("menu")} onNavigate={onNavigate} />;
  }

  if (view === "item") {
    return <ItemManagement onBack={() => setView("menu")} onNavigate={onNavigate} />;
  }

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Settings", view: "settings" },
          { label: "Products and Pricing", view: "products" },
          { label: "Products Configuration", view: "product-config" },
        ]}
        onNavigate={onNavigate}
      />

      <header className="settings-header">
        <h5 className="settings-header-title">Products Configuration</h5>
        <p className="settings-header-subtitle">Configure product categories, items, and pricing rules.</p>
      </header>

      <div className="settings-menu-container">
        {/* Category Item */}
        <div className="settings-menu-item" onClick={() => setView("category")}>
          <div>
            <h6 className="settings-menu-item-title">Category</h6>
            <p className="settings-menu-item-desc">Import, add, delete, and update category.</p>
          </div>
          <div className="settings-menu-item-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

        {/* Item Item */}
        <div className="settings-menu-item" onClick={() => setView("item")}>
          <div>
            <h6 className="settings-menu-item-title">Item</h6>
            <p className="settings-menu-item-desc">Import, add, delete, and update item.</p>
          </div>
          <div className="settings-menu-item-arrow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};
