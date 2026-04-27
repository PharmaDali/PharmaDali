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
  },
];

const FILTERS = ["All", "Low Stock", "Expiring", "Healthy"];

const getStockStatus = (item) => {
  if (item.quantity <= item.reorderPoint) {
    return "Low Stock";
  }

  if (item.expiringInDays <= 30) {
    return "Expiring";
  }

  return "Healthy";
};

function Inventory() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const decoratedItems = useMemo(
    () => INVENTORY_ITEMS.map((item) => ({ ...item, status: getStockStatus(item) })),
    [],
  );

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return decoratedItems.filter((item) => {
      const matchesFilter = activeFilter === "All" || item.status === activeFilter;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [item.name, item.brand, item.form, item.id, item.category]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, decoratedItems, query]);

  const totalItems = decoratedItems.length;
  const lowStockCount = decoratedItems.filter((item) => item.status === "Low Stock").length;
  const expiringSoonCount = decoratedItems.filter((item) => item.status === "Expiring").length;
  const healthyCount = decoratedItems.filter((item) => item.status === "Healthy").length;

  const lowStockItems = decoratedItems
    .filter((item) => item.status === "Low Stock")
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 4);

  const expiringItems = decoratedItems
    .filter((item) => item.expiringInDays <= 30)
    .sort((a, b) => a.expiringInDays - b.expiringInDays)
    .slice(0, 4);

  return (
    <section className="inventory-page">
      <header className="inventory-header-row">
        <div>
          <h4 className="fw-bold mb-1 admin-page-title">
            Inventory
          </h4>
          <p className="admin-page-subtitle">
            Monitor stock health, spot urgent risks, and prep smarter replenishment decisions.
          </p>
        </div>
        <div className="inventory-header-actions">
          <button type="button" className="btn inventory-action-btn inventory-action-btn-ghost">
            <i className="fa-solid fa-file-export me-2" aria-hidden="true" />
            Export
          </button>
          <button type="button" className="btn inventory-action-btn inventory-action-btn-primary">
            <i className="fa-solid fa-plus me-2" aria-hidden="true" />
            Add medicine
          </button>
        </div>
      </header>

      <div className="inventory-metrics">
        <article className="inventory-metric-card">
          <p className="inventory-metric-label mb-1">Total SKUs</p>
          <p className="inventory-metric-value mb-0">{totalItems}</p>
        </article>
        <article className="inventory-metric-card inventory-metric-warning">
          <p className="inventory-metric-label mb-1">Low stock</p>
          <p className="inventory-metric-value mb-0">{lowStockCount}</p>
        </article>
        <article className="inventory-metric-card inventory-metric-danger">
          <p className="inventory-metric-label mb-1">Expiring (30 days)</p>
          <p className="inventory-metric-value mb-0">{expiringSoonCount}</p>
        </article>
        <article className="inventory-metric-card inventory-metric-success">
          <p className="inventory-metric-label mb-1">Healthy stock</p>
          <p className="inventory-metric-value mb-0">{healthyCount}</p>
        </article>
      </div>

      <div className="inventory-toolbar">
        <div className="inventory-search-wrap">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            className="form-control inventory-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search medicine, SKU, category"
            aria-label="Search inventory"
          />
        </div>

        <div className="inventory-filter-group" role="tablist" aria-label="Inventory filters">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`inventory-filter-btn${activeFilter === filter ? " active" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="row g-4 inventory-content-row">
        <div className="col-12 col-xl-8">
          <article className="inventory-table-card h-100">
            <div className="inventory-table-head">
              <h6 className="mb-0">Current stock</h6>
              <span className="inventory-table-count">{filteredItems.length} item(s)</span>
            </div>

            <div className="inventory-table-scroll">
              <table className="table inventory-table mb-0">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Category</th>
                    <th>On Hand</th>
                    <th>Expiry</th>
                    <th>Status</th>
                    <th>Velocity</th>
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
                      <tr key={item.id}>
                        <td>
                          <p className="inventory-item-name mb-0">{item.name}</p>
                          <p className="inventory-item-meta mb-0">
                            {item.brand} · {item.form} · {item.id}
                          </p>
                        </td>
                        <td>{item.category}</td>
                        <td>
                          <span className="inventory-number">{item.quantity}</span>
                          <span className="inventory-inline-meta"> Reorder at {item.reorderPoint}</span>
                        </td>
                        <td>{item.expiringInDays} days</td>
                        <td>
                          <span
                            className={`inventory-status-chip inventory-status-${item.status
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td>{item.velocity}</td>
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
              <ul className="inventory-side-list mb-0">
                {lowStockItems.map((item) => (
                  <li key={item.id} className="inventory-side-item">
                    <div>
                      <p className="inventory-side-name mb-0">{item.name}</p>
                      <p className="inventory-side-sub mb-0">{item.id}</p>
                    </div>
                    <span className="inventory-side-pill">{item.quantity} left</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="inventory-side-card inventory-side-card-alt">
              <h6 className="inventory-side-title">Expiring soon</h6>
              <ul className="inventory-side-list mb-0">
                {expiringItems.map((item) => (
                  <li key={item.id} className="inventory-side-item">
                    <div>
                      <p className="inventory-side-name mb-0">{item.name}</p>
                      <p className="inventory-side-sub mb-0">{item.brand}</p>
                    </div>
                    <span className="inventory-side-pill inventory-side-pill-danger">
                      {item.expiringInDays} days
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Inventory;