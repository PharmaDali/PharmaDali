import React, { useState, useEffect, useRef } from "react";

export function DiscountSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { value: "none", label: "No Discount" },
    { value: "senior", label: "Senior Citizen" },
    { value: "pwd", label: "PWD (Person With Disability)" },
    { value: "employee", label: "Employee" },
    { value: "custom", label: "Custom Policy" },
  ];

  const selectedOption = options.find((o) => o.value === value) || options[0];

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
    <div className="position-relative w-100 mb-2" ref={dropdownRef}>
      <button
        type="button"
        className="form-select form-select-sm d-flex align-items-center justify-content-between text-start w-100"
        style={{
          fontSize: 12,
          borderRadius: "var(--pd-radius-md)",
          border: "1.5px solid #dde3ec",
          background: "#ffffff",
          color: "#334155",
          outline: "none",
          boxShadow: "none",
          cursor: "pointer",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedOption.label}</span>
      </button>

      {isOpen && (
        <div
          className="position-absolute w-100 shadow-sm rounded-2 overflow-hidden border"
          style={{
            top: "100%",
            left: 0,
            zIndex: 1050,
            background: "#ffffff",
            borderColor: "#dde3ec",
            marginTop: "4px",
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                className="px-3 py-2 d-flex align-items-center justify-content-between"
                style={{
                  fontSize: 12,
                  cursor: "pointer",
                  background: isSelected ? "#e8f0fe" : "transparent",
                  color: isSelected ? "#2aabe2" : "#334155",
                  fontWeight: isSelected ? 600 : 400,
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "#f1f5f9";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                }}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {isSelected && <i className="fa-solid fa-check" style={{ fontSize: 11, color: "#2aabe2" }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DiscountSelect;
