import React from "react";

export function PaymentMethodSelect({
  paymentMethod,
  setPaymentMethod,
  onSelectPaymentMethod,
  error,
  disabled = false,
  className = "mb-3",
  title = "Select Payment Method",
}) {
  const methods = [
    { id: "cash", label: "Cash" },
    { id: "gcash", label: "GCash" },
  ];

  const handleClick = (methodId) => {
    if (disabled) return;
    setPaymentMethod(methodId);
    if (onSelectPaymentMethod) {
      onSelectPaymentMethod(methodId);
    }
  };

  return (
    <div
      className={`p-3 rounded-4 ${className}`}
      style={{
        backgroundColor: "rgba(72, 170, 217, 0.16)",
        border: error && !disabled ? "1.5px solid #ef4444" : "1px solid rgba(150, 210, 238, 0.12)",
        opacity: disabled ? 0.6 : 1,
        transition: "opacity 0.2s ease",
      }}
    >
      {title && (
        <label className="form-label text-muted small fw-semibold mb-2 d-block" style={{ color: "#444444" }}>
          {title}
        </label>
      )}
      <div className="d-flex gap-2">
        {methods.map((m) => {
          const isSelected = paymentMethod === m.id;
          return (
            <button
              key={m.id}
              type="button"
              disabled={disabled}
              className="btn flex-fill py-2 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-2"
              style={{
                fontSize: 13,
                backgroundColor: isSelected ? "#2aabe2" : "#f4f8fd",
                color: isSelected ? "#ffffff" : (disabled ? "#94a3b8" : "#2aabe2"),
                border: isSelected ? "1.5px solid #2aabe2" : (disabled ? "1.5px solid #cbd5e1" : "1.5px solid #48aad9"),
                boxShadow: "none",
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.15s ease",
              }}
              onClick={() => handleClick(m.id)}
            >
              {m.label}
            </button>
          );
        })}
      </div>
      {error && !disabled && (
        <div className="text-danger small mt-2 d-flex align-items-center gap-1" style={{ fontSize: 11, fontWeight: 500 }}>
          <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 11 }} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default PaymentMethodSelect;
