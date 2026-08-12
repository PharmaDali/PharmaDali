import React, { useState, useRef, useEffect } from "react";
import {
  PRICE_FILTERS,
  STOCK_FILTERS,
  STATUS_FILTERS,
} from "../inventoryConstants";

function InventoryThemedSelect({ id, label, value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="inventory-field position-relative" ref={dropdownRef}>
      {label && (
        <label className="inventory-field-label" htmlFor={id}>
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        className={`form-select inventory-select d-flex align-items-center justify-content-between text-start w-100 ${
          isOpen ? "inventory-select-open" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <span className="text-truncate me-2">{value}</span>
      </button>

      {isOpen && (
        <div
          className="inventory-dropdown-popover position-absolute w-100 border"
          style={{
            top: "calc(100% + 4px)",
            left: 0,
            zIndex: 1050,
            background: "#ffffff",
            borderColor: "#d6e6fb",
            padding: "6px",
            maxHeight: "220px",
            overflowY: "auto",
            borderRadius: "var(--pd-radius-md, 10px)",
            boxShadow: "0 10px 25px rgba(15, 23, 42, 0.12)",
          }}
        >
          {options.map((option) => {
            const isSelected = option === value;
            return (
              <div
                key={option}
                className="inventory-dropdown-item px-3 py-2 d-flex align-items-center justify-content-between mb-1"
                style={{
                  fontSize: "13px",
                  cursor: "pointer",
                  background: isSelected ? "#e8f0fe" : "transparent",
                  color: isSelected ? "var(--pd-primary, #2aabe2)" : "#334155",
                  fontWeight: isSelected ? 600 : 500,
                  transition: "all 0.15s ease",
                  borderRadius: "6px",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                }}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                <span>{option}</span>
                {isSelected && (
                  <i className="fa-solid fa-check ms-2" style={{ fontSize: "11px", color: "var(--pd-primary, #2aabe2)" }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function InventoryFilterBar({
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
  loadData,
}) {
  return (
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

      <InventoryThemedSelect
        id="inventory-category"
        label="Category"
        value={categoryFilter}
        onChange={setCategoryFilter}
        options={categoryOptions}
      />

      <InventoryThemedSelect
        id="inventory-price"
        label="Price"
        value={priceFilter}
        onChange={setPriceFilter}
        options={PRICE_FILTERS}
      />

      <InventoryThemedSelect
        id="inventory-stocks"
        label="Stocks"
        value={stockFilter}
        onChange={setStockFilter}
        options={STOCK_FILTERS}
      />

      <InventoryThemedSelect
        id="inventory-status"
        label="Status"
        value={statusFilter}
        onChange={setStatusFilter}
        options={STATUS_FILTERS}
      />

      <div className="inventory-field inventory-search-action">
        <button type="button" className="btn inventory-search-btn" onClick={loadData}>
          Search
        </button>
      </div>
    </div>
  );
}

export default InventoryFilterBar;
