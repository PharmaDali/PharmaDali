import { useMemo, useState, useRef } from "react";
import { Breadcrumb } from "./Breadcrumb";
import "../../assets/css/settings/common.css";
import "../../assets/css/settings/product-config.css";
import "../../assets/css/settings/overlays.css";

const defaultItemForm = {
  enabled: true,
  genericName: "",
  brandName: "",
  category: "",
  price: 0,
  cost: 0,
  stock: 0,
  warnQuantity: 0,
  barcode1: "",
  barcode2: "",
  barcode3: "",
  tax: "",
  image: null,
  options: {
    scale: false,
    stopScale: false,
    discountable: false,
    askPrice: false,
    displayImage: false,
    hideName: false,
  },
};

const seedItems = [
  { id: 1, name: "Paracetamol 500mg", enabled: true, genericName: "Paracetamol", brandName: "Biogesic", category: "Branded", price: 5, cost: 3, stock: 100, warnQuantity: 20, barcode1: "123456", tax: "VAT", options: defaultItemForm.options },
  { id: 2, name: "Amoxicillin 250mg", enabled: true, genericName: "Amoxicillin", brandName: "Generic", category: "Generic", price: 10, cost: 7, stock: 50, warnQuantity: 10, barcode1: "789012", tax: "VAT", options: defaultItemForm.options },
];

