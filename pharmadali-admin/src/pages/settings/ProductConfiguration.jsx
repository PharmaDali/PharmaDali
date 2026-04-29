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

  return (
    <>
      <Breadcrumb
        crumbs={[
          { label: "Settings", view: "settings" },
          { label: "Products and Pricing", view: "products" },
          { label: "Product Configuration", view: "product-config" },
          { label: "Category", view: "product-config" },
        ]}
        onNavigate={onNavigate}
      />

      <header className="settings-detail-header">
        <div>
          <h5 className="fw-bold settings-detail-title">Category</h5>
          <p className="settings-detail-subtitle">Import, add, edit, and update category.</p>
        </div>
      </header>

      <div className="settings-form-container">
        <div className="settings-panel-header">
          <div>
            <p className="settings-panel-title">Category</p>
            <p className="settings-panel-subtitle">Import, add, edit, and update category.</p>
          </div>
          <div className="settings-panel-actions">
            <div className="settings-search">
              <input
                type="text"
                className="settings-search-input"
                placeholder="Search category"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <button type="button" className="settings-icon-button" onClick={openAddModal}>
              +
            </button>
            <button type="button" className="settings-icon-button settings-icon-button--ghost">
              ...
            </button>
          </div>
        </div>

        <div className="settings-table-card">
          {filteredCategories.map((category, index) => (
            <div
              key={category.id}
              className={`settings-table-row${index === filteredCategories.length - 1 ? " is-last" : ""}`}
            >
              <div className="settings-table-name">
                <span
                  className="settings-category-swatch"
                  style={{ backgroundColor: category.background, color: category.font }}
                >
                  {category.name.slice(0, 1)}
                </span>
                <div>
                  <p className="settings-table-title">{category.name}</p>
                  <p className="settings-table-subtitle">{category.enabled ? "Enabled" : "Disabled"}</p>
                </div>
              </div>
              <div className="settings-table-actions">
                <button
                  type="button"
                  className="settings-action-btn settings-action-btn--edit"
                  onClick={() => openEditModal(category)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="settings-action-btn settings-action-btn--delete"
                  onClick={() => openDeleteModal(category)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && (
            <div className="settings-table-empty">No categories found.</div>
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
          >
            {modal.type === "delete" ? (
              <>
                <div className="settings-modal-header settings-modal-header--center">
                  <h4 className="settings-modal-title">
                    Are you sure you want to delete "{activeCategory?.name || "this"}" category?
                  </h4>
                  <p className="settings-modal-subtitle">
                    All important data related to it will be lost once you continue.
                  </p>
                </div>
                <div className="settings-modal-footer settings-modal-footer--center">
                  <button type="button" className="btn btn-primary" onClick={handleDelete}>
                    Continue
                  </button>
                  <button type="button" className="btn btn-outline-primary" onClick={closeModal}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="settings-modal-header">
                  <h4 className="settings-modal-title">
                    {modal.type === "add" ? "Add Category" : "Edit Category"}
                  </h4>
                </div>
                <div className="settings-modal-body">
                  <div className="settings-modal-row settings-modal-row--split">
                    <span className="settings-modal-label">Enabled</span>
                    <label className="settings-toggle">
                      <input
                        type="checkbox"
                        checked={formData.enabled}
                        onChange={(event) => handleFormChange("enabled", event.target.checked)}
                      />
                      <span className="settings-toggle-slider" />
                    </label>
                  </div>

                  <div className="settings-modal-field-row">
                    <label className="settings-modal-label">Name</label>
                    <div className="settings-modal-control">
                      <input
                        type="text"
                        className="settings-modal-input"
                        placeholder="Category name"
                        value={formData.name}
                        onChange={(event) => handleFormChange("name", event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="settings-modal-field-row">
                    <label className="settings-modal-label">Background</label>
                    <div className="settings-modal-control">
                      <input
                        type="text"
                        className="settings-modal-input"
                        value={formData.background}
                        onChange={(event) => handleFormChange("background", event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="settings-modal-field-row">
                    <label className="settings-modal-label">Font</label>
                    <div className="settings-modal-control">
                      <input
                        type="text"
                        className="settings-modal-input"
                        value={formData.font}
                        onChange={(event) => handleFormChange("font", event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="settings-modal-field-row settings-modal-field-row--preview">
                    <label className="settings-modal-label">Preview</label>
                    <div className="settings-modal-control">
                      <div className="settings-modal-preview">
                        <div
                          className="settings-modal-preview-dot"
                          style={{ backgroundColor: formData.background, color: formData.font }}
                        >
                          A
                        </div>
                        <div className="settings-modal-preview-meta">
                          <div>
                            <span className="settings-modal-preview-label">Background</span>
                            <span className="settings-modal-preview-value">{formData.background}</span>
                          </div>
                          <div>
                            <span className="settings-modal-preview-label">Font</span>
                            <span className="settings-modal-preview-value">{formData.font}</span>
                          </div>
                        </div>
                        <button type="button" className="settings-modal-default" onClick={resetPalette}>
                          Default
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="settings-modal-footer">
                  <button type="button" className="btn btn-outline-primary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleSave}>
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
