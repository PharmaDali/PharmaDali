import React from "react";
import { usePosContext } from "../../context/PosContext";
import { toTitleCase } from "../../utils/stringUtils";

export default function PosProductTable() {
  const {
    products,
    selectedProduct,
    handleSelectProduct,
    handleScroll,
    loadingMore,
  } = usePosContext();

  const getGenericName = (product) => {
    if (!product) return "---";
    return toTitleCase(product.generic_name || product.product_name || "---");
  };

  const getBrandName = (product) => {
    if (!product) return "Generic";
    return toTitleCase(product.brand_name || "Generic");
  };

  const getStrength = (product) => {
    if (!product) return "---";
    const parts = [product.strength, product.form, product.size].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "---";
  };

  return (
    <div
      className="pos-product-table-scroll pos-scroll"
      onScroll={handleScroll}
      style={{
        flex: 1,
        minHeight: 0,
        overflowX: "auto",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <table
        className="table table-hover mb-0 align-middle"
        style={{
          fontSize: 13,
          minWidth: "520px",
          width: "100%",
          tableLayout: "fixed",
        }}
      >
        <colgroup>
          <col style={{ width: "26%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "24%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "14%" }} />
        </colgroup>
        <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
          <tr style={{ background: "#96D2EE" }}>
            <th
              className="px-3 py-2 fw-semibold border-0 text-start text-nowrap"
              style={{
                color: "var(--pd-text-dark, #334155)",
                background: "#96D2EE",
                whiteSpace: "nowrap",
              }}
            >
              Generic Name
            </th>
            <th
              className="px-3 py-2 fw-semibold border-0 text-start text-nowrap"
              style={{
                color: "var(--pd-text-dark, #334155)",
                background: "#96D2EE",
                whiteSpace: "nowrap",
              }}
            >
              Brand Name
            </th>
            <th
              className="px-3 py-2 fw-semibold border-0 text-start text-nowrap"
              style={{
                color: "var(--pd-text-dark, #334155)",
                background: "#96D2EE",
                whiteSpace: "nowrap",
              }}
            >
              Strength
            </th>
            <th
              className="px-3 py-2 fw-semibold border-0 text-end text-nowrap"
              style={{
                color: "var(--pd-text-dark, #334155)",
                background: "#96D2EE",
                whiteSpace: "nowrap",
              }}
            >
              Price (PHP)
            </th>
            <th
              className="px-3 py-2 fw-semibold border-0 text-center text-nowrap"
              style={{
                color: "var(--pd-text-dark, #334155)",
                background: "#96D2EE",
                whiteSpace: "nowrap",
              }}
            >
              Stocks
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((item) => {
            const isSelected = selectedProduct?.id === item.id;
            return (
              <tr
                key={item.id}
                className="pos-row"
                onClick={() => handleSelectProduct(item)}
                style={{
                  cursor: "pointer",
                  background: isSelected ? "#d9d9d9" : "transparent",
                  transition: "background-color 0.15s ease",
                }}
              >
                <td
                  className="px-3 py-3 border-0 border-bottom text-start text-truncate"
                  style={{ color: "var(--pd-soft-black, #334155)", fontWeight: 500 }}
                >
                  {getGenericName(item.product)}
                </td>
                <td
                  className="px-3 py-3 border-0 border-bottom text-start text-truncate"
                  style={{ color: "var(--pd-soft-black, #334155)" }}
                >
                  {getBrandName(item.product)}
                </td>
                <td
                  className="px-3 py-3 border-0 border-bottom text-start text-truncate"
                  style={{ color: "var(--pd-soft-black, #334155)" }}
                >
                  {getStrength(item.product)}
                </td>
                <td
                  className="px-3 py-3 border-0 border-bottom text-end text-nowrap"
                  style={{ color: "var(--pd-soft-black, #334155)", whiteSpace: "nowrap" }}
                >
                  {parseFloat(item.selling_price).toFixed(2)}
                </td>
                <td
                  className="px-3 py-3 border-0 border-bottom text-center text-nowrap"
                  style={{ color: "var(--pd-soft-black, #334155)", whiteSpace: "nowrap" }}
                >
                  {item.stock}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {loadingMore && (
        <div className="text-center py-2" style={{ fontSize: 12, color: "#888" }}>
          Loading more products...
        </div>
      )}
    </div>
  );
}
