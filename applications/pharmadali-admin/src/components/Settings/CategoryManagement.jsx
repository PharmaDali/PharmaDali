import { useEffect, useMemo, useState } from "react";
import { Breadcrumb } from "./Breadcrumb";
import { ListSkeleton } from "../../shared/components/loading";
import SearchBar from "../../shared/components/SearchBar";
import "../../assets/css/settings/common.css";
import "../../assets/css/settings/product-config.css";
import "../../assets/css/settings/overlays.css";
import {
  getCategories,
  toggleCategoryStatus,
} from "../../services/pharmacySettingsService";

export const CategoryManagement = ({ onBack, onNavigate }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [query, setQuery] = useState("");

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
    return categories.filter((cat) => (cat.name || "").toLowerCase().includes(normalizedQuery));
  }, [categories, query]);

  const handleToggle = async (cat) => {
    if (togglingId) return;
    const newStatus = !cat.enabled;
    setTogglingId(cat.id);
    setErrorMessage("");

    try {
      await toggleCategoryStatus(cat.id, newStatus);
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, enabled: newStatus } : c))
      );
      setSuccessMessage(
        `Category "${cat.name}" has been ${newStatus ? "enabled" : "disabled"} for this pharmacy.`
      );
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      const apiMsg = err.response?.data?.message || err.message || "Failed to update category status.";
      setErrorMessage(apiMsg);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="d-flex flex-column" style={{ height: "calc(100vh - 160px)" }}>
      <div className="settings-header flex-shrink-0">
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

      {errorMessage && (
        <div className="alert alert-danger py-2 px-3 mb-3 small rounded-3 border-0 bg-danger-subtle text-danger">
          {errorMessage}
        </div>
      )}

      <div className="admin-card d-flex flex-column flex-grow-1" style={{ minHeight: 0 }}>
        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
          <div>
            <h5 className="settings-header-title mb-1">Category Availability</h5>
            <p className="settings-header-subtitle mb-0">
              Enable or disable master categories for your pharmacy branch.
            </p>
          </div>
          <div className="d-flex align-items-center gap-2 w-100 w-sm-auto justify-content-sm-end">
            <div className="flex-grow-1 flex-sm-grow-0" style={{ minWidth: "180px", maxWidth: "280px" }}>
              <SearchBar
                id="category-search"
                value={query}
                onChange={(val) => setQuery(val)}
                placeholder="Search category"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <ListSkeleton count={4} />
        ) : (
          <div className="custom-scrollbar flex-grow-1" style={{ overflowY: "auto", paddingRight: "6px", minHeight: 0 }}>
            {filteredData.map((cat) => (
              <div key={cat.id} className="product-config-item">
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="badge rounded-pill px-3 py-1 fw-semibold"
                    style={{
                      backgroundColor: cat.background || "#e8f0fe",
                      color: cat.font || "#000000",
                      fontSize: "0.82rem",
                      border: "1px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    {cat.name}
                  </span>
                  {cat.hero_title && (
                    <span className="text-muted small ms-2 d-none d-md-inline" style={{ fontSize: "0.78rem" }}>
                      • {cat.hero_title}
                    </span>
                  )}
                </div>

                <div className="d-flex align-items-center gap-3">
                  <span
                    className={`badge ${
                      cat.enabled
                        ? "bg-success-subtle text-success border border-success-subtle"
                        : "bg-secondary-subtle text-secondary border border-secondary-subtle"
                    } px-2 py-1`}
                    style={{ fontSize: "0.75rem", minWidth: "62px", textAlign: "center" }}
                  >
                    {cat.enabled ? "Active" : "Disabled"}
                  </span>
                  <div
                    className={`toggle-switch${cat.enabled ? " active" : ""}`}
                    onClick={() => handleToggle(cat)}
                    role="button"
                    tabIndex={0}
                    aria-pressed={cat.enabled}
                    style={{
                      cursor: togglingId === cat.id ? "wait" : "pointer",
                      opacity: togglingId === cat.id ? 0.6 : 1,
                    }}
                    title={cat.enabled ? "Click to disable category for this branch" : "Click to enable category for this branch"}
                  >
                    <div className="toggle-handle" />
                  </div>
                </div>
              </div>
            ))}
            {filteredData.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem", color: "#888" }}>
                No categories found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};