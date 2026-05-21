import { useMemo, useState } from "react";
import "../assets/css/inventory.css";

const INVENTORY_ITEMS = [
  {
    id: "MED-1001",
    name: "Amoxicillin",
    brand: "Axmel",
    form: "500 mg Capsule",
    category: "Antibiotic",
    quantity: 28,
    reorderPoint: 45,
    expiringInDays: 17,
    velocity: "Fast",
    sellingPrice: 12.0,
  },
  {
    id: "MED-1002",
    name: "Paracetamol",
    brand: "Biogesic",
    form: "500 mg Tablet",
    category: "Analgesic",
    quantity: 420,
    reorderPoint: 120,
    expiringInDays: 205,
    velocity: "Fast",
    sellingPrice: 8.5,
  },
  {
    id: "MED-1003",
    name: "Cetirizine",
    brand: "Zyrtec",
    form: "10 mg Tablet",
    category: "Antihistamine",
    quantity: 81,
    reorderPoint: 70,
    expiringInDays: 43,
    velocity: "Medium",
    sellingPrice: 4.0,
  },
  {
    id: "MED-1004",
    name: "Salbutamol",
    brand: "Ventolin",
    form: "100 mcg Inhaler",
    category: "Respiratory",
    quantity: 19,
    reorderPoint: 30,
    expiringInDays: 95,
    velocity: "Slow",
    sellingPrice: 10.0,
  },
  {
    id: "MED-1005",
    name: "Ibuprofen",
    brand: "Advil",
    form: "200 mg Tablet",
    category: "Analgesic",
    quantity: 160,
    reorderPoint: 100,
    expiringInDays: 22,
    velocity: "Medium",
    sellingPrice: 6.5,
  },
  {
    id: "MED-1006",
    name: "Loperamide",
    brand: "Diatabs",
    form: "2 mg Capsule",
    category: "Gastro",
    quantity: 47,
    reorderPoint: 50,
    expiringInDays: 11,
    velocity: "Slow",
    sellingPrice: 5.0,
  },
  {
    id: "MED-1007",
    name: "Omeprazole",
    brand: "Losec",
    form: "20 mg Capsule",
    category: "Gastro",
    quantity: 95,
    reorderPoint: 80,
    expiringInDays: 88,
    velocity: "Medium",
    sellingPrice: 9.25,
  },
  {
    id: "MED-1008",
    name: "Azithromycin",
    brand: "Zithromax",
    form: "500 mg Tablet",
    category: "Antibiotic",
    quantity: 24,
    reorderPoint: 40,
    expiringInDays: 14,
    velocity: "Fast",
    sellingPrice: 11.5,
  },
];

const CATEGORY_FILTERS = [
  "All",
  "Generic",
  "Branded",
  "Infant",
  "Milk",
  "Beverages",
  "Sanitary",
  "Diapers",
  "Vitamins",
  "Medical Tools",
  "Eye Med",
  "Hygiene",
  "Injectibles",
  "Cosmetics",
  "Cream",
  "Ointments",
];

const PRICE_FILTERS = [
  "All",
  "Below 10",
  "10 - 50",
  "51 - 100",
  "101 - 200",
  "200 - 500",
  "500 and above",
];

const STOCK_FILTERS = [
  "All",
  "Below 10",
  "10 - 50",
  "51 - 100",
  "101 - 200",
  "200 - 500",
  "500 and above",
];

const STATUS_FILTERS = ["All", "Normal", "Low Stocks", "Expiring soon", "Expired"];

const getInventoryStatus = (item) => {
  if (item.expiringInDays <= 0) {
    return "Expired";
  }

  if (item.expiringInDays <= 30) {
    return "Expiring soon";
  }

  if (item.quantity <= item.reorderPoint) {
    return "Low Stocks";
  }

  return "Normal";
};

