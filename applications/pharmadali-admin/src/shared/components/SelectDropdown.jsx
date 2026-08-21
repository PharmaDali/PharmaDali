import React, { useState, useRef, useEffect } from "react";
import "../../assets/css/inventory.css";

export function SelectDropdown({
  id = "select-dropdown",
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  containerClassName = "",
  selectClassName = "",
  disabled = false,
  ...restProps
}) {
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

  // Normalize options to { label, value } format
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "object" && opt !== null) {
      return { label: opt.label ?? String(opt.value), value: opt.value };
    }
    return { label: String(opt), value: opt };
  });

  // Find currently selected option object
  const selectedOption = normalizedOptions.find(
    (opt) => opt.value === value || opt.label === value
  );
  const displayLabel = selectedOption ? selectedOption.label : (value || placeholder);

  return (
    <div className={`inventory-field position-relative ${containerClassName}`.trim()} ref={dropdownRef}>
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
        } ${selectClassName}`.trim()}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-expanded={isOpen}
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
          userSelect: "none",
        }}
        {...restProps}
      >
        <span className="text-truncate me-2">{displayLabel}</span>
      </button>

      {isOpen && !disabled && (
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
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value || opt.label === value;
            return (
              <div
                key={String(opt.value)}
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
                  if (onChange) {
                    onChange(opt.value, opt);
                  }
                  setIsOpen(false);
                }}
              >
                <span className="text-truncate me-2">{opt.label}</span>
                {isSelected && (
                  <i className="fa-solid fa-check ms-2 flex-shrink-0" style={{ fontSize: "11px", color: "var(--pd-primary, #2aabe2)" }} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SelectDropdown;
