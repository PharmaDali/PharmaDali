import { useMemo, useState, useRef } from "react";
import { Breadcrumb } from "./Breadcrumb";

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
      <div style={{ marginBottom: "1.5rem" }}>
        <Breadcrumb
          crumbs={[
            { label: "Settings", view: "settings" },
            { label: "Products and Pricing", view: "products" },
            { label: "Products Configuration", onClick: onBack },
            { label: "Item", view: "item" },
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
            <h5 style={{ color: "#333", fontSize: "1.1rem", fontWeight: "700", marginBottom: "0.2rem" }}>Item</h5>
            <p style={{ color: "#888", fontSize: "0.8rem", margin: 0 }}>Import, add, delete, and update item.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ position: "relative", width: "300px" }}>
              <input
                type="text"
                placeholder="Search item"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: "100%", padding: "0.55rem 1rem 0.55rem 2.5rem", background: "#e9eff4", border: "none", borderRadius: "10px", fontSize: "0.85rem" }}
              />
            </div>
            <button onClick={openAddModal} style={{ width: "36px", height: "36px", background: "#48aad9", color: "white", border: "none", borderRadius: "10px", cursor: "pointer" }}>+</button>
          </div>
        </div>

        <div className="custom-scrollbar" style={{ maxHeight: "750px", overflowY: "auto", paddingRight: "10px" }}>
          {filteredData.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 0.5rem", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ fontSize: "1rem", color: "#333", fontWeight: "500" }}>{item.name}</div>
              <div style={{ display: "flex", gap: "0.8rem" }}>
                <button onClick={() => openEditModal(item)} style={{ background: "white", border: "1px solid #48aad9", color: "#48aad9", padding: "0.3rem 1.2rem", borderRadius: "8px", fontSize: "0.85rem", cursor: "pointer" }}>Edit</button>
                <button onClick={() => openDeleteModal(item)} style={{ background: "white", border: "1px solid #ff6b6b", color: "#ff6b6b", padding: "0.3rem 1.2rem", borderRadius: "8px", fontSize: "0.85rem", cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal.type && (
        <div className="settings-modal-backdrop" onClick={closeModal} style={{ zIndex: 1100 }}>
          <div 
            className={`settings-modal${modal.type === "delete" ? " settings-modal--confirm" : ""}`} 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: modal.type === "delete" ? "420px" : "550px", width: "95%", borderRadius: "20px", padding: "1.5rem", background: "white" }}
          >
            {modal.type === "delete" ? (
              <div style={{ textAlign: "center" }}>
                <h4 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#333", marginBottom: "1rem" }}>
                  Are you sure you want to delete<br/>"{activeItem?.name}" item?
                </h4>
                <p style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: "2rem" }}>All data related to it will be lost.</p>
                <div style={{ display: "flex", gap: "1.5rem" }}>
                  <button onClick={handleDelete} style={{ flex: 1, background: "#48aad9", color: "white", border: "none", borderRadius: "12px", padding: "0.8rem", fontWeight: "700", cursor: "pointer" }}>Continue</button>
                  <button onClick={closeModal} style={{ flex: 1, background: "white", color: "#48aad9", border: "1.5px solid #48aad9", borderRadius: "12px", padding: "0.8rem", fontWeight: "700", cursor: "pointer" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "1rem" }}>
                  <h4 style={{ color: "#48aad9", fontSize: "1.1rem", fontWeight: "600", margin: 0 }}>Add Item</h4>
                  <div style={{ height: "1px", background: "#eee", marginTop: "1rem" }} />
                </div>
                
                <div className="custom-scrollbar" style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: "10px", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                  {/* Enabled Toggle */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <label style={{ fontSize: "1rem", fontWeight: "600", color: "#333" }}>Enabled</label>
                    <div 
                      onClick={() => setFormData(p => ({ ...p, enabled: !p.enabled }))}
                      style={{ 
                        width: "40px", 
                        height: "20px", 
                        background: formData.enabled ? "#48aad9" : "#ccc", 
                        borderRadius: "20px", 
                        position: "relative", 
                        cursor: "pointer",
                        transition: "background 0.2s"
                      }}
                    >
                      <div style={{ 
                        width: "14px", 
                        height: "14px", 
                        background: "white", 
                        borderRadius: "50%", 
                        position: "absolute", 
                        top: "3px", 
                        left: formData.enabled ? "23px" : "3px",
                        transition: "left 0.2s" 
                      }} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center", gap: "1rem" }}>
                    <label style={{ fontWeight: "600", color: "#555" }}>Generic Name</label>
                    <input type="text" placeholder="Generic name" value={formData.genericName} onChange={(e) => setFormData({ ...formData, genericName: e.target.value })} style={{ background: "#ededed", border: "none", borderRadius: "10px", padding: "0.75rem 1rem" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center", gap: "1rem" }}>
                    <label style={{ fontWeight: "600", color: "#555" }}>Brand Name</label>
                    <input type="text" placeholder="Brand name" value={formData.brandName} onChange={(e) => setFormData({ ...formData, brandName: e.target.value })} style={{ background: "#ededed", border: "none", borderRadius: "10px", padding: "0.75rem 1rem" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center", gap: "1rem" }}>
                    <label style={{ fontWeight: "600", color: "#555" }}>Category</label>
                    <input type="text" placeholder="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ background: "#ededed", border: "none", borderRadius: "10px", padding: "0.75rem 1rem" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center", gap: "1rem" }}>
                    <label style={{ fontWeight: "600", color: "#555" }}>Price</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                      <button onClick={() => handleNumericChange("price", -1)} style={{ width: "36px", height: "36px", background: "#ccc", color: "white", border: "none", borderRadius: "8px", fontSize: "1.2rem", cursor: "pointer" }}>-</button>
                      <div style={{ background: "#f0f0f0", padding: "0.6rem 2.5rem", borderRadius: "8px", minWidth: "80px", textAlign: "center", fontWeight: "600", color: "#888" }}>{formData.price}</div>
                      <button onClick={() => handleNumericChange("price", 1)} style={{ width: "36px", height: "36px", background: "#48aad9", color: "white", border: "none", borderRadius: "8px", fontSize: "1.2rem", cursor: "pointer" }}>+</button>
                    </div>
                  </div>

                  <div style={{ height: "1px", background: "#eee", margin: "0.5rem 0" }} />

                  {/* Stock Controls */}
                  {["cost", "stock", "warnQuantity"].map((f) => (
                    <div key={f} style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center", gap: "1rem" }}>
                      <label style={{ fontWeight: "600", color: "#555", textTransform: "capitalize" }}>{f.replace(/([A-Z])/g, ' $1')}</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <button onClick={() => handleNumericChange(f, -1)} style={{ width: "36px", height: "36px", background: "#ccc", color: "white", border: "none", borderRadius: "8px", fontSize: "1.2rem", cursor: "pointer" }}>-</button>
                        <div style={{ background: "#f0f0f0", padding: "0.6rem 2.5rem", borderRadius: "8px", minWidth: "80px", textAlign: "center", fontWeight: "600", color: "#888" }}>{formData[f]}</div>
                        <button onClick={() => handleNumericChange(f, 1)} style={{ width: "36px", height: "36px", background: "#48aad9", color: "white", border: "none", borderRadius: "8px", fontSize: "1.2rem", cursor: "pointer" }}>+</button>
                      </div>
                    </div>
                  ))}

                  <div style={{ height: "1px", background: "#eee", margin: "0.5rem 0" }} />

                  {/* Barcodes */}
                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "flex-start", gap: "1rem" }}>
                    <label style={{ fontWeight: "600", color: "#555", marginTop: "1rem" }}>Barcodes</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                      <div>
                        <p style={{ margin: "0 0 5px 5px", fontSize: "0.75rem", color: "#aaa" }}>Barcode 1</p>
                        <input type="text" placeholder="Barcode 1" value={formData.barcode1} onChange={(e) => setFormData({ ...formData, barcode1: e.target.value })} style={{ background: "#ededed", border: "none", borderRadius: "10px", padding: "0.75rem", width: "100%" }} />
                      </div>
                      <div>
                        <p style={{ margin: "0 0 5px 5px", fontSize: "0.75rem", color: "#aaa" }}>Barcode 2</p>
                        <input type="text" placeholder="Barcode 2" value={formData.barcode2} onChange={(e) => setFormData({ ...formData, barcode2: e.target.value })} style={{ background: "#ededed", border: "none", borderRadius: "10px", padding: "0.75rem", width: "100%" }} />
                      </div>
                      <div>
                        <p style={{ margin: "0 0 5px 5px", fontSize: "0.75rem", color: "#aaa" }}>Barcode 3</p>
                        <input type="text" placeholder="Barcode 3" value={formData.barcode3} onChange={(e) => setFormData({ ...formData, barcode3: e.target.value })} style={{ background: "#ededed", border: "none", borderRadius: "10px", padding: "0.75rem", width: "100%" }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center", gap: "1rem" }}>
                    <label style={{ fontWeight: "600", color: "#555" }}>Tax</label>
                    <input type="text" placeholder="Tax" value={formData.tax} onChange={(e) => setFormData({ ...formData, tax: e.target.value })} style={{ background: "#ededed", border: "none", borderRadius: "10px", padding: "0.75rem 1rem" }} />
                  </div>

                  <div style={{ height: "1px", background: "#eee", margin: "0.5rem 0" }} />

                  {/* Image Upload */}
                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "center", gap: "1rem" }}>
                    <label style={{ fontWeight: "600", color: "#555" }}>Item Upload</label>
                    <div style={{ background: "#f5f5f5", borderRadius: "15px", padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ width: "120px", height: "70px", background: "white", borderRadius: "12px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 5px rgba(0,0,0,0.05)" }}>
                        {formData.image ? <img src={formData.image} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "contain" }} /> : <span style={{ color: "#ddd", fontSize: "0.7rem", textAlign: "center" }}>Sample only</span>}
                      </div>
                      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
                      <button onClick={() => fileInputRef.current?.click()} style={{ background: "white", border: "1px solid #48aad9", color: "#48aad9", borderRadius: "10px", padding: "0.5rem 1.5rem", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600" }}>Upload</button>
                    </div>
                  </div>

                  <div style={{ height: "1px", background: "#eee", margin: "0.5rem 0" }} />

                  {/* Additional Options */}
                  <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "flex-start", gap: "1rem" }}>
                    <label style={{ fontWeight: "600", color: "#555", marginTop: "5px" }}>Additional Options</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem" }}>
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
                          onClick={() => handleOptionToggle(ok.key)} 
                          style={{ 
                            padding: "0.45rem 1.2rem", 
                            borderRadius: "10px", 
                            border: "1.5px solid #48aad9", 
                            background: formData.options[ok.key] ? "#48aad9" : "white", 
                            color: formData.options[ok.key] ? "white" : "#48aad9", 
                            fontSize: "0.8rem", 
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                        >
                          {ok.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "2rem", display: "flex", gap: "1.5rem" }}>
                  <button onClick={closeModal} style={{ flex: 1, borderRadius: "12px", padding: "0.85rem", background: "white", border: "1.5px solid #48aad9", color: "#48aad9", fontWeight: "700", cursor: "pointer" }}>Cancel</button>
                  <button onClick={handleSave} style={{ flex: 1, borderRadius: "12px", padding: "0.85rem", background: "#48aad9", border: "none", color: "white", fontWeight: "700", cursor: "pointer" }}>Save Changes</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
