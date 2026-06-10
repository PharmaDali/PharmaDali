import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/inventory.css";
import Modal from "../components/Modal";
import infoIcon from "../assets/icons/modal-icons/info.svg";
import { fetchInventoryMetrics, fetchInventoryProducts, createInventoryProduct } from "../services/inventoryService";

const CATEGORY_FILTERS = [
  "All",
  "Generic",
  "Branded",
  "Infant",
  "Milk",
  "Diapers",
  "Vitamins",
  "Supplies",
  "Eyes Med",
  "Hygiene",
  "Injectables/Vials",
  "Cosmetics",
  "Cream/Ointment",
  "Unclassified",
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

const DUMMY_PRIORITY_RESTOCKS = [
  {
    id: "restock-dummy-1",
    name: "Biogesic 500mg",
    quantity: 8,
    velocity: "Slow",
    expiringInDays: 120,
  },
  {
    id: "restock-dummy-2",
    name: "Amoxicillin 250mg",
    quantity: 14,
    velocity: "Medium",
    expiringInDays: 90,
  },
  {
    id: "restock-dummy-3",
    name: "Vitamin C Chewable",
    quantity: 19,
    velocity: "Fast",
    expiringInDays: 150,
  },
];

const DUMMY_EXPIRING_SOON = [
  {
    id: "expiry-dummy-1",
    name: "Mefenamic Acid 500mg",
    quantity: 26,
    velocity: "Medium",
    expiringInDays: 12,
  },
  {
    id: "expiry-dummy-2",
    name: "Cetirizine Syrup",
    quantity: 34,
    velocity: "Slow",
    expiringInDays: 18,
  },
  {
    id: "expiry-dummy-3",
    name: "Paracetamol Drops",
    quantity: 11,
    velocity: "Fast",
    expiringInDays: 24,
  },
];

const formatExpiryMonthValue = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}`;
};

const getDaysUntilMonth = (value) => {
  if (!value) {
    return 0;
  }

  const [yearValue, monthValue] = value.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);

  if (!year || !month) {
    return 0;
  }

  const targetDate = new Date(year, month - 1, 1);
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffMs = targetDate.getTime() - todayDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

const toNumber = (value, fallback = 0) => {
  const next = Number(value);
  return Number.isNaN(next) ? fallback : next;
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
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [metrics, setMetrics] = useState({
    total_products: 0,
    low_stocks: 0,
    expiring: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalEditing, setIsModalEditing] = useState(false);
  const [modalDraft, setModalDraft] = useState(null);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addProductType, setAddProductType] = useState("medicine");
  const [addForm, setAddForm] = useState({
    genericName: "",
    brandName: "",
    dosage: "",
    size: "",
    batchNumber: "",
    expiryDate: "",
    productName: "",
    categoryName: "",
    quantity: "",
    unitCost: "",
    discountable: "False",
    sellingPrice: "",
    barcode: "",
    description: "",
    needsPrescription: "False",
  });

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    const isMedicine = addProductType === "medicine";

    let payload = {
      product_type: addProductType,
      generic_name: isMedicine ? addForm.genericName : null,
      brand_name: isMedicine ? addForm.brandName : null,
      product_name: isMedicine ? addForm.genericName : addForm.productName,
      form: isMedicine ? addForm.dosage : null,
      strength: isMedicine ? addForm.dosage : null,
      size: addForm.size || null,
      description: addForm.description || null,
      stock: addForm.quantity ? parseInt(addForm.quantity, 10) : 0,
      selling_price: addForm.sellingPrice ? parseFloat(addForm.sellingPrice) : 0.00,
      is_discountable: addForm.discountable === "True",
      expiry_date: addForm.expiryDate || null,
      is_prescribed: isMedicine ? (addForm.needsPrescription === "True") : false,
      category_name: addForm.categoryName || null,
    };

    if (isMedicine && !addForm.genericName) {
      alert("Generic Name is required for medicine.");
      return;
    }
    if (!isMedicine && !addForm.productName) {
      alert("Product Name is required.");
      return;
    }
    if (!isMedicine && (!addForm.categoryName || addForm.categoryName === "All" || addForm.categoryName === "category")) {
      alert("Please select a valid Category.");
      return;
    }

    try {
      await createInventoryProduct(payload);
      setAddForm({
        genericName: "",
        brandName: "",
        dosage: "",
        size: "",
        batchNumber: "",
        expiryDate: "",
        productName: "",
        categoryName: "",
        quantity: "",
        unitCost: "",
        discountable: "False",
        sellingPrice: "",
        barcode: "",
        description: "",
        needsPrescription: "False",
      });
      setIsAddModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Failed to create product:", err);
      alert(err.response?.data?.message || "Failed to create product. Please check your inputs.");
    }
  };

  const loadData = useCallback(async () => {
    setCurrentPage(1);
    setLoading(true);
    try {
      const [products, metricsResult] = await Promise.all([
        fetchInventoryProducts({
          search: query,
          category: categoryFilter,
          price_range: priceFilter,
          stock_range: stockFilter,
          status: statusFilter,
        }),
        fetchInventoryMetrics(),
      ]);
      setInventoryItems(products);
      setMetrics(metricsResult);
    } catch (err) {
      console.error("Failed to load inventory data", err);
    } finally {
      setLoading(false);
    }
  }, [query, categoryFilter, priceFilter, stockFilter, statusFilter]);

  useEffect(() => {
    loadData();
  }, [categoryFilter, priceFilter, stockFilter, statusFilter]);

  const decoratedItems = useMemo(
    () =>
      inventoryItems.map((item) => ({
        ...item,
        expiryLabel: item.expiryDate
          ? new Date(item.expiryDate).toLocaleDateString("en-PH", { month: "2-digit", year: "numeric" })
          : "N/A",
      })),
    [inventoryItems],
  );

  const categoryOptions = useMemo(() => CATEGORY_FILTERS, []);

  const filteredItems = decoratedItems;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = useMemo(
    () => filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredItems, currentPage],
  );
  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const endPage = Math.min(totalPages, startPage + 4);

    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const totalItems = metrics.total_products;
  const lowStockCount = metrics.low_stocks;
  const expiringSoonCount = metrics.expiring;
  const expiredCount = metrics.expired;

  const lowStockItems = useMemo(
    () => {
      const items = decoratedItems
        .filter((item) => item.quantity <= item.reorderPoint)
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 3);

      return items.length > 0 ? items : DUMMY_PRIORITY_RESTOCKS;
    },
    [decoratedItems],
  );

  const expiringItems = useMemo(
    () => {
      const items = decoratedItems
        .filter((item) => item.expiringInDays > 0 && item.expiringInDays <= 30)
        .sort((a, b) => a.expiringInDays - b.expiringInDays)
        .slice(0, 3);

      return items.length > 0 ? items : DUMMY_EXPIRING_SOON;
    },
    [decoratedItems],
  );

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setIsModalEditing(false);
    setModalDraft({
      name: item.name,
      brand: item.brand,
      category: item.category,
      form: item.form,
      id: item.id,
      sellingPrice: item.sellingPrice,
      reorderPoint: item.reorderPoint,
      quantity: item.quantity,
      expiryMonth: formatExpiryMonthValue(item.expiringInDays),
      needsPrescription: false,
    });
  };

  const handleModalClose = () => {
    setSelectedItem(null);
    setModalDraft(null);
    setIsModalEditing(false);
    setShowConfirmSave(false);
  };

  const handleDraftChange = (field, value) => {
    setModalDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveChanges = () => {
    if (!selectedItem || !modalDraft) {
      return;
    }

    const updatedItem = {
      ...selectedItem,
      name: modalDraft.name.trim() || selectedItem.name,
      brand: modalDraft.brand.trim() || selectedItem.brand,
      category: modalDraft.category.trim() || selectedItem.category,
      form: modalDraft.form.trim() || selectedItem.form,
      id: modalDraft.id.trim() || selectedItem.id,
      sellingPrice: toNumber(modalDraft.sellingPrice, selectedItem.sellingPrice),
      reorderPoint: toNumber(modalDraft.reorderPoint, selectedItem.reorderPoint),
      quantity: toNumber(modalDraft.quantity, selectedItem.quantity),
      expiringInDays: getDaysUntilMonth(modalDraft.expiryMonth),
    };

    setInventoryItems((prev) =>
      prev.map((item) => (item.id === selectedItem.id ? updatedItem : item)),
    );
    setSelectedItem(updatedItem);
    setIsModalEditing(false);
  };

  const handleRequestSave = () => {
    if (!isModalEditing) {
      return;
    }

    setShowConfirmSave(true);
  };

  const handleConfirmSave = () => {
    handleSaveChanges();
    setShowConfirmSave(false);
  };

  const handleCancelSave = () => {
    setShowConfirmSave(false);
  };

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
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  loadData();
                }
              }}
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
          <button type="button" className="btn inventory-search-btn" onClick={loadData}>
            Search
          </button>
        </div>
      </div>

      <div className="row g-4 inventory-content-row">
        <div className="col-12 col-xl-8">
          <article className="inventory-table-card h-100">
            <div className="inventory-table-actions">
              <div className="inventory-action-group">
                <button
                  type="button"
                  className="btn inventory-action-btn inventory-action-primary"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  + Add New Product
                </button>
                <button
                  type="button"
                  className="btn inventory-action-btn inventory-action-muted"
                  onClick={() => navigate("/inventory/logs")}
                >
                  View Inventory Logs
                </button>
              </div>
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
                  {loading ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="inventory-empty-state">
                          <div className="spinner-border text-primary mb-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mb-0">Loading inventory items...</p>
                        </div>
                      </td>
                    </tr>
                  ) : filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="inventory-empty-state">
                          <i className="fa-regular fa-folder-open mb-2" aria-hidden="true" />
                          <p className="mb-0">No inventory item matches your filter.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item) => (
                      <tr
                        key={item.id}
                        className={selectedItem?.id === item.id ? "inventory-row-selected" : ""}
                        onClick={() => handleSelectItem(item)}
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
            {!loading && filteredItems.length > 0 && (
              <div className="inventory-pagination-bar">
                <span className="inventory-pagination-info">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–
                  {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length}
                </span>

                <nav aria-label="Inventory product table pagination">
                  <ul className="inventory-pagination">
                    <li className={`inventory-page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button
                        type="button"
                        className="inventory-page-link inventory-page-nav"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        aria-label="Previous page"
                      >
                        <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                      </button>
                    </li>

                    {visiblePageNumbers[0] > 1 && (
                      <>
                        <li className="inventory-page-item">
                          <button
                            type="button"
                            className="inventory-page-link"
                            onClick={() => handlePageChange(1)}
                          >
                            1
                          </button>
                        </li>
                        {visiblePageNumbers[0] > 2 && (
                          <li className="inventory-page-item inventory-page-ellipsis">
                            <span>…</span>
                          </li>
                        )}
                      </>
                    )}

                    {visiblePageNumbers.map((pageNumber) => (
                      <li
                        key={pageNumber}
                        className={`inventory-page-item ${currentPage === pageNumber ? "active" : ""}`}
                      >
                        <button
                          type="button"
                          className="inventory-page-link"
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    ))}

                    {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages && (
                      <>
                        {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages - 1 && (
                          <li className="inventory-page-item inventory-page-ellipsis">
                            <span>…</span>
                          </li>
                        )}
                        <li className="inventory-page-item">
                          <button
                            type="button"
                            className="inventory-page-link"
                            onClick={() => handlePageChange(totalPages)}
                          >
                            {totalPages}
                          </button>
                        </li>
                      </>
                    )}

                    <li className={`inventory-page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button
                        type="button"
                        className="inventory-page-link inventory-page-nav"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        aria-label="Next page"
                      >
                        <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
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

      <Modal
        isOpen={!!selectedItem}
        onClose={handleModalClose}
        title="Product Details"
        size="md"
        className="inventory-details-modal"
        showCloseButton={true}
        footer={
          <div className={`inventory-modal-actions${isModalEditing ? " is-editing" : ""}`}>
            <button
              type="button"
              className="btn inventory-modal-btn inventory-modal-btn-outline"
              onClick={() => setIsModalEditing(true)}
              disabled={isModalEditing}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn inventory-modal-btn inventory-modal-btn-primary"
              onClick={handleRequestSave}
              disabled={!isModalEditing}
            >
              Save Changes
            </button>
          </div>
        }
      >
        {selectedItem && modalDraft && (
          <div className="inventory-modal-body-content">
            <div className="inventory-modal-section">
              <h6 className="inventory-modal-section-title">Basic Information</h6>
              <div className="inventory-modal-grid">
                <div>
                  <p className="inventory-modal-label">Generic Name</p>
                  <input
                    type="text"
                    className="form-control inventory-modal-input"
                    value={modalDraft.name}
                    onChange={(event) => handleDraftChange("name", event.target.value)}
                    disabled={!isModalEditing}
                  />
                </div>
                <div>
                  <p className="inventory-modal-label">Brand Name</p>
                  <input
                    type="text"
                    className="form-control inventory-modal-input"
                    value={modalDraft.brand}
                    onChange={(event) => handleDraftChange("brand", event.target.value)}
                    disabled={!isModalEditing}
                  />
                </div>
                <div>
                  <p className="inventory-modal-label">Category</p>
                  <select
                    className="form-select inventory-modal-input"
                    value={modalDraft.category}
                    onChange={(event) => handleDraftChange("category", event.target.value)}
                    disabled={!isModalEditing}
                  >
                    {CATEGORY_FILTERS.filter((category) => category !== "All").map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="inventory-modal-label">Form</p>
                  <input
                    type="text"
                    className="form-control inventory-modal-input"
                    value={modalDraft.form}
                    onChange={(event) => handleDraftChange("form", event.target.value)}
                    disabled={!isModalEditing}
                  />
                </div>
              </div>
            </div>

            <div className="inventory-modal-section">
              <h6 className="inventory-modal-section-title">Inventory Data</h6>
              <div className="inventory-modal-grid">
                <div>
                  <p className="inventory-modal-label">Barcode</p>
                  <input
                    type="text"
                    className="form-control inventory-modal-input"
                    value={modalDraft.id}
                    onChange={(event) => handleDraftChange("id", event.target.value)}
                    disabled={!isModalEditing}
                  />
                </div>
                <div>
                  <p className="inventory-modal-label">Needs Prescription</p>
                  <select
                    className="form-select inventory-modal-input"
                    value={modalDraft.needsPrescription ? "true" : "false"}
                    onChange={(event) =>
                      handleDraftChange("needsPrescription", event.target.value === "true")
                    }
                    disabled={!isModalEditing}
                  >
                    <option value="false">False</option>
                    <option value="true">True</option>
                  </select>
                </div>
                <div>
                  <p className="inventory-modal-label">Expiry Date</p>
                  <input
                    type="month"
                    className="form-control inventory-modal-input"
                    value={modalDraft.expiryMonth}
                    onChange={(event) => handleDraftChange("expiryMonth", event.target.value)}
                    disabled={!isModalEditing}
                  />
                </div>
                <div>
                  <p className="inventory-modal-label">Selling Cost</p>
                  <input
                    type="number"
                    className="form-control inventory-modal-input"
                    value={modalDraft.sellingPrice}
                    onChange={(event) => handleDraftChange("sellingPrice", event.target.value)}
                    step="0.01"
                    min="0"
                    disabled={!isModalEditing}
                  />
                </div>
                <div>
                  <p className="inventory-modal-label">Dosage/Size</p>
                  <input
                    type="text"
                    className="form-control inventory-modal-input"
                    value={modalDraft.form}
                    onChange={(event) => handleDraftChange("form", event.target.value)}
                    disabled={!isModalEditing}
                  />
                </div>
              </div>
            </div>

            <div className="inventory-modal-section">
              <h6 className="inventory-modal-section-title">Stock Settings</h6>
              <div className="inventory-modal-grid">
                <div>
                  <p className="inventory-modal-label">Reorder Level</p>
                  <input
                    type="number"
                    className="form-control inventory-modal-input"
                    value={modalDraft.reorderPoint}
                    onChange={(event) => handleDraftChange("reorderPoint", event.target.value)}
                    min="0"
                    disabled={!isModalEditing}
                  />
                </div>
                <div>
                  <p className="inventory-modal-label">Initial Stock Quantity</p>
                  <input
                    type="number"
                    className="form-control inventory-modal-input"
                    value={modalDraft.quantity}
                    onChange={(event) => handleDraftChange("quantity", event.target.value)}
                    min="0"
                    disabled={!isModalEditing}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showConfirmSave}
        onClose={handleCancelSave}
        size="sm"
        showCloseButton={false}
        closeOnOverlay={false}
        className="pos-confirm-modal"
      >
        <div className="pos-confirm-content">
          <img src={infoIcon} alt="Information" className="pos-confirm-icon" />
          <h3 className="pos-confirm-title">Confirm Changes?</h3>
          <p className="pos-confirm-text">
            Changes will be reflected in the inventory after you save.
          </p>
          <div className="pos-confirm-actions">
            <button type="button" className="pos-confirm-primary" onClick={handleConfirmSave}>
              Continue
            </button>
            <button type="button" className="pos-confirm-secondary" onClick={handleCancelSave}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Product"
        size="md"
        className="add-product-modal"
        showCloseButton={true}
      >
        <form onSubmit={handleAddProductSubmit} className="add-product-modal-body">
          {/* Radio Buttons for Medicine/Non-medicine */}
          <div className="add-product-type-selector">
            <label className="add-product-type-label">
              <input
                type="radio"
                name="product_type"
                value="medicine"
                checked={addProductType === "medicine"}
                onChange={() => setAddProductType("medicine")}
              />
              Medicine
            </label>
            <label className="add-product-type-label">
              <input
                type="radio"
                name="product_type"
                value="non_medicine"
                checked={addProductType === "non_medicine"}
                onChange={() => setAddProductType("non_medicine")}
              />
              Non-medicine
            </label>
          </div>

          {/* Basic Information Section */}
          <div className="add-product-section">
            <h6 className="add-product-section-title">Basic Information</h6>
            <div className="add-product-grid">
              {addProductType === "medicine" ? (
                <>
                  <div className="add-product-field">
                    <label className="add-product-label">Generic Name</label>
                    <input
                      type="text"
                      className="add-product-input"
                      placeholder="Generic Name"
                      value={addForm.genericName}
                      onChange={(e) => setAddForm(prev => ({ ...prev, genericName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="add-product-field">
                    <label className="add-product-label">Brand Name</label>
                    <input
                      type="text"
                      className="add-product-input"
                      placeholder="Generic Name"
                      value={addForm.brandName}
                      onChange={(e) => setAddForm(prev => ({ ...prev, brandName: e.target.value }))}
                    />
                  </div>
                  <div className="add-product-field">
                    <label className="add-product-label">Category</label>
                    <select
                      className="add-product-select"
                      value={addForm.categoryName}
                      onChange={(e) => setAddForm(prev => ({ ...prev, categoryName: e.target.value }))}
                    >
                      {CATEGORY_FILTERS.filter(cat => cat !== "All").map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="add-product-field">
                    <label className="add-product-label">Dosage</label>
                    <input
                      type="text"
                      className="add-product-input"
                      placeholder="Dosage"
                      value={addForm.dosage}
                      onChange={(e) => setAddForm(prev => ({ ...prev, dosage: e.target.value }))}
                    />
                  </div>
                  <div className="add-product-field">
                    <label className="add-product-label">Size</label>
                    <input
                      type="text"
                      className="add-product-input"
                      placeholder="Size"
                      value={addForm.size}
                      onChange={(e) => setAddForm(prev => ({ ...prev, size: e.target.value }))}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="add-product-field add-product-full-width">
                    <label className="add-product-label">Product Name</label>
                    <input
                      type="text"
                      className="add-product-input"
                      placeholder="Generic Name"
                      value={addForm.productName}
                      onChange={(e) => setAddForm(prev => ({ ...prev, productName: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="add-product-field">
                    <label className="add-product-label">Category</label>
                    <select
                      className="add-product-select"
                      value={addForm.categoryName}
                      onChange={(e) => setAddForm(prev => ({ ...prev, categoryName: e.target.value }))}
                      required
                    >
                      {CATEGORY_FILTERS.filter(cat => cat !== "All" && cat !== "Generic" && cat !== "Branded" && cat !== "Unclassified").map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="add-product-field">
                    <label className="add-product-label">Size</label>
                    <input
                      type="text"
                      className="add-product-input"
                      placeholder="Size"
                      value={addForm.size}
                      onChange={(e) => setAddForm(prev => ({ ...prev, size: e.target.value }))}
                    />
                  </div>
                </>
              )}

              <div className="add-product-field">
                <label className="add-product-label">Batch Number</label>
                <input
                  type="text"
                  className="add-product-input"
                  placeholder="Batch Number"
                  value={addForm.batchNumber}
                  onChange={(e) => setAddForm(prev => ({ ...prev, batchNumber: e.target.value }))}
                />
              </div>
              <div className="add-product-field">
                <label className="add-product-label">Expiry Date</label>
                <div style={{ position: "relative" }}>
                  <i
                    className="fa-regular fa-calendar"
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#48aad9",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="date"
                    className={`add-product-input ${!addForm.expiryDate ? "is-empty" : ""}`}
                    placeholder="dd/mm/yyyy"
                    style={{ paddingRight: "2.5rem" }}
                    value={addForm.expiryDate}
                    onChange={(e) => setAddForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                </div>
              </div>
              {addProductType === "medicine" && (
                <div className="add-product-field">
                  <label className="add-product-label">Needs Prescription</label>
                  <select
                    className="add-product-select"
                    value={addForm.needsPrescription}
                    onChange={(e) => setAddForm(prev => ({ ...prev, needsPrescription: e.target.value }))}
                  >
                    <option value="False">False</option>
                    <option value="True">True</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Details Section */}
          <div className="add-product-section">
            <h6 className="add-product-section-title">Transaction Details</h6>
            <div className="add-product-grid">
              <div className="add-product-field">
                <label className="add-product-label">Quantity</label>
                <input
                  type="number"
                  className="add-product-input"
                  placeholder="Quantity"
                  value={addForm.quantity}
                  onChange={(e) => setAddForm(prev => ({ ...prev, quantity: e.target.value }))}
                />
              </div>
              <div className="add-product-field">
                <label className="add-product-label">Unit Cost</label>
                <input
                  type="number"
                  step="0.01"
                  className="add-product-input"
                  placeholder="Unit Cost"
                  value={addForm.unitCost}
                  onChange={(e) => setAddForm(prev => ({ ...prev, unitCost: e.target.value }))}
                />
              </div>
              <div className="add-product-field">
                <label className="add-product-label">Discountable</label>
                <select
                  className="add-product-select"
                  value={addForm.discountable}
                  onChange={(e) => setAddForm(prev => ({ ...prev, discountable: e.target.value }))}
                >
                  <option value="False">False</option>
                  <option value="True">True</option>
                </select>
              </div>
              <div className="add-product-field">
                <label className="add-product-label">Selling Price</label>
                <input
                  type="number"
                  step="0.01"
                  className="add-product-input"
                  placeholder="Selling Price"
                  value={addForm.sellingPrice}
                  onChange={(e) => setAddForm(prev => ({ ...prev, sellingPrice: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Other Details Section */}
          <div className="add-product-section">
            <h6 className="add-product-section-title">Other Details</h6>
            <div className="add-product-grid">
              <div className="add-product-field add-product-full-width">
                <label className="add-product-label">Barcode</label>
                <input
                  type="text"
                  className="add-product-input"
                  placeholder="Barcode"
                  value={addForm.barcode}
                  onChange={(e) => setAddForm(prev => ({ ...prev, barcode: e.target.value }))}
                />
              </div>
              <div className="add-product-field add-product-full-width">
                <label className="add-product-label">Product Description</label>
                <textarea
                  className="add-product-textarea"
                  placeholder="Description here..."
                  value={addForm.description}
                  onChange={(e) => setAddForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="add-product-footer">
            <button
              type="button"
              className="add-product-btn-cancel"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="add-product-btn-add">
              Add
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

export default Inventory;