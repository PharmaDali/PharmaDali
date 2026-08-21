import React from "react";
import "../../assets/css/inventory.css";

export function SearchBar({
  id = "search-input",
  label,
  value = "",
  onChange,
  onKeyDown,
  placeholder = "Search...",
  containerClassName = "",
  inputClassName = "",
  iconClass = "fa-solid fa-magnifying-glass",
  showButton = false,
  buttonText = "Search",
  onButtonClick,
  disabled = false,
  ...restProps
}) {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  return (
    <div className={`inventory-field inventory-search-field ${containerClassName}`.trim()}>
      {label && (
        <label className="inventory-field-label" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="d-flex gap-2 align-items-center w-100">
        <div className="inventory-input-wrap flex-fill">
          {iconClass && <i className={iconClass} aria-hidden="true" />}
          <input
            id={id}
            type="text"
            className={`form-control inventory-input ${inputClassName}`.trim()}
            value={value}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            aria-label={label || placeholder}
            {...restProps}
          />
        </div>
        {showButton && (
          <button
            type="button"
            className="btn inventory-search-btn text-nowrap"
            onClick={onButtonClick}
            disabled={disabled}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchBar;
