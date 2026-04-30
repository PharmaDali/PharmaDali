import { useMemo, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";

const defaultForm = {
  enabled: true,
  name: "",
  background: "#ffffff",
  font: "#000000",
};

const seedCategories = [
  { id: 1, name: "Branded", enabled: true, background: "#bfe1f2", font: "#000000" },
  { id: 2, name: "Generic", enabled: true, background: "#f5f7fa", font: "#000000" },
  { id: 3, name: "Cosmetics", enabled: true, background: "#fce4ec", font: "#000000" },
  { id: 4, name: "Diapers", enabled: true, background: "#e3f2fd", font: "#000000" },
  { id: 5, name: "Drinks", enabled: true, background: "#fff3e0", font: "#000000" },
  { id: 6, name: "Infant", enabled: true, background: "#ede7f6", font: "#000000" },
  { id: 7, name: "Milk", enabled: true, background: "#fffde7", font: "#000000" },
  { id: 8, name: "Supplies", enabled: true, background: "#e8f5e9", font: "#000000" },
  { id: 9, name: "Vitamins", enabled: true, background: "#f1f8e9", font: "#000000" },
  { id: 10, name: "Injectables/Vial", enabled: true, background: "#e0f7fa", font: "#000000" },
];

export const ProductConfiguration = ({ onNavigate }) => {
  const [view, setView] = useState("menu"); // "menu" or "category"
  const [categories, setCategories] = useState(seedCategories);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ type: null, categoryId: null });
  const [formData, setFormData] = useState(defaultForm);

  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return categories;
    }
    return categories.filter((category) => category.name.toLowerCase().includes(normalizedQuery));
  }, [categories, query]);

  const openAddModal = () => {
    setFormData(defaultForm);
    setModal({ type: "add", categoryId: null });
  };

  const openEditModal = (category) => {
    setFormData({
      enabled: category.enabled,
      name: category.name,
      background: category.background,
      font: category.font,
    });
    setModal({ type: "edit", categoryId: category.id });
  };

  const openDeleteModal = (category) => {
    setModal({ type: "delete", categoryId: category.id });
  };

  const closeModal = () => setModal({ type: null, categoryId: null });

  const handleSave = () => {
    if (modal.type === "add") {
      const nextId = Math.max(0, ...categories.map((cat) => cat.id)) + 1;
      setCategories((prev) => [
        ...prev,
        {
          id: nextId,
          name: formData.name || "New Category",
          enabled: formData.enabled,
          background: formData.background,
          font: formData.font,
        },
      ]);
      closeModal();
      return;
    }

    if (modal.type === "edit") {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === modal.categoryId
            ? {
              ...cat,
              name: formData.name || cat.name,
              enabled: formData.enabled,
              background: formData.background,
              font: formData.font,
            }
            : cat,
        ),
      );
      closeModal();
    }
  };

  const handleDelete = () => {
    setCategories((prev) => prev.filter((cat) => cat.id !== modal.categoryId));
    closeModal();
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetPalette = () => {
    setFormData((prev) => ({ ...prev, background: "#ffffff", font: "#000000" }));
  };

  const activeCategory = categories.find((cat) => cat.id === modal.categoryId);

  if (view === "menu") {
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
              padding: "1rem 1.5rem", 
              cursor: "pointer",
              borderBottom: "1px solid #f0f0f0",
              transition: "background 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#f9f9f9"}
            onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
          >
            <div>
              <h6 style={{ fontSize: "1rem", fontWeight: "700", color: "#333", margin: "0 0 0.2rem" }}>Category</h6>
              <p style={{ fontSize: "0.85rem", color: "#555", margin: 0 }}>Basic pharmacy information and system display preferences.</p>
            </div>
            <div style={{ color: "#aaa" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </div>

          {/* Item Item */}
          <div 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              padding: "1rem 1.5rem", 
              cursor: "pointer",
              transition: "background 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#f9f9f9"}
            onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
          >
            <div>
              <h6 style={{ fontSize: "1rem", fontWeight: "700", color: "#333", margin: "0 0 0.2rem" }}>Item</h6>
              <p style={{ fontSize: "0.85rem", color: "#555", margin: 0 }}>Basic pharmacy information and system display preferences.</p>
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
  }

  return (
    <>
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #48aad9;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #358ab3;
          }
        `}
      </style>
      <div style={{ marginBottom: "1.5rem" }}>
        <Breadcrumb
          crumbs={[
            { label: "Settings", view: "settings" },
            { label: "Products and Pricing", view: "products" },
            { label: "Products Configuration", onClick: () => setView("menu") },
            { label: "Category", view: "category" },
          ]}
          onNavigate={onNavigate}
        />
        <p style={{ color: "#666", fontSize: "0.85rem", marginTop: "-1rem" }}>
          Configure product categories, items, and pricing rules.
        </p>
      </div>

      <div style={{ background: "white", borderRadius: "15px", padding: "1.5rem", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", marginBottom: "1.5rem" }}>
          <div>
            <h5 style={{ color: "#333", fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.2rem" }}>Category</h5>
            <p style={{ color: "#888", fontSize: "0.8rem", margin: 0 }}>Import, add, delete, and update category.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ position: "relative", width: "300px" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search category"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                style={{ 
                  width: "100%", 
                  padding: "0.55rem 1rem 0.55rem 2.5rem", 
                  background: "#e9eff4", 
                  border: "none", 
                  borderRadius: "10px", 
                  fontSize: "0.85rem",
                  color: "#333"
                }}
              />
            </div>
            <button 
              type="button" 
              onClick={openAddModal}
              style={{ width: "36px", height: "36px", background: "#48aad9", color: "white", border: "none", borderRadius: "10px", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              +
            </button>
            <button 
              type="button" 
              style={{ background: "transparent", border: "none", color: "#48aad9", fontSize: "1.5rem", cursor: "pointer", display: "flex", flexDirection: "column", gap: "2px", padding: "0 5px" }}
            >
              <div style={{ width: "3.5px", height: "3.5px", background: "#48aad9", borderRadius: "50%" }}></div>
              <div style={{ width: "3.5px", height: "3.5px", background: "#48aad9", borderRadius: "50%" }}></div>
              <div style={{ width: "3.5px", height: "3.5px", background: "#48aad9", borderRadius: "50%" }}></div>
            </button>
          </div>
        </div>

        <div className="settings-table-card custom-scrollbar" style={{ maxHeight: "750px", overflowY: "auto", paddingRight: "10px" }}>
          {filteredCategories.map((category, index) => (
            <div
              key={category.id}
              className="settings-table-row"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 0.5rem", borderBottom: "1px solid #f0f0f0" }}
            >
              <div style={{ fontSize: "1rem", color: "#333", fontWeight: "500" }}>
                {category.name}
              </div>
              <div className="settings-table-actions" style={{ display: "flex", gap: "0.8rem" }}>
                <button
                  type="button"
                  onClick={() => openEditModal(category)}
                  style={{ background: "white", border: "1px solid #48aad9", color: "#48aad9", padding: "0.3rem 1.2rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => openDeleteModal(category)}
                  style={{ background: "white", border: "1px solid #ff6b6b", color: "#ff6b6b", padding: "0.3rem 1.2rem", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>No categories found.</div>
          )}
        </div>
      </div>

      {modal.type && (
        <div className="settings-modal-backdrop" role="presentation" onClick={closeModal}>
          <div
            className={`settings-modal${modal.type === "delete" ? " settings-modal--confirm" : ""}`}
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
            style={{ maxWidth: modal.type === "delete" ? "420px" : "500px", width: "90%", borderRadius: "25px", padding: "1.5rem" }}
          >
            {modal.type === "delete" ? (
              <>
                <div className="settings-modal-header" style={{ textAlign: "center", marginBottom: "0.5rem", marginTop: "0.5rem" }}>
                  <h4 className="settings-modal-title" style={{ fontSize: "1.25rem", fontWeight: "700", color: "#333", lineHeight: "1.4", margin: 0 }}>
                    Are you sure you want to delete<br/>
                    "{activeCategory?.name || "this"}" category?
                  </h4>
                  <p style={{ color: "#aaa", fontSize: "0.9rem", marginTop: "1.2rem", maxWidth: "280px", margin: "1.2rem auto 0" }}>
                    All important data related to it will be lost once you continue.
                  </p>
                </div>
                <div className="settings-modal-footer" style={{ display: "flex", gap: "1.5rem", marginTop: "2rem", width: "100%" }}>
                  <button 
                    type="button" 
                    style={{ flex: 1, background: "#48aad9", color: "white", border: "none", borderRadius: "15px", padding: "0.8rem", fontWeight: "700", fontSize: "1rem", cursor: "pointer" }} 
                    onClick={handleDelete}
                  >
                    Continue
                  </button>
                  <button 
                    type="button" 
                    style={{ flex: 1, background: "white", color: "#48aad9", border: "1.5px solid #48aad9", borderRadius: "15px", padding: "0.8rem", fontWeight: "700", fontSize: "1rem", cursor: "pointer" }} 
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="settings-modal-header" style={{ borderBottom: "1px solid #eee", marginBottom: "1.5rem", paddingBottom: "0.8rem" }}>
                  <h4 className="settings-modal-title" style={{ color: "#48aad9", fontSize: "1.2rem", fontWeight: "600" }}>
                    {modal.type === "add" ? "Add Category" : "Edit Category"}
                  </h4>
                </div>
                <div className="settings-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                  {/* Enabled */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <span style={{ fontSize: "1rem", fontWeight: "600", color: "#333" }}>Enabled</span>
                    <label className="settings-toggle">
                      <input
                        type="checkbox"
                        checked={formData.enabled}
                        onChange={(event) => handleFormChange("enabled", event.target.checked)}
                      />
                      <span className="settings-toggle-slider" style={{ background: formData.enabled ? "#48aad9" : "#ccc" }} />
                    </label>
                  </div>

                  {/* Name */}
                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center", gap: "1rem" }}>
                    <label style={{ fontSize: "1rem", fontWeight: "600", color: "#333" }}>Name</label>
                    <input
                      type="text"
                      className="settings-modal-input"
                      placeholder="Category name"
                      value={formData.name}
                      onChange={(event) => handleFormChange("name", event.target.value)}
                      style={{ background: "#ededed", border: "none", borderRadius: "12px", padding: "0.75rem 1rem", fontSize: "1rem" }}
                    />
                  </div>

                  <div style={{ height: "1px", background: "#eee", margin: "0.5rem 0" }} />

                  {/* Background */}
                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center", gap: "1rem" }}>
                    <label style={{ fontSize: "1rem", fontWeight: "600", color: "#333" }}>Background</label>
                    <input
                      type="text"
                      className="settings-modal-input"
                      value={formData.background}
                      onChange={(event) => handleFormChange("background", event.target.value)}
                      style={{ background: "#ededed", border: "none", borderRadius: "12px", padding: "0.75rem 1rem" }}
                    />
                  </div>

                  {/* Font */}
                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center", gap: "1rem" }}>
                    <label style={{ fontSize: "1rem", fontWeight: "600", color: "#333" }}>Font</label>
                    <input
                      type="text"
                      className="settings-modal-input"
                      value={formData.font}
                      onChange={(event) => handleFormChange("font", event.target.value)}
                      style={{ background: "#ededed", border: "none", borderRadius: "12px", padding: "0.75rem 1rem" }}
                    />
                  </div>

                  <div style={{ height: "1px", background: "#eee", margin: "0.5rem 0" }} />

                  {/* Preview */}
                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center", gap: "1rem" }}>
                    <label style={{ fontSize: "1rem", fontWeight: "600", color: "#333" }}>Preview</label>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: formData.background, border: "1px solid #eee", margin: "0 auto 4px" }} />
                          <p style={{ fontSize: "0.75rem", color: "#888", margin: 0 }}>Background</p>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <p style={{ fontSize: "1rem", color: formData.font, fontWeight: "700", margin: "0 auto 4px" }}>Font</p>
                          <p style={{ fontSize: "0.75rem", color: "#888", margin: 0 }}>Font</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={resetPalette} 
                        style={{ background: "white", border: "1.5px solid #333", color: "#333", borderRadius: "10px", padding: "0.4rem 1.2rem", fontWeight: "700", fontSize: "0.9rem", cursor: "pointer" }}
                      >
                        Default
                      </button>
                    </div>
                  </div>
                </div>
                <div className="settings-modal-footer" style={{ marginTop: "2.5rem", display: "flex", gap: "1.5rem" }}>
                  <button type="button" className="btn btn-outline-primary" onClick={closeModal} style={{ flex: 1, borderRadius: "12px", padding: "0.8rem", color: "#48aad9", borderColor: "#48aad9", fontWeight: "600" }}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleSave} style={{ flex: 1, borderRadius: "12px", padding: "0.8rem", background: "#48aad9", border: "none", fontWeight: "600" }}>
                    Save Changes
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
