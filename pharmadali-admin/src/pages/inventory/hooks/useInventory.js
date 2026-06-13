import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchInventoryMetrics,
  fetchInventoryProducts,
  createInventoryProduct,
  updateInventoryProduct,
  addProductBatch,
  updateProductBatch,
  stockOutProduct,
} from "../../../services/inventoryService";
import {
  CATEGORY_FILTERS,
  DUMMY_PRIORITY_RESTOCKS,
  DUMMY_EXPIRING_SOON,
  ITEMS_PER_PAGE,
} from "../inventoryConstants";
import {
  formatExpiryMonthValue,
  getDaysUntilMonth,
  getDaysUntilDate,
  toNumber,
} from "../../../utils/inventoryUtils";

export function useInventory() {
  const navigate = useNavigate();

  // Search and Filter States
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priceFilter, setPriceFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Core Data States
  const [inventoryItems, setInventoryItems] = useState([]);
  const [metrics, setMetrics] = useState({
    total_products: 0,
    low_stocks: 0,
    expiring: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(true);

  // Selection & Details Modal States
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalEditing, setIsModalEditing] = useState(false);
  const [modalDraft, setModalDraft] = useState(null);
  const [showConfirmSave, setShowConfirmSave] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Batch Management States
  const [batches, setBatches] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchEditStocks, setBatchEditStocks] = useState({});
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [newBatch, setNewBatch] = useState({
    batch_number: "",
    stock: "",
    expiry_date: "",
    manufactured_date: "",
  });
  const [batchSaving, setBatchSaving] = useState(false);

  // Stock-out Modal States
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [stockOutForm, setStockOutForm] = useState({ quantity: "" });
  const [stockOutSaving, setStockOutSaving] = useState(false);

  // Add Product Modal States
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

  // Load main inventory lists and summary metrics
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

  // Trigger loading when filter parameters change
  useEffect(() => {
    loadData();
  }, [categoryFilter, priceFilter, stockFilter, statusFilter]);

  // Derived properties: formatting dates to PH format
  const decoratedItems = useMemo(
    () =>
      inventoryItems.map((item) => ({
        ...item,
        expiryLabel: item.expiryDate
          ? new Date(item.expiryDate).toLocaleDateString("en-PH", {
              month: "2-digit",
              year: "numeric",
            })
          : "N/A",
      })),
    [inventoryItems]
  );

  const categoryOptions = useMemo(() => CATEGORY_FILTERS, []);
  const filteredItems = decoratedItems;

  // Pagination Math
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  
  const paginatedItems = useMemo(
    () =>
      filteredItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [filteredItems, currentPage]
  );

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const endPage = Math.min(totalPages, startPage + 4);
    return Array.from(
      { length: endPage - startPage + 1 },
      (_, index) => startPage + index
    );
  }, [currentPage, totalPages]);

  const handlePageChange = (page) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  // Side columns: metrics values & mock side-panel arrays
  const totalItems = metrics.total_products;
  const lowStockCount = metrics.low_stocks;
  const expiringSoonCount = metrics.expiring;
  const expiredCount = metrics.expired;

  const lowStockItems = useMemo(() => {
    const items = decoratedItems
      .filter((item) => item.quantity <= item.reorderPoint)
      .sort((a, b) => a.quantity - b.quantity)
      .slice(0, 3);
    return items.length > 0 ? items : DUMMY_PRIORITY_RESTOCKS;
  }, [decoratedItems]);

  const expiringItems = useMemo(() => {
    const items = decoratedItems
      .filter((item) => item.expiringInDays > 0 && item.expiringInDays <= 30)
      .sort((a, b) => a.expiringInDays - b.expiringInDays)
      .slice(0, 3);
    return items.length > 0 ? items : DUMMY_EXPIRING_SOON;
  }, [decoratedItems]);

  // Selection handlers
  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setIsModalEditing(false);
    setShowAddBatch(false);
    setNewBatch({
      batch_number: "",
      stock: "",
      expiry_date: "",
      manufactured_date: "",
    });
    setBatchEditStocks({});
    setModalDraft({
      name: item.name,
      brand: item.brand,
      category: item.category,
      form: item.form,
      id: item.id,
      sellingPrice: item.sellingPrice,
      reorderPoint: item.reorderPoint,
      quantity: item.quantity,
      expiryDate: item.expiryDate || "",
      needsPrescription: false,
    });
    
    const rawBatches = item.batches ?? [];
    setBatches(rawBatches);
    const stockMap = {};
    rawBatches.forEach((b) => {
      stockMap[b.id] = b.stock;
    });
    setBatchEditStocks(stockMap);
  };

  const handleModalClose = () => {
    setSelectedItem(null);
    setModalDraft(null);
    setIsModalEditing(false);
    setShowConfirmSave(false);
    setBatches([]);
    setBatchEditStocks({});
    setShowAddBatch(false);
    setNewBatch({
      batch_number: "",
      stock: "",
      expiry_date: "",
      manufactured_date: "",
    });
  };

  // Inline batch adjustments
  const handleBatchStockChange = (batchId, value) => {
    setBatchEditStocks((prev) => ({ ...prev, [batchId]: value }));
  };

  const handleSaveBatchStock = async (batch) => {
    const newStock = parseInt(batchEditStocks[batch.id], 10);
    if (isNaN(newStock) || newStock < 0) return;
    setBatchSaving(true);
    try {
      await updateProductBatch(batch.id, { stock: newStock });
      setBatches((prev) =>
        prev.map((b) => (b.id === batch.id ? { ...b, stock: newStock } : b))
      );
      const total = batches.reduce(
        (sum, b) => sum + (b.id === batch.id ? newStock : b.stock),
        0
      );
      setInventoryItems((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id ? { ...item, quantity: total } : item
        )
      );
    } catch (err) {
      console.error("Failed to update batch stock:", err);
      alert("Failed to update batch stock. Please try again.");
    } finally {
      setBatchSaving(false);
    }
  };

  const handleAddBatchSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    const stock = parseInt(newBatch.stock, 10);
    if (isNaN(stock) || stock < 0) {
      alert("Please enter a valid stock quantity.");
      return;
    }
    setBatchSaving(true);
    try {
      const result = await addProductBatch(selectedItem.id, {
        batch_number: newBatch.batch_number || null,
        stock,
        expiry_date: newBatch.expiry_date || null,
        manufactured_date: newBatch.manufactured_date || null,
      });
      const created = result.data;
      setBatches((prev) => [...prev, created]);
      setBatchEditStocks((prev) => ({ ...prev, [created.id]: created.stock }));
      setNewBatch({
        batch_number: "",
        stock: "",
        expiry_date: "",
        manufactured_date: "",
      });
      setShowAddBatch(false);
      loadData();
    } catch (err) {
      console.error("Failed to add batch:", err);
      alert(err.response?.data?.message || "Failed to add batch.");
    } finally {
      setBatchSaving(false);
    }
  };

  // Draft edits
  const handleDraftChange = (field, value) => {
    setModalDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Stock out deduction handler
  const handleStockOutSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    const qty = parseInt(stockOutForm.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      alert("Please enter a valid quantity to deduct.");
      return;
    }
    setStockOutSaving(true);
    try {
      const result = await stockOutProduct(selectedItem.id, {
        quantity: qty,
      });
      const refreshedBatches = result.batches ?? [];
      setBatches(refreshedBatches);
      const stockMap = {};
      refreshedBatches.forEach((b) => {
        stockMap[b.id] = b.stock;
      });
      setBatchEditStocks(stockMap);
      setInventoryItems((prev) =>
        prev.map((item) =>
          item.id === selectedItem.id
            ? { ...item, quantity: result.remaining_stock }
            : item
        )
      );
      setStockOutForm({ quantity: "" });
      setShowStockOutModal(false);
    } catch (err) {
      console.error("Stock-out failed:", err);
      alert(err.response?.data?.message || "Stock out failed. Please try again.");
    } finally {
      setStockOutSaving(false);
    }
  };

  // Saving product draft changes
  const handleConfirmSave = async () => {
    if (!selectedItem || !modalDraft) {
      setShowConfirmSave(false);
      return;
    }

    setBatchSaving(true);
    try {
      const isMedicine = selectedItem.product_type === "medicine" || !!modalDraft.brand || !!modalDraft.name;
      
      const payload = {
        product_type: isMedicine ? "medicine" : "non_medicine",
        product_name: modalDraft.name.trim() || selectedItem.name,
        generic_name: isMedicine ? (modalDraft.name.trim() || selectedItem.name) : null,
        brand_name: isMedicine ? (modalDraft.brand.trim() || selectedItem.brand) : null,
        form: modalDraft.form.trim() || selectedItem.form,
        strength: modalDraft.form.trim() || selectedItem.form,
        selling_price: toNumber(modalDraft.sellingPrice, selectedItem.sellingPrice),
        is_discountable: selectedItem.is_discountable,
        category_name: modalDraft.category.trim() || selectedItem.category,
      };

      await updateInventoryProduct(selectedItem.product_id, payload);

      // Now apply local state changes
      const updatedItem = {
        ...selectedItem,
        name: payload.product_name,
        brand: payload.brand_name || "",
        category: payload.category_name,
        form: payload.form,
        sellingPrice: payload.selling_price,
        expiringInDays: getDaysUntilDate(modalDraft.expiryDate),
        expiryDate: modalDraft.expiryDate,
      };

      setInventoryItems((prev) =>
        prev.map((item) => (item.id === selectedItem.id ? updatedItem : item))
      );
      setSelectedItem(updatedItem);
      setIsModalEditing(false);
      
      // Reload metrics & lists
      await loadData();
    } catch (err) {
      console.error("Failed to save product details:", err);
      alert(err.response?.data?.message || "Failed to update product details. Please try again.");
    } finally {
      setBatchSaving(false);
      setShowConfirmSave(false);
    }
  };

  const handleRequestSave = () => {
    if (!isModalEditing) return;
    setShowConfirmSave(true);
  };

  const handleCancelSave = () => {
    setShowConfirmSave(false);
  };

  // Add Product form submissions
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
      selling_price: addForm.sellingPrice ? parseFloat(addForm.sellingPrice) : 0.0,
      is_discountable: addForm.discountable === "True",
      expiry_date: addForm.expiryDate || null,
      is_prescribed: isMedicine ? addForm.needsPrescription === "True" : false,
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
    if (
      !isMedicine &&
      (!addForm.categoryName ||
        addForm.categoryName === "All" ||
        addForm.categoryName === "category")
    ) {
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
      alert(
        err.response?.data?.message ||
          "Failed to create product. Please check your inputs."
      );
    }
  };

  return {
    // Search/Filter State
    query,
    setQuery,
    categoryFilter,
    setCategoryFilter,
    priceFilter,
    setPriceFilter,
    stockFilter,
    setStockFilter,
    statusFilter,
    setStatusFilter,
    categoryOptions,

    // Loading & Core Items
    loading,
    filteredItems,
    paginatedItems,

    // Pagination
    currentPage,
    totalPages,
    visiblePageNumbers,
    handlePageChange,

    // Metrics & Side Panel lists
    totalItems,
    lowStockCount,
    expiringSoonCount,
    expiredCount,
    lowStockItems,
    expiringItems,

    // Details Modal State & Adjustments
    selectedItem,
    isModalEditing,
    setIsModalEditing,
    modalDraft,
    showConfirmSave,
    batches,
    batchLoading,
    batchEditStocks,
    showAddBatch,
    setShowAddBatch,
    newBatch,
    setNewBatch,
    batchSaving,

    // Actions & Selection Handlers
    handleSelectItem,
    handleModalClose,
    handleBatchStockChange,
    handleSaveBatchStock,
    handleAddBatchSubmit,
    handleDraftChange,
    handleRequestSave,
    handleConfirmSave,
    handleCancelSave,

    // Stock Out Form States & Actions
    showStockOutModal,
    setShowStockOutModal,
    stockOutForm,
    setStockOutForm,
    stockOutSaving,
    handleStockOutSubmit,

    // Add Product Modal States & Actions
    isAddModalOpen,
    setIsAddModalOpen,
    addProductType,
    setAddProductType,
    addForm,
    setAddForm,
    handleAddProductSubmit,

    navigate,
    loadData,
  };
}
