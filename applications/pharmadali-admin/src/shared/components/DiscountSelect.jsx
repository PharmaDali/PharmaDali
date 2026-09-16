import React, { useState, useEffect } from "react";
import { fetchDiscounts } from "../../services/discountService";
import { SelectDropdown } from "./SelectDropdown";

export function DiscountSelect({ value, onChange, optionsList, selectClassName, style, disabled }) {
  const options = optionsList || [
    { value: "none", label: "Default", percentage: 0 },
    { value: "senior", label: "Senior Citizen (20%)", percentage: 20, requires_id_number: true },
    { value: "pwd", label: "PWD (20%)", percentage: 20, requires_id_number: true },
    { value: "employee", label: "Employee (10%)", percentage: 10, requires_id_number: true },
    { value: "custom", label: "Custom Policy", percentage: 0, requires_id_number: false },
  ];

  const handleSelect = (newValue) => {
    const selectedOpt = options.find((o) => o.value === newValue || o.label === newValue);
    const val = selectedOpt ? selectedOpt.value : newValue;
    if (onChange) onChange(val, selectedOpt);
  };

  return (
    <SelectDropdown
      id="discount-select-dropdown"
      value={value}
      onChange={handleSelect}
      options={options}
      placeholder="Default"
      disabled={disabled}
      selectClassName={selectClassName}
      style={{
        fontSize: "12px",
        borderRadius: "8px",
        backgroundColor: "#E3EBF3",
        border: "1px solid rgba(217, 217, 217, 0.45)",
        color: "#334155",
        padding: "6px 12px",
        boxShadow: "none",
        ...style,
      }}
    />
  );
}

const formatShortLabel = (d) => {
  let name = d.code || d.name || "";
  // Strip out long parenthetical expansions like (Person With Disability)
  name = name.replace(/\s*\([^)]*\)/g, "").replace(/Discount/gi, "").trim();
  return `${name} (${d.percentage}%)`;
};

export function DiscountControl({
  discountType,
  setDiscountType,
  discountPercentage,
  setDiscountPercentage,
  discountIdNumber,
  setDiscountIdNumber,
  className = "mb-3",
  disabled = false,
}) {
  const [fetchedDiscounts, setFetchedDiscounts] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      const res = await fetchDiscounts(false);
      if (res?.data && Array.isArray(res.data)) {
        setFetchedDiscounts(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch active discounts:", err);
    }
  };

  const discountOptions = [
    { value: "none", label: "Default", percentage: 0, requires_id_number: false },
    ...fetchedDiscounts.map((d) => ({
      value: (d.code || d.name).toLowerCase(),
      label: formatShortLabel(d),
      percentage: d.percentage,
      requires_id_number: d.requires_id_number,
    })),
    { value: "custom", label: "Custom Policy", percentage: 0, requires_id_number: false },
  ];

  const handleTypeChange = (newType, selectedOpt) => {
    if (disabled) return;
    setDiscountType(newType);

    if (newType === "none") {
      setDiscountPercentage("");
      setDiscountIdNumber("");
      return;
    }

    if (selectedOpt && selectedOpt.percentage !== undefined) {
      setDiscountPercentage(selectedOpt.percentage > 0 ? selectedOpt.percentage : "");
    }
  };

  return (
    <div
      className={`pos-discount-wrap p-3 rounded-4 ${className}`}
      style={{
        backgroundColor: disabled ? "#f8fafc" : "rgba(72, 170, 217, 0.16)",
        border: disabled ? "1px solid #e2e8f0" : "1px solid rgba(150, 210, 238, 0.2)",
        opacity: disabled ? 0.75 : 1,
        transition: "all 0.2s ease",
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div
          className="pos-discount-title fw-semibold"
          style={{ color: disabled ? "#64748b" : "#444444", fontSize: "14px" }}
        >
          Discount
        </div>
        {disabled && (
          <span
            className="badge rounded-pill fw-normal"
            style={{
              fontSize: "10px",
              backgroundColor: "#e2e8f0",
              color: "#64748b",
              padding: "3px 8px",
            }}
          >
            Order not discountable
          </span>
        )}
      </div>

      <div className="row g-2 align-items-end">
        <div className="col-6">
          <label
            style={{ fontSize: "11px", color: disabled ? "#94a3b8" : "#64748b" }}
            className="fw-semibold mb-1 d-block"
          >
            Type
          </label>
          <DiscountSelect
            value={disabled ? "none" : discountType}
            onChange={handleTypeChange}
            optionsList={discountOptions}
            disabled={disabled}
            style={{
              fontSize: "12px",
              borderRadius: "8px",
              backgroundColor: disabled ? "#f1f5f9" : "#E3EBF3",
              border: "1px solid rgba(217, 217, 217, 0.45)",
              color: disabled ? "#94a3b8" : "#334155",
              height: "36px",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          />
        </div>

        <div className="col-6">
          <label
            style={{ fontSize: "11px", color: disabled ? "#94a3b8" : "#64748b" }}
            className="fw-semibold mb-1 d-block"
          >
            ID No. (Optional)
          </label>
          <input
            type="text"
            className="form-control form-control-sm"
            disabled={disabled}
            style={{
              fontSize: "12px",
              borderRadius: "8px",
              backgroundColor: disabled ? "#f1f5f9" : (isFocused || discountIdNumber ? "#ffffff" : "#E3EBF3"),
              border: isFocused && !disabled ? "1.5px solid #96D2EE" : "1px solid rgba(217, 217, 217, 0.45)",
              color: disabled ? "#94a3b8" : "#334155",
              height: "36px",
              boxShadow: "none",
              cursor: disabled ? "not-allowed" : "text",
              transition: "all 0.2s ease",
            }}
            placeholder={disabled ? "N/A" : "Enter ID number"}
            value={disabled ? "" : discountIdNumber}
            onFocus={() => !disabled && setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => !disabled && setDiscountIdNumber(e.target.value)}
          />
        </div>
      </div>

      {!disabled && discountType === "custom" && (
        <div className="mt-2" style={{ maxWidth: "50%" }}>
          <label style={{ fontSize: "11px", color: "#64748b" }} className="fw-semibold mb-1 d-block">
            Custom Rate (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            className="form-control form-control-sm hide-spin-button"
            style={{
              fontSize: "12px",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              border: "1.5px solid #c8dcf0",
              height: "34px",
              boxShadow: "none",
            }}
            placeholder="%"
            value={discountPercentage}
            onChange={(e) => setDiscountPercentage(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

export default DiscountSelect;
