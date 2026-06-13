import React, { useRef, useEffect, useState } from "react";

export function FormattedDateInput({
  value, // YYYY-MM-DD format (or empty)
  onChange, // callback function when date changes (sends YYYY-MM-DD)
  className,
  placeholder = "mm/dd/yyyy",
  disabled = false,
  style = {},
}) {
  const [textValue, setTextValue] = useState("");
  const dateInputRef = useRef(null);

  // Helper: Convert YYYY-MM-DD -> MM/DD/YYYY
  const toDisplayFormat = (val) => {
    if (!val) return "";
    const parts = val.split("-");
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}/${parts[0]}`; // MM/DD/YYYY
    }
    return val;
  };

  // Helper: Convert MM/DD/YYYY -> YYYY-MM-DD
  const toDatabaseFormat = (val) => {
    if (!val) return "";
    const parts = val.split("/");
    if (parts.length === 3) {
      const month = parts[0].padStart(2, "0");
      const day = parts[1].padStart(2, "0");
      const year = parts[2];
      if (year.length === 4 && !isNaN(month) && !isNaN(day) && !isNaN(year)) {
        const mNum = parseInt(month, 10);
        const dNum = parseInt(day, 10);
        const yNum = parseInt(year, 10);
        // Basic range check
        if (mNum >= 1 && mNum <= 12 && dNum >= 1 && dNum <= 31 && yNum >= 1900 && yNum <= 2100) {
          return `${year}-${month}-${day}`;
        }
      }
    }
    return "";
  };

  // Update text display whenever value prop changes
  useEffect(() => {
    setTextValue(toDisplayFormat(value));
  }, [value]);

  // Handle direct text field input & auto-format
  const handleTextChange = (e) => {
    let input = e.target.value;

    // Keep only numbers and forward slashes
    input = input.replace(/[^0-9/]/g, "");

    const clean = input.replace(/\//g, "");
    let formatted = input;
    if (clean.length > 2 && clean.length <= 4) {
      formatted = `${clean.slice(0, 2)}/${clean.slice(2)}`;
    } else if (clean.length > 4) {
      formatted = `${clean.slice(0, 2)}/${clean.slice(2, 4)}/${clean.slice(4, 8)}`;
    }

    setTextValue(formatted);

    // If we have a fully valid date, propagate update. If empty, clear it.
    const dbFormat = toDatabaseFormat(formatted);
    if (dbFormat) {
      onChange(dbFormat);
    } else if (formatted === "") {
      onChange("");
    }
  };

  // Handle native calendar selection
  const handleDateChange = (e) => {
    const dbValue = e.target.value; // YYYY-MM-DD
    onChange(dbValue);
    setTextValue(toDisplayFormat(dbValue));
  };

  // Trigger showPicker on target click
  const handleIconClick = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (dateInputRef.current) {
      try {
        dateInputRef.current.showPicker();
      } catch (err) {
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <input
        type="text"
        className={className}
        placeholder={placeholder}
        style={{ ...style, paddingRight: "2.5rem" }}
        value={textValue}
        onChange={handleTextChange}
        disabled={disabled}
        maxLength={10}
      />
      <input
        type="date"
        ref={dateInputRef}
        value={value || ""}
        onChange={handleDateChange}
        disabled={disabled}
        style={{
          position: "absolute",
          right: "0",
          top: "0",
          width: "40px",
          height: "100%",
          opacity: 0,
          cursor: disabled ? "not-allowed" : "pointer",
          border: "none",
          padding: 0,
          margin: 0,
          zIndex: 2,
        }}
      />
      <i
        className="fa-regular fa-calendar"
        onClick={handleIconClick}
        style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#48aad9",
          pointerEvents: "none",
          zIndex: 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      />
    </div>
  );
}

export default FormattedDateInput;
