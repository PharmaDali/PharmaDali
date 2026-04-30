import { useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { CategoryManagement } from "./CategoryManagement";
import { ItemManagement } from "./ItemManagement";

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

      <header style={{ marginBottom: "1.5rem" }}>
        <h5 style={{ color: "#48aad9", fontSize: "1.25rem", fontWeight: "700", marginBottom: "0.2rem" }}>Products Configuration</h5>
        <p style={{ color: "#888", fontSize: "0.9rem" }}>Configure product categories, items, and pricing rules.</p>
      </header>

      <div className="settings-form-container" style={{ background: "white", borderRadius: "20px", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
        {/* Category Item */}
        <div 
          onClick={() => setView("category")}
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            padding: "1.2rem 1.5rem", 
            cursor: "pointer",
            borderBottom: "1px solid #f0f0f0",
            transition: "background 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "#f9f9f9"}
          onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
        >
          <div>
            <h6 style={{ fontSize: "1rem", fontWeight: "700", color: "#333", margin: "0 0 0.2rem" }}>Category</h6>
            <p style={{ fontSize: "0.85rem", color: "#555", margin: 0 }}>Import, add, delete, and update category.</p>
          </div>
          <div style={{ color: "#aaa" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

        {/* Item Item */}
        <div 
          onClick={() => setView("item")}
          style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            padding: "1.2rem 1.5rem", 
            cursor: "pointer",
            transition: "background 0.2s"
          }}
          onMouseOver={(e) => e.currentTarget.style.background = "#f9f9f9"}
          onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
        >
          <div>
            <h6 style={{ fontSize: "1rem", fontWeight: "700", color: "#333", margin: "0 0 0.2rem" }}>Item</h6>
            <p style={{ fontSize: "0.85rem", color: "#555", margin: 0 }}>Import, add, delete, and update item.</p>
          </div>
          <div style={{ color: "#aaa" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};