export const ItemManagement = ({ onBack, onNavigate }) => {
  const [items, setItems] = useState(seedItems);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ type: null, itemId: null });
  const [formData, setFormData] = useState(defaultItemForm);
  const fileInputRef = useRef(null);

  const filteredData = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;
    return items.filter((item) => item.name.toLowerCase().includes(normalizedQuery));
  }, [items, query]);

  const openAddModal = () => {
    setFormData(defaultItemForm);
    setModal({ type: "add", itemId: null });
  };

  const openEditModal = (item) => {
    setFormData({ ...item });
    setModal({ type: "edit", itemId: item.id });
  };

  const openDeleteModal = (item) => setModal({ type: "delete", itemId: item.id });
  const closeModal = () => setModal({ type: null, itemId: null });

  const handleSave = () => {
    const itemName = `${formData.brandName} ${formData.genericName}`.trim() || "New Item";
    if (modal.type === "add") {
      const nextId = Math.max(0, ...items.map((i) => i.id)) + 1;
      setItems((prev) => [...prev, { id: nextId, ...formData, name: itemName }]);
    } else {
      setItems((prev) => prev.map((i) => (i.id === modal.itemId ? { ...i, ...formData, name: itemName } : i)));
    }
    closeModal();
  };

  const handleDelete = () => {
    setItems((prev) => prev.filter((i) => i.id !== modal.itemId));
    closeModal();
  };


  const handleNumericChange = (field, delta) => {
    setFormData((prev) => ({ ...prev, [field]: Math.max(0, (prev[field] || 0) + delta) }));
  };

  const handleOptionToggle = (key) => {
    setFormData((prev) => ({ ...prev, options: { ...prev.options, [key]: !prev.options[key] } }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFormData((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
  };

  const activeItem = items.find((i) => i.id === modal.itemId);

  return (
    <>
      <div className="settings-header">
        <Breadcrumb
          crumbs={[
            { label: "Settings", view: "settings" },
            { label: "Products and Pricing", view: "products" },
            { label: "Products Configuration", onClick: onBack },
            { label: "Item", view: "item" },
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
            <h5 className="settings-header-title">Item</h5>
            <p className="settings-header-subtitle">Import, add, delete, and update item.</p>
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
                placeholder="Search item"
                className="settings-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <button className="btn-add-circle" onClick={openAddModal}>+</button>
          </div>
        </div>

        <div className="custom-scrollbar" style={{ maxHeight: "750px", overflowY: "auto", paddingRight: "10px" }}>
          {filteredData.map((item) => (
            <div key={item.id} className="product-config-item">
              <div className="product-config-label">{item.name}</div>
              <div className="product-config-actions">
                <button className="btn-action btn-action--ghost" onClick={() => openEditModal(item)}>Edit</button>
                <button className="btn-action btn-action--danger" onClick={() => openDeleteModal(item)}>Delete</button>
              </div>
            </div>
          ))}
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
                  Are you sure you want to delete<br/>"{activeItem?.name}" item?
                </h4>
                <p style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: "2rem" }}>All data related to it will be lost.</p>
                <div style={{ display: "flex", gap: "1.5rem" }}>
                  <button onClick={handleDelete} className="btn-action btn-action--primary" style={{ flex: 1, height: "48px", fontWeight: "700" }}>Continue</button>
                  <button onClick={closeModal} className="btn-action btn-action--ghost" style={{ flex: 1, height: "48px", fontWeight: "700" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="settings-modal-header">
                  <h4 className="settings-modal-title">Add Item</h4>
                  <div className="settings-modal-divider" />
                </div>
                
                <div
                  className="custom-scrollbar settings-modal-body"
                  style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: "10px", opacity: formData.enabled ? 1 : 0.6 }}
                >
                  {/* Enabled Toggle */}
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
                    <label className="settings-modal-label">Generic Name</label>
                    <input type="text" placeholder="Generic name" className="settings-modal-input" value={formData.genericName} onChange={(e) => setFormData({ ...formData, genericName: e.target.value })} disabled={!formData.enabled} />
                  </div>
                  <div className="settings-modal-field">
                    <label className="settings-modal-label">Brand Name</label>
                    <input type="text" placeholder="Brand name" className="settings-modal-input" value={formData.brandName} onChange={(e) => setFormData({ ...formData, brandName: e.target.value })} disabled={!formData.enabled} />
                  </div>
                  <div className="settings-modal-field">
                    <label className="settings-modal-label">Category</label>
                    <input type="text" placeholder="Category" className="settings-modal-input" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} disabled={!formData.enabled} />
                  </div>

                  <div className="settings-modal-field">
                    <label className="settings-modal-label">Price</label>
                    <div className="numeric-adjuster">
                      <button className="btn-numeric minus" onClick={() => formData.enabled && handleNumericChange("price", -1)} disabled={!formData.enabled}>-</button>
                      <div className="numeric-value">{formData.price}</div>
                      <button className="btn-numeric plus" onClick={() => formData.enabled && handleNumericChange("price", 1)} disabled={!formData.enabled}>+</button>
                    </div>
                  </div>

                  <div className="settings-modal-divider" />

                  {/* Stock Controls */}
                  {["cost", "stock", "warnQuantity"].map((f) => (
                    <div key={f} className="settings-modal-field">
                      <label className="settings-modal-label" style={{ textTransform: "capitalize" }}>{f.replace(/([A-Z])/g, ' $1')}</label>
                      <div className="numeric-adjuster">
                        <button className="btn-numeric minus" onClick={() => formData.enabled && handleNumericChange(f, -1)} disabled={!formData.enabled}>-</button>
                        <div className="numeric-value">{formData[f]}</div>
                        <button className="btn-numeric plus" onClick={() => formData.enabled && handleNumericChange(f, 1)} disabled={!formData.enabled}>+</button>
                      </div>
                    </div>
                  ))}

                  <div className="settings-modal-divider" />

                  {/* Barcodes */}
                  <div className="settings-modal-field" style={{ alignItems: "flex-start" }}>
                    <label className="settings-modal-label" style={{ marginTop: "1rem" }}>Barcodes</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                      <div>
                        <p style={{ margin: "0 0 5px 5px", fontSize: "0.75rem", color: "#aaa" }}>Barcode 1</p>
                        <input type="text" placeholder="Barcode 1" className="settings-modal-input" value={formData.barcode1} onChange={(e) => setFormData({ ...formData, barcode1: e.target.value })} disabled={!formData.enabled} />
                      </div>
                      <div>
                        <p style={{ margin: "0 0 5px 5px", fontSize: "0.75rem", color: "#aaa" }}>Barcode 2</p>
                        <input type="text" placeholder="Barcode 2" className="settings-modal-input" value={formData.barcode2} onChange={(e) => setFormData({ ...formData, barcode2: e.target.value })} disabled={!formData.enabled} />
                      </div>
                      <div>
                        <p style={{ margin: "0 0 5px 5px", fontSize: "0.75rem", color: "#aaa" }}>Barcode 3</p>
                        <input type="text" placeholder="Barcode 3" className="settings-modal-input" value={formData.barcode3} onChange={(e) => setFormData({ ...formData, barcode3: e.target.value })} disabled={!formData.enabled} />
                      </div>
                    </div>
                  </div>

                  <div className="settings-modal-field">
                    <label className="settings-modal-label">Tax</label>
                    <input type="text" placeholder="Tax" className="settings-modal-input" value={formData.tax} onChange={(e) => setFormData({ ...formData, tax: e.target.value })} disabled={!formData.enabled} />
                  </div>

                  <div className="settings-modal-divider" />

                  {/* Image Upload */}
                  <div className="settings-modal-field">
                    <label className="settings-modal-label">Item Upload</label>
                    <div className="upload-box">
                      <div className="upload-preview">
                        {formData.image ? <img src={formData.image} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ color: "#ddd", fontSize: "0.7rem", textAlign: "center" }}>Sample only</span>}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} disabled={!formData.enabled} />
                      <button className="btn-action btn-action--ghost" onClick={() => formData.enabled && fileInputRef.current?.click()} disabled={!formData.enabled}>Upload</button>
                    </div>
                  </div>

                  <div className="settings-modal-divider" />

                  {/* Additional Options */}
                  <div className="settings-modal-field" style={{ alignItems: "flex-start" }}>
                    <label className="settings-modal-label" style={{ marginTop: "5px" }}>Additional Options</label>
                    <div className="option-tags-container">
                      {[
                        { key: "scale", label: "Scale" },
                        { key: "stopScale", label: "Stop scale (QTY=0)" },
                        { key: "discountable", label: "Discountable" },
                        { key: "askPrice", label: "Ask Price" },
                        { key: "displayImage", label: "Display Image" },
                        { key: "hideName", label: "Hide Name" },
                      ].map((ok) => (
                        <button 
                          key={ok.key} 
                          className={`option-tag${formData.options[ok.key] ? " active" : ""}`}
                          onClick={() => formData.enabled && handleOptionToggle(ok.key)}
                          disabled={!formData.enabled}
                        >
                          {ok.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="settings-modal-footer">
                  <button onClick={closeModal} className="btn-action btn-action--ghost" style={{ flex: 1, padding: "0.85rem", fontWeight: "700" }}>Cancel</button>
                  <button onClick={handleSave} className="btn-action btn-action--primary" style={{ flex: 1, padding: "0.85rem", fontWeight: "700" }}>Save Changes</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
