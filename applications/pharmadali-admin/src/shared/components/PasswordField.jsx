import { useState, forwardRef } from "react";
import "../../assets/css/password-field.css";

const PasswordField = forwardRef(function PasswordField(
  {
    value,
    onChange,
    placeholder = "Password",
    name = "password",
    id,
    className = "",
    inputClassName = "",
    containerClassName = "",
    error,
    disabled = false,
    required = false,
    autoComplete = "current-password",
    label,
    ...restProps
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const inputId = id || name;

  return (
    <div className={`w-100 ${containerClassName}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="form-label fw-medium small mb-1">
          {label}
        </label>
      )}
      <div className="position-relative d-flex align-items-center w-100">
        <input
          ref={ref}
          type={showPassword ? "text" : "password"}
          name={name}
          id={inputId}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={`form-control pd-password-input ${inputClassName} ${className} ${error ? "is-invalid" : ""}`.trim()}
          style={{ paddingRight: "2.75rem" }}
          {...restProps}
        />
        <button
          type="button"
          tabIndex={-1}
          className="btn btn-link text-secondary position-absolute end-0 top-50 translate-middle-y me-2 p-1 border-0 shadow-none d-flex align-items-center justify-content-center pd-password-toggle-btn"
          onClick={togglePasswordVisibility}
          disabled={disabled}
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          title={showPassword ? "Hide password" : "Show password"}
        >
          <i
            className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
            aria-hidden="true"
          />
        </button>
      </div>
      {error && <div className="invalid-feedback d-block small mt-1">{error}</div>}
    </div>
  );
});

export default PasswordField;
