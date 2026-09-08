import React, { forwardRef } from "react";

const CustomDatePicker = forwardRef(({
  id,
  className = "",
  value,
  onChange,
  isExpirationDate = false,
  disabled = false,
  style = {},
  max,
  min,
  ...props
}, ref) => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  const maxDate = isExpirationDate ? max : (max || todayStr);
  const minDate = min;

  return (
    <input
      id={id}
      ref={ref}
      type="date"
      className={`custom-date-picker ${className}`}
      value={value || ""}
      onChange={onChange}
      max={maxDate}
      min={minDate}
      disabled={disabled}
      style={style}
      {...props}
    />
  );
});

export default CustomDatePicker;
