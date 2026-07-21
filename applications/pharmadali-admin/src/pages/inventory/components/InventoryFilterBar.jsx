import React from "react";
import {
  PRICE_FILTERS,
  STOCK_FILTERS,
  STATUS_FILTERS,
} from "../inventoryConstants";

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
  );
}

export default InventoryFilterBar;
