import React from "react";
import {
  PRICE_FILTERS,
  STOCK_FILTERS,
  STATUS_FILTERS,
} from "../../constants/inventoryConstants";
import SearchBar from "../../shared/components/SearchBar";
import SelectDropdown from "../../shared/components/SelectDropdown";

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
  onReset,
}) {
  const isFiltered =
    query !== "" ||
    categoryFilter !== "All" ||
    priceFilter !== "All" ||
    stockFilter !== "All" ||
    statusFilter !== "All";

  return (
    <div className="inventory-filter-bar">
      <SearchBar
        id="inventory-search"
        label="Search by product name"
        value={query}
        onChange={(val) => setQuery(val)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            loadData();
          }
        }}
        placeholder="Search by product name"
      />

      <SelectDropdown
        id="inventory-category"
        label="Category"
        value={categoryFilter}
        onChange={setCategoryFilter}
        options={categoryOptions}
      />

      <SelectDropdown
        id="inventory-price"
        label="Price"
        value={priceFilter}
        onChange={setPriceFilter}
        options={PRICE_FILTERS}
      />

      <SelectDropdown
        id="inventory-stocks"
        label="Stocks"
        value={stockFilter}
        onChange={setStockFilter}
        options={STOCK_FILTERS}
      />

      <SelectDropdown
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
        {isFiltered && (
          <button
            type="button"
            className="btn inventory-reset-btn"
            onClick={onReset}
            title="Reset all filters"
          >
            <i className="fa-solid fa-xmark me-1" aria-hidden="true" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

export default InventoryFilterBar;
