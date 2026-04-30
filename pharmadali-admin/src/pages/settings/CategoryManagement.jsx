import { useMemo, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import "../../assets/css/settings/common.css";
import "../../assets/css/settings/product-config.css";
import "../../assets/css/settings/overlays.css";

const defaultCategoryForm = {
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

export const CategoryManagement = ({ onBack, onNavigate }) => {
  const [categories, setCategories] = useState(seedCategories);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ type: null, categoryId: null });
  const [formData, setFormData] = useState(defaultCategoryForm);

  const filteredData = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return categories;
    return categories.filter((cat) => cat.name.toLowerCase().includes(normalizedQuery));
  }, [categories, query]);

  const openAddModal = () => {
    setFormData(defaultCategoryForm);
    setModal({ type: "add", categoryId: null });
  };

  const openEditModal = (cat) => {
    setFormData({
      enabled: cat.enabled,
      name: cat.name,
      background: cat.background,
      font: cat.font,
    });
    setModal({ type: "edit", categoryId: cat.id });
  };

  const openDeleteModal = (cat) => {
    setModal({ type: "delete", categoryId: cat.id });
  };

  const closeModal = () => setModal({ type: null, categoryId: null });

  const handleSave = () => {
    if (modal.type === "add") {
      const nextId = Math.max(0, ...categories.map((c) => c.id)) + 1;
      setCategories((prev) => [
        ...prev,
        { id: nextId, ...formData, name: formData.name || "New Category" }
      ]);
    } else {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === modal.categoryId ? { ...cat, ...formData } : cat))
      );
    }
    closeModal();
  };

  const handleDelete = () => {
    setCategories((prev) => prev.filter((cat) => cat.id !== modal.categoryId));
    closeModal();
  };

  const activeItem = categories.find((c) => c.id === modal.categoryId);

  return (
    <>
      <div className="settings-header">
        <Breadcrumb
          crumbs={[
            { label: "Settings", view: "settings" },
            { label: "Products and Pricing", view: "products" },
            { label: "Products Configuration", onClick: onBack },
            { label: "Category", view: "category" },
          ]}
          onNavigate={onNavigate}
        />
        <p className="settings-header-subtitle" style={{ marginTop: "-1rem" }}>
          Configure product categories, items, and pricing rules.
        </p>
      </div>

      <div className="settings-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h5 className="settings-header-title">Category</h5>
            <p className="settings-header-subtitle">Import, add, delete, and update category.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div className="settings-search-container">
              <span className="settings-search-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search category"
                className="settings-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button className="btn-add-circle" onClick={openAddModal}>+</button>
          </div>
        </div>

        <div className="custom-scrollbar product-config-list">
          {filteredData.map((cat) => (
            <div key={cat.id} className="product-config-item">
              <div className="product-config-label">{cat.name}</div>
              <div className="product-config-actions">
                <button className="btn-action-edit" onClick={() => openEditModal(cat)}>Edit</button>
                <button className="btn-action-delete" onClick={() => openDeleteModal(cat)}>Delete</button>
              </div>
            </div>
          ))}
          {filteredData.length === 0 && <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>No categories found.</div>}
        </div>
      </div>

      {modal.type && (
        <div className="settings-modal-backdrop" onClick={closeModal}>
          <div 
            className={`settings-modal${modal.type === "delete" ? " settings-modal--confirm" : ""}`} 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: modal.type === "delete" ? "420px" : "550px" }}
          >
            {modal.type === "delete" ? (
              <div style={{ textAlign: "center" }}>
                <h4 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#333", marginBottom: "1rem" }}>
                  Are you sure you want to delete<br/>"{activeItem?.name}" category?
                </h4>
                <p style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: "2rem" }}>All data related to it will be lost.</p>
                <div style={{ display: "flex", gap: "1.5rem" }}>
                  <button onClick={handleDelete} className="btn-pd-primary" style={{ flex: 1, height: "48px" }}>Continue</button>
                  <button onClick={closeModal} className="btn-pd-ghost" style={{ flex: 1, height: "48px" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="settings-modal-header">
                  <h4 className="settings-modal-title">{modal.type === "add" ? "Add Category" : "Edit Category"}</h4>
                </div>

                <div className="settings-modal-body">
                  <div className="settings-modal-field">
                    <label className="settings-modal-label">Enabled</label>
                    <div 
                      className={`toggle-switch${formData.enabled ? " active" : ""}`}
                      onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                    >
                      <div className="toggle-handle" />
                    </div>
                  </div>

                  <div className="settings-modal-field">
                    <label className="settings-modal-label">Name</label>
                    <input 
                      type="text" 
                      className="settings-modal-input" 
                      placeholder="Category name"
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    />
                  </div>

                  <div className="settings-modal-divider" />

                  <div className="settings-modal-field">
                    <label className="settings-modal-label">Background</label>
                    <input 
                      type="text" 
                      className="settings-modal-input" 
                      placeholder="#FFFFFF"
                      value={formData.background} 
                      onChange={(e) => setFormData({ ...formData, background: e.target.value })} 
                    />
                  </div>

                  <div className="settings-modal-field">
                    <label className="settings-modal-label">Font</label>
                    <input 
                      type="text" 
                      className="settings-modal-input" 
                      placeholder="#000000"
                      value={formData.font} 
                      onChange={(e) => setFormData({ ...formData, font: e.target.value })} 
                    />
                  </div>

                  <div className="settings-modal-field">
                    <label className="settings-modal-label">Preview</label>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div className="color-preview-container">
                        <div className="color-preview-item">
                          <div className="color-preview-circle" style={{ background: formData.background }} />
                          <span className="color-preview-label">Background</span>
                        </div>
                        <div className="color-preview-item">
                          <div className="color-preview-circle" style={{ background: formData.font }} />
                          <span className="color-preview-label">Font</span>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="btn-pd-outline-small"
                        onClick={() => setFormData({ ...formData, background: "#ffffff", font: "#000000" })}
                      >
                        Default
                      </button>
                    </div>
                  </div>
                </div>

                <div className="settings-modal-footer">
                  <button onClick={closeModal} className="btn-pd-ghost" style={{ flex: 1, padding: "0.8rem" }}>Cancel</button>
                  <button onClick={handleSave} className="btn-pd-primary" style={{ flex: 1, padding: "0.8rem" }}>Save Changes</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