const formatExpiry = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${year}`;
};

const getWeeksLeft = (item) => {
  const velocityRates = { Fast: 4, Medium: 2, Slow: 1 };
  const weeklyUsage = (velocityRates[item.velocity] ?? 2) * 7;
  const weeksLeft = Math.round(item.quantity / weeklyUsage);

  if (weeksLeft <= 1) {
    return "less than 1";
  }

  return `${weeksLeft}`;
};

function Inventory() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);

  const decoratedItems = useMemo(
    () =>
      INVENTORY_ITEMS.map((item) => ({
        ...item,
        status: getInventoryStatus(item),
        expiryLabel: formatExpiry(item.expiringInDays),
      })),
    [],
  );

  const categoryOptions = useMemo(() => CATEGORY_FILTERS, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return decoratedItems.filter((item) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [item.name, item.brand, item.category].join(" ").toLowerCase().includes(normalizedQuery);

      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;

      const matchesPrice =
        priceFilter === "All" ||
        (priceFilter === "Below 10" && item.sellingPrice < 10) ||
        (priceFilter === "10 - 50" && item.sellingPrice >= 10 && item.sellingPrice <= 50) ||
        (priceFilter === "51 - 100" && item.sellingPrice >= 51 && item.sellingPrice <= 100) ||
        (priceFilter === "101 - 200" && item.sellingPrice >= 101 && item.sellingPrice <= 200) ||
        (priceFilter === "200 - 500" && item.sellingPrice >= 200 && item.sellingPrice <= 500) ||
        (priceFilter === "500 and above" && item.sellingPrice >= 500);

      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "Below 10" && item.quantity < 10) ||
        (stockFilter === "10 - 50" && item.quantity >= 10 && item.quantity <= 50) ||
        (stockFilter === "51 - 100" && item.quantity >= 51 && item.quantity <= 100) ||
        (stockFilter === "101 - 200" && item.quantity >= 101 && item.quantity <= 200) ||
        (stockFilter === "200 - 500" && item.quantity >= 200 && item.quantity <= 500) ||
        (stockFilter === "500 and above" && item.quantity >= 500);

      const matchesStatus = statusFilter === "All" || item.status === statusFilter;

      return matchesQuery && matchesCategory && matchesPrice && matchesStock && matchesStatus;
    });
  }, [categoryFilter, decoratedItems, priceFilter, query, statusFilter, stockFilter]);

  const totalItems = decoratedItems.length;
  const lowStockCount = decoratedItems.filter((item) => item.status === "Low Stocks").length;
  const expiringSoonCount = decoratedItems.filter(
    (item) => item.status === "Expiring soon",
  ).length;
  const expiredCount = decoratedItems.filter((item) => item.status === "Expired").length;

  const lowStockItems = decoratedItems
    .filter((item) => item.quantity <= item.reorderPoint)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 3);

  const expiringItems = decoratedItems
    .filter((item) => item.expiringInDays > 0 && item.expiringInDays <= 30)
    .sort((a, b) => a.expiringInDays - b.expiringInDays)
    .slice(0, 3);

  return (
    <section className="inventory-page">
      <header className="admin-page-header">
        <h4 className="fw-bold mb-1 admin-page-title">Inventory</h4>
        <p className="admin-page-subtitle">
          Monitor stock health, spot urgent risks, and prep smarter replenishment strategies.
        </p>
      </header>
      <div className="inventory-metrics">
        <article className="inventory-metric-card inventory-metric-total">
          <p className="inventory-metric-label mb-1">Total Products</p>
          <p className="inventory-metric-value mb-0">{totalItems}</p>
        </article>
        <article className="inventory-metric-card inventory-metric-low">
          <p className="inventory-metric-label mb-1">Low Stocks</p>
          <p className="inventory-metric-value mb-0">{lowStockCount}</p>
        </article>
        <article className="inventory-metric-card inventory-metric-expiring">
          <p className="inventory-metric-label mb-1">Expiring</p>
          <p className="inventory-metric-value mb-0">{expiringSoonCount}</p>
        </article>
        <article className="inventory-metric-card inventory-metric-expired">
          <p className="inventory-metric-label mb-1">Expired</p>
          <p className="inventory-metric-value mb-0">{expiredCount}</p>
        </article>
      </div>

      <div className="inventory-filter-bar">
        <div className="inventory-field inventory-search-field">
          <label className="inventory-field-label" htmlFor="inventory-search">
            Search by product name
          </label>
          <div className="inventory-input-wrap">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              id="inventory-search"
              className="form-control inventory-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by product name"
              aria-label="Search inventory"
            />
          </div>
        </div>

        <div className="inventory-field">
          <label className="inventory-field-label" htmlFor="inventory-category">
            Category
          </label>
          <select
            id="inventory-category"
            className="form-select inventory-select"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="inventory-field">
          <label className="inventory-field-label" htmlFor="inventory-price">
            Price
          </label>
          <select
            id="inventory-price"
            className="form-select inventory-select"
            value={priceFilter}
            onChange={(event) => setPriceFilter(event.target.value)}
          >
            {PRICE_FILTERS.map((price) => (
              <option key={price} value={price}>
                {price}
              </option>
            ))}
          </select>
        </div>

        <div className="inventory-field">
          <label className="inventory-field-label" htmlFor="inventory-stocks">
            Stocks
          </label>
          <select
            id="inventory-stocks"
            className="form-select inventory-select"
            value={stockFilter}
            onChange={(event) => setStockFilter(event.target.value)}
          >
            {STOCK_FILTERS.map((stock) => (
              <option key={stock} value={stock}>
                {stock}
              </option>
            ))}
          </select>
        </div>

        <div className="inventory-field">
          <label className="inventory-field-label" htmlFor="inventory-status">
            Status
          </label>
          <select
            id="inventory-status"
            className="form-select inventory-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            {STATUS_FILTERS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="inventory-field inventory-search-action">
          <button type="button" className="btn inventory-search-btn">
            Search
          </button>
        </div>
      </div>

      <div className="row g-4 inventory-content-row">
        <div className="col-12 col-xl-8">
          <article className="inventory-table-card h-100">
            <div className="inventory-table-actions">
              <div className="inventory-action-group">
                <button type="button" className="btn inventory-action-btn inventory-action-primary">
                  + Add New Medicine
                </button>
                <button type="button" className="btn inventory-action-btn inventory-action-primary">
                  + Add New Product
                </button>
                <button type="button" className="btn inventory-action-btn inventory-action-muted">
                  View Inventory Logs
                </button>
              </div>
              <select
                className="form-select inventory-table-filter"
                aria-label="Table filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {STATUS_FILTERS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="inventory-table-scroll">
              <table className="table inventory-table mb-0">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Stock Quantity</th>
                    <th>Expiry Date</th>
                    <th>Selling Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="inventory-empty-state">
                          <i className="fa-regular fa-folder-open mb-2" aria-hidden="true" />
                          <p className="mb-0">No inventory item matches your filter.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        className={selectedItem?.id === item.id ? "inventory-row-selected" : ""}
                        onClick={() => setSelectedItem(item)}
                      >
                        <td>
                          <p className="inventory-item-name mb-0">{item.name}</p>
                          <p className="inventory-item-meta mb-0">{item.brand}</p>
                        </td>
                        <td>{item.category}</td>
                        <td>{item.quantity}</td>
                        <td>{item.expiryLabel}</td>
                        <td>{item.sellingPrice.toFixed(2)}</td>
                        <td>
                          <span
                            className={`inventory-status-chip inventory-status-${item.status
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </article>
        </div>

        <div className="col-12 col-xl-4">
          <div className="inventory-side-stack h-100">
            <article className="inventory-side-card">
              <h6 className="inventory-side-title">Priority restocks</h6>
              <div className="inventory-side-table">
                <div className="inventory-side-head">
                  <span>Product</span>
                  <span>Qty.</span>
                  <span>Will Last (Weeks)</span>
                </div>
                {lowStockItems.map((item) => (
                  <div key={item.id} className="inventory-side-row">
                    <span className="inventory-side-name">{item.name}</span>
                    <span className="inventory-side-sub">{item.quantity} left</span>
                    <span className="inventory-side-pill inventory-side-pill-warn">
                      {getWeeksLeft(item)}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            <article className="inventory-side-card">
              <h6 className="inventory-side-title">Expiring Soon</h6>
              <div className="inventory-side-table">
                <div className="inventory-side-head">
                  <span>Product</span>
                  <span>Qty.</span>
                  <span>Expires In (Days)</span>
                </div>
                {expiringItems.map((item) => (
                  <div key={item.id} className="inventory-side-row">
                    <span className="inventory-side-name">{item.name}</span>
                    <span className="inventory-side-sub">{item.quantity} left</span>
                    <span className="inventory-side-pill inventory-side-pill-danger">
                      {item.expiringInDays}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </div>

      {selectedItem && (
        <div className="inventory-modal-overlay" role="dialog" aria-modal="true">
          <div className="inventory-modal">
            <div className="inventory-modal-header">
              <div className="inventory-modal-heading">
                <h5 className="inventory-modal-title mb-0">Product Details</h5>
              </div>
              <div className="inventory-modal-actions">
                <div className="inventory-modal-action-buttons">
                  <button type="button" className="btn inventory-modal-btn inventory-modal-btn-outline">
                    Edit
                  </button>
                  <button type="button" className="btn inventory-modal-btn inventory-modal-btn-primary">
                    Save Changes
                  </button>
                </div>
                <button
                  type="button"
                  className="btn inventory-modal-close"
                  aria-label="Close"
                  onClick={() => setSelectedItem(null)}
                >
                  <i className="fa-solid fa-xmark" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="inventory-modal-body">
              <div className="inventory-modal-section">
                <h6 className="inventory-modal-section-title">Basic Information</h6>
                <div className="inventory-modal-grid">
                  <div>
                    <p className="inventory-modal-label">Generic Name</p>
                    <p className="inventory-modal-value">{selectedItem.name}</p>
                  </div>
                  <div>
                    <p className="inventory-modal-label">Brand Name</p>
                    <p className="inventory-modal-value">{selectedItem.brand}</p>
                  </div>
                  <div>
                    <p className="inventory-modal-label">Category</p>
                    <p className="inventory-modal-value">{selectedItem.category}</p>
                  </div>
                  <div>
                    <p className="inventory-modal-label">Form</p>
                    <p className="inventory-modal-value">{selectedItem.form}</p>
                  </div>
                </div>
              </div>

              <div className="inventory-modal-section">
                <h6 className="inventory-modal-section-title">Inventory Data</h6>
                <div className="inventory-modal-grid">
                  <div>
                    <p className="inventory-modal-label">Barcode</p>
                    <p className="inventory-modal-value">{selectedItem.id}</p>
                  </div>
                  <div>
                    <p className="inventory-modal-label">Needs Prescription</p>
                    <p className="inventory-modal-value">False</p>
                  </div>
                  <div>
                    <p className="inventory-modal-label">Expiry Date</p>
                    <p className="inventory-modal-value">{selectedItem.expiryLabel}</p>
                  </div>
                  <div>
                    <p className="inventory-modal-label">Selling Cost</p>
                    <p className="inventory-modal-value">Php {selectedItem.sellingPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="inventory-modal-label">Dosage/Size</p>
                    <p className="inventory-modal-value">{selectedItem.form}</p>
                  </div>
                </div>
              </div>

              <div className="inventory-modal-section">
                <h6 className="inventory-modal-section-title">Stock Settings</h6>
                <div className="inventory-modal-grid">
                  <div>
                    <p className="inventory-modal-label">Reorder Level</p>
                    <p className="inventory-modal-value">{selectedItem.reorderPoint}</p>
                  </div>
                  <div>
                    <p className="inventory-modal-label">Initial Stock Quantity</p>
                    <p className="inventory-modal-value">{selectedItem.quantity}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Inventory;