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
import { toNumber } from "../../../utils/inventoryUtils";

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
  const [productUpdating, setProductUpdating] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // Batch Management States
  const [batches, setBatches] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchSaving, setBatchSaving] = useState(false);
  const [batchEditStocks, setBatchEditStocks] = useState({});
  const [batchEditDates, setBatchEditDates] = useState({});
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [newBatch, setNewBatch] = useState({
    batch_number: "",
    stock: "",
    expiry_date: "",
    manufactured_date: "",
  });

  // Success Modal State
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  // Error Modal State
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  // Input Field Errors
  const [inputErrors, setInputErrors] = useState({});

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
    form: "",
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
    setBatchEditDates({});
    setModalDraft({
      name: item.name,
      brand: item.brand,
      category: item.category,
      form: item.raw_form,
      dosage: item.strength,
      size: item.size,
      id: item.id,
      sellingPrice: item.sellingPrice,
      reorderPoint: item.reorderPoint,
      quantity: item.quantity,
      expiryDate: item.expiryDate || "",
      manufacturedDate: item.manufacturedDate || "",
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
    setBatchEditDates({});
    setShowAddBatch(false);
    setNewBatch({
      batch_number: "",
      stock: "",
      expiry_date: "",
      manufactured_date: "",
    });
    setInputErrors({});
  };

  // Inline batch adjustments
  const handleBatchStockChange = (batchId, value) => {
    setBatchEditStocks((prev) => ({ ...prev, [batchId]: value }));
  };

  const handleBatchDateChange = (batchId, field, value) => {
    setBatchEditDates((prev) => ({
      ...prev,
      [batchId]: {
        ...(prev[batchId] || {}),
        [field]: value
      }
    }));
  };

  const hasBatchChanges = useMemo(() => {
    return batches.some((b) => {
      if (b.isDraft) return false;
      const editedVal = batchEditStocks[b.id];
      const parsedEdited = editedVal !== undefined && editedVal !== "" ? parseInt(editedVal, 10) : parseInt(b.stock, 10);
      const parsedOrig = parseInt(b.stock, 10);
      
      const stockChanged = !isNaN(parsedEdited) && parsedEdited !== parsedOrig && parsedEdited >= 0;
      
      const editedDates = batchEditDates[b.id] || {};
      const expChanged = editedDates.expiry_date !== undefined && editedDates.expiry_date !== b.expiry_date;
      const mfgChanged = editedDates.manufactured_date !== undefined && editedDates.manufactured_date !== b.manufactured_date;
      
      return stockChanged || expChanged || mfgChanged;
    });
  }, [batches, batchEditStocks, batchEditDates]);

  const handleSaveAllBatches = async () => {
    const draftBatches = batches.filter(b => b.isDraft);
    const changedBatches = batches.filter((b) => {
      if (b.isDraft) return false;
      const editedVal = batchEditStocks[b.id];
      const parsedEdited = editedVal !== undefined && editedVal !== "" ? parseInt(editedVal, 10) : parseInt(b.stock, 10);
      const stockChanged = !isNaN(parsedEdited) && parsedEdited !== parseInt(b.stock, 10) && parsedEdited >= 0;
      
      const editedDates = batchEditDates[b.id] || {};
      const expChanged = editedDates.expiry_date !== undefined && editedDates.expiry_date !== b.expiry_date;
      const mfgChanged = editedDates.manufactured_date !== undefined && editedDates.manufactured_date !== b.manufactured_date;
      
      return stockChanged || expChanged || mfgChanged;
    });

    if (changedBatches.length === 0 && draftBatches.length === 0) return;

    setBatchSaving(true);
    try {
      // 1. Save draft batches
      for (const draftBatch of draftBatches) {
        const finalStock = parseInt(batchEditStocks[draftBatch.id] ?? draftBatch.stock, 10);
        if (!isNaN(finalStock) && finalStock >= 0) {
          await addProductBatch(selectedItem.id, {
            batch_number: draftBatch.batch_number || null,
            stock: finalStock,
            expiry_date: draftBatch.expiry_date || null,
            manufactured_date: draftBatch.manufactured_date || null,
          });
        }
      }

      // 2. Update existing batches
      await Promise.all(
        changedBatches.map(async (batch) => {
          const editedVal = batchEditStocks[batch.id];
          const newStock = editedVal !== undefined && editedVal !== "" ? parseInt(editedVal, 10) : parseInt(batch.stock, 10);
          
          const payload = { stock: newStock };
          
          const editedDates = batchEditDates[batch.id] || {};
          if (editedDates.expiry_date !== undefined) {
            payload.expiry_date = editedDates.expiry_date;
          }
          if (editedDates.manufactured_date !== undefined) {
            payload.manufactured_date = editedDates.manufactured_date;
          }
          
          await updateProductBatch(batch.id, payload);
        })
      );

      await loadData();
      
      setSuccessModal({
        isOpen: true,
        title: "Batches Updated",
        message: "Stock changes have been saved successfully.",
      });
    } catch (err) {
      console.error("Failed to update batch stocks:", err);
      setErrorModal({
        isOpen: true,
        title: "Update Failed",
        message: "Failed to update batch stocks. Please try again."
      });
    } finally {
      setBatchSaving(false);
    }
  };

  const handleAddBatchSubmit = async (e) => {
    e.preventDefault();
    setInputErrors({});
    if (!selectedItem) return;
    const stock = parseInt(newBatch.stock, 10);
    if (isNaN(stock) || stock < 0) {
      setInputErrors({ newBatchStock: "Please enter a valid stock quantity." });
      return;
    }
    
    let errors = {};
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (newBatch.manufactured_date) {
      const mDate = new Date(newBatch.manufactured_date);
      mDate.setHours(0,0,0,0);
      if (mDate > today) {
        errors.newBatchManufacturedDate = "Manufactured date cannot be in the future.";
      }
    }
    
    if (newBatch.expiry_date) {
      const eDate = new Date(newBatch.expiry_date);
      eDate.setHours(0,0,0,0);
      if (eDate < today) {
        errors.newBatchExpiryDate = "Expiry date cannot be in the past.";
      }
    }

    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      return;
    }
    
    const draftId = `draft-${Date.now()}`;
    const created = {
      id: draftId,
      batch_number: newBatch.batch_number || "",
      stock,
      expiry_date: newBatch.expiry_date || null,
      manufactured_date: newBatch.manufactured_date || null,
      status: "Draft",
      isDraft: true,
    };
    
    setBatches((prev) => [...prev, created]);
    setBatchEditStocks((prev) => ({ ...prev, [draftId]: stock }));
    
    setNewBatch({
      batch_number: "",
      stock: "",
      expiry_date: "",
      manufactured_date: "",
    });
    setShowAddBatch(false);
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
    setInputErrors({});
    if (!selectedItem) return;
    const qty = parseInt(stockOutForm.quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setInputErrors({ stockOutQuantity: "Please enter a valid quantity to deduct." });
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
      
      setSuccessModal({
        isOpen: true,
        title: "Stock Out Successful",
        message: `Successfully deducted ${qty} unit(s) from inventory.`,
      });
    } catch (err) {
      console.error("Stock-out failed:", err);
      setErrorModal({
        isOpen: true,
        title: "Stock Out Failed",
        message: err.response?.data?.message || "Stock out failed. Please try again."
      });
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
    
    setInputErrors({});
    let errors = {};
    
    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      setShowConfirmSave(false);
      return;
    }

    setProductUpdating(true);
    try {
      const isMedicine = selectedItem.product_type === "medicine";
      
      const payload = {
        product_type: selectedItem.product_type,
        product_name: modalDraft.name.trim() || selectedItem.name,
        generic_name: isMedicine ? (modalDraft.name.trim() || selectedItem.name) : null,
        brand_name: isMedicine ? (modalDraft.brand?.trim() || selectedItem.brand) : null,
        form: isMedicine ? (modalDraft.form?.trim() || selectedItem.raw_form) : null,
        strength: isMedicine ? (modalDraft.dosage?.trim() || selectedItem.strength) : null,
        size: modalDraft.size?.trim() || selectedItem.size,
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
        raw_form: payload.form,
        size: payload.size,
        strength: payload.strength,
        sellingPrice: payload.selling_price,
      };

      setInventoryItems((prev) =>
        prev.map((item) => (item.id === selectedItem.id ? updatedItem : item))
      );
      setSelectedItem(updatedItem);
      setIsModalEditing(false);
      
      // Reload metrics & lists
      await loadData();
      
      // Save batches if there are changes
      const hasBatchChanges =
        batches.some((b) => b.isDraft) ||
        Object.keys(batchEditStocks).some(
          (id) => batchEditStocks[id] !== undefined && batchEditStocks[id] !== batches.find((b) => b.id === id)?.stock
        );
        
      if (hasBatchChanges) {
        await handleSaveAllBatches();
      } else {
        setSuccessModal({
          isOpen: true,
          title: "Product Updated",
          message: "The product details were successfully updated.",
        });
      }

      // Close the details modal (shrink modal)
      handleModalClose();
    } catch (err) {
      console.error("Failed to save product details:", err);
      setErrorModal({
        isOpen: true,
        title: "Update Failed",
        message: err.response?.data?.message || "Failed to update product details. Please try again."
      });
    } finally {
      setProductUpdating(false);
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

    const payload = {
      product_type: addProductType,
      generic_name: isMedicine ? addForm.genericName : null,
      brand_name: isMedicine ? addForm.brandName : null,
      product_name: isMedicine ? addForm.genericName : addForm.productName,
      form: isMedicine ? addForm.form : null,
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

    let errors = {};
    if (isMedicine && !addForm.genericName) {
      errors.genericName = "Generic Name is required for medicine.";
    }
    if (!isMedicine && !addForm.productName) {
      errors.productName = "Product Name is required.";
    }
    if (
      !isMedicine &&
      (!addForm.categoryName ||
        addForm.categoryName === "All" ||
        addForm.categoryName === "category")
    ) {
      errors.categoryName = "Please select a valid Category.";
    }

    if (Object.keys(errors).length > 0) {
      setInputErrors(errors);
      return;
    }

    try {
      await createInventoryProduct(payload);
      setAddForm({
        genericName: "",
        brandName: "",
        form: "",
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
      setSuccessModal({
        isOpen: true,
        title: "Product Added",
        message: "The new product was successfully added to inventory."
      });
      loadData();
    } catch (err) {
      console.error("Failed to create product:", err);
      if (err.response?.status === 422 && err.response?.data?.errors) {
        // Assume backend returns field errors mapped by field name
        const backendErrors = err.response.data.errors;
        let formattedErrors = {};
        for (const key in backendErrors) {
          // just taking the first error message for each field
          formattedErrors[key] = backendErrors[key][0];
        }
        setInputErrors(formattedErrors);
      } else {
        setErrorModal({
          isOpen: true,
          title: "Creation Failed",
          message: err.response?.data?.message || "Failed to create product. Please check your inputs."
        });
      }
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
    productUpdating,
    batches,
    batchLoading,
    batchEditStocks,
    handleBatchStockChange,
    handleSaveAllBatches,
    hasBatchChanges,
    batchSaving,
    showAddBatch,
    setShowAddBatch,
    newBatch,
    setNewBatch,

    // Actions & Selection Handlers
    handleSelectItem,
    handleModalClose,
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

    successModal,
    setSuccessModal,
    errorModal,
    setErrorModal,
    inputErrors,
    setInputErrors,

    navigate,
    loadData,
  };
}
