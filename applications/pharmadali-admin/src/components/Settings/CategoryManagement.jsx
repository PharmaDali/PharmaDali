import { useEffect, useMemo, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { ListSkeleton } from "../../shared/components/loading";
import SearchBar from "../../shared/components/SearchBar";
import "../../assets/css/settings/common.css";
import "../../assets/css/settings/product-config.css";
import "../../assets/css/settings/overlays.css";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/pharmacySettingsService";

const defaultCategoryForm = {
  enabled: true,
  name: "",
  background: "#e8f0fe",
  font: "#000000",
};

export const CategoryManagement = ({ onBack, onNavigate }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ type: null, categoryId: null });
  const [formData, setFormData] = useState(defaultCategoryForm);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      const res = await getCategories();
      const catList = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      setCategories(catList);
    } catch (err) {
      setErrorMessage(err.message || "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return categories;
    return categories.filter((cat) => cat.name.toLowerCase().includes(normalizedQuery));
  }, [categories, query]);

  const openAddModal = () => {
    setFormData(defaultCategoryForm);
    setErrorMessage("");
    setModal({ type: "add", categoryId: null });
  };

  const openEditModal = (cat) => {
    setFormData({
      enabled: cat.enabled ?? true,
      name: cat.name ?? "",
      background: cat.background ?? "#e8f0fe",
      font: cat.font ?? "#000000",
    });
    setErrorMessage("");
    setModal({ type: "edit", categoryId: cat.id });
  };

  const openDeleteModal = (cat) => {
    setErrorMessage("");
    setModal({ type: "delete", categoryId: cat.id });
  };

  const closeModal = () => {
    setModal({ type: null, categoryId: null });
    setErrorMessage("");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setErrorMessage("Category name cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      if (modal.type === "add") {
        await createCategory(formData);
        setSuccessMessage("Category created successfully.");
      } else {
        await updateCategory(modal.categoryId, formData);
        setSuccessMessage("Category updated successfully.");
      }

      await fetchCategories();
      closeModal();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      const apiMsg = err.response?.data?.message || err.message || "Failed to save category.";
      setErrorMessage(apiMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setSaving(true);
      setErrorMessage("");

      await deleteCategory(modal.categoryId);
      setSuccessMessage("Category deleted successfully.");
      await fetchCategories();
      closeModal();
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      const apiMsg = err.response?.data?.message || err.message || "Failed to delete category.";
      setErrorMessage(apiMsg);
    } finally {
      setSaving(false);
    }
  };

  const activeItem = categories.find((c) => c.id === modal.categoryId);

  return (
    <>
      <div className="settings-header">
        <Breadcrumb
          crumbs={
            onBack
              ? [
                  { label: "Settings", view: "settings" },
                  { label: "Products and Pricing", view: "products" },
                  { label: "Products Configuration", onClick: onBack },
                  { label: "Category Management", view: "category" },
                ]
              : [
                  { label: "Settings", view: "settings" },
                  { label: "Category Management", view: "category" },
                ]
          }
          onNavigate={onNavigate}
        />
        <p className="settings-header-subtitle" style={{ marginTop: "-1rem" }}>
          Configure product categories, items, and pricing rules.
        </p>
      </div>

      {successMessage && (
        <div className="alert alert-success py-2 px-3 mb-3 small rounded-3 border-0 bg-success-subtle text-success">
          {successMessage}
        </div>
      )}

      <div className="admin-card">
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
          <div>
            <h5 className="settings-header-title mb-1">Category</h5>
            <p className="settings-header-subtitle mb-0">Import, add, delete, and update category.</p>
          </div>
          <div className="d-flex align-items-center gap-2 w-100 w-sm-auto justify-content-sm-end">
            <div className="flex-grow-1 flex-sm-grow-0" style={{ minWidth: "160px", maxWidth: "260px" }}>
              <SearchBar
                id="category-search"
                value={query}
                onChange={(val) => setQuery(val)}
                placeholder="Search category"
              />
            </div>
            <button className="btn-add-circle flex-shrink-0" onClick={openAddModal}>+</button>
          </div>
        </div>

        {loading ? (
          <ListSkeleton count={4} />
        ) : (
          <div className="custom-scrollbar" style={{ maxHeight: "480px", overflowY: "auto", paddingRight: "10px" }}>
            {filteredData.map((cat) => (
              <div key={cat.id} className="product-config-item">
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="badge rounded-pill px-2 py-1 small"
                    style={{ backgroundColor: cat.background, color: cat.font, fontSize: "0.8rem", border: "1px solid #ddd" }}
                  >
                    {cat.name}
                  </span>
                  {!cat.enabled && <span className="badge bg-secondary text-white ms-1">Disabled</span>}
                </div>
                <div className="product-config-actions">
                  <button className="btn-action btn-action--ghost" onClick={() => openEditModal(cat)}>Edit</button>
                  <button className="btn-action btn-action--danger" onClick={() => openDeleteModal(cat)}>Delete</button>
                </div>
              </div>
            ))}
            {filteredData.length === 0 && <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>No categories found.</div>}
          </div>
        )}
      </div>

      {modal.type && (
        <div className="settings-modal-backdrop" onClick={closeModal}>
          <div
            className={`settings-modal${modal.type === "delete" ? " settings-modal--confirm" : ""}`}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: modal.type === "delete" ? "420px" : "550px" }}
          >
            {errorMessage && (
              <div className="alert alert-danger py-2 px-3 mb-3 small rounded-3 border-0 bg-danger-subtle text-danger">
                {errorMessage}
              </div>
            )}

            {modal.type === "delete" ? (
              <div style={{ textAlign: "center" }}>
                <h4 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#333", marginBottom: "1rem" }}>
                  Are you sure you want to delete<br />"{activeItem?.name}" category?
                </h4>
                <p style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: "2rem" }}>All data related to it will be lost.</p>
                <div style={{ display: "flex", gap: "1.5rem" }}>
                  <button onClick={handleDelete} disabled={saving} className="btn-action btn-action--primary" style={{ flex: 1, height: "48px" }}>
                    {saving ? "Deleting..." : "Continue"}
                  </button>
                  <button onClick={closeModal} disabled={saving} className="btn-action btn-action--ghost" style={{ flex: 1, height: "48px" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="settings-modal-header">
                  <h4 className="settings-modal-title">{modal.type === "add" ? "Add Category" : "Edit Category"}</h4>
                </div>

                <div className="settings-modal-body" style={{ opacity: formData.enabled ? 1 : 0.6 }}>
                  <div className="settings-flex-row" style={{ marginBottom: "0.5rem" }}>
                    <span className="settings-modal-label" style={{ fontSize: "1rem" }}>Enabled</span>
                    <div
                      className={`toggle-switch${formData.enabled ? " active" : ""}`}
                      onClick={() => setFormData((prev) => ({ ...prev, enabled: !prev.enabled }))}
                      role="button"
                      aria-pressed={formData.enabled}
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
                      disabled={!formData.enabled || saving}
                    />
                  </div>

                  <div className="settings-modal-divider" />

                  <div className="settings-modal-field">
                    <label className="settings-modal-label">Background Color</label>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="color"
                        className="form-control form-control-color"
                        value={formData.background}
                        onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                        disabled={!formData.enabled || saving}
                      />
                      <input
                        type="text"
                        className="settings-modal-input"
                        value={formData.background}
                        onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                        disabled={!formData.enabled || saving}
                      />
                    </div>
                  </div>

                  <div className="settings-modal-field">
                    <label className="settings-modal-label">Font Color</label>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="color"
                        className="form-control form-control-color"
                        value={formData.font}
                        onChange={(e) => setFormData({ ...formData, font: e.target.value })}
                        disabled={!formData.enabled || saving}
                      />
                      <input
                        type="text"
                        className="settings-modal-input"
                        value={formData.font}
                        onChange={(e) => setFormData({ ...formData, font: e.target.value })}
                        disabled={!formData.enabled || saving}
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-modal-footer">
                  <button onClick={handleSave} disabled={saving} className="btn-action btn-action--primary">
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button onClick={closeModal} disabled={saving} className="btn-action btn-action--ghost">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};