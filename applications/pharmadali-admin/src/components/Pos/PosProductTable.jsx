import React from "react";
import { usePosContext } from "../../context/PosContext";
import { toTitleCase } from "../../utils/stringUtils";

const COL_WIDTHS = ["25%", "20%", "25%", "15%", "15%"];

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
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <div className="rounded-top-3 overflow-hidden" style={{ background: "#48AAD9" }}>
        <table className="table mb-0 align-middle" style={{ fontSize: 13, tableLayout: "fixed" }}>
          <colgroup>
            {COL_WIDTHS.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
          <thead>
            <tr style={{ background: "#96D2EE" }}>
              <th className="px-3 py-2 fw-semibold border-0 text-start" style={{ color: "var(--pd-text-dark, #334155)", background: "#96D2EE" }}>
                Generic Name
              </th>
              <th className="px-3 py-2 fw-semibold border-0 text-start" style={{ color: "var(--pd-text-dark, #334155)", background: "#96D2EE" }}>
                Brand Name
              </th>
              <th className="px-3 py-2 fw-semibold border-0 text-start" style={{ color: "var(--pd-text-dark, #334155)", background: "#96D2EE" }}>
                Strength
              </th>
              <th className="px-3 py-2 fw-semibold border-0 text-end" style={{ color: "var(--pd-text-dark, #334155)", background: "#96D2EE" }}>
                Price (PHP)
              </th>
              <th className="px-3 py-2 fw-semibold border-0 text-center" style={{ color: "var(--pd-text-dark, #334155)", background: "#96D2EE" }}>
                Stocks
              </th>
            </tr>
          </thead>
        </table>
      </div>

      <div className="pos-scroll" onScroll={handleScroll} style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <table className="table table-hover mb-0" style={{ fontSize: 13, tableLayout: "fixed" }}>
          <colgroup>
            {COL_WIDTHS.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
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
                  <td className="px-3 py-3 border-0 border-bottom text-start" style={{ color: "var(--pd-soft-black, #334155)", fontWeight: 500 }}>
                    {getGenericName(item.product)}
                  </td>
                  <td className="px-3 py-3 border-0 border-bottom text-start" style={{ color: "var(--pd-soft-black, #334155)" }}>
                    {getBrandName(item.product)}
                  </td>
                  <td className="px-3 py-3 border-0 border-bottom text-start" style={{ color: "var(--pd-soft-black, #334155)" }}>
                    {getStrength(item.product)}
                  </td>
                  <td className="px-3 py-3 border-0 border-bottom text-end" style={{ color: "var(--pd-soft-black, #334155)" }}>
                    {parseFloat(item.selling_price).toFixed(2)}
                  </td>
                  <td className="px-3 py-3 border-0 border-bottom text-center" style={{ color: "var(--pd-soft-black, #334155)" }}>
                    {item.stock}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {loadingMore && <div className="text-center py-2" style={{ fontSize: 12, color: "#888" }}>Loading more products...</div>}
      </div>
    </div>
  );
}
