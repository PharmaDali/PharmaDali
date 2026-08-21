import React from "react";

export function PaymentMethodSelect({
  paymentMethod,
  setPaymentMethod,
  className = "mb-3",
  title = "Select Payment Method",
}) {
  const methods = [
    { id: "cash", label: "Cash"},
    { id: "gcash", label: "GCash"},
  ];

  return (
    <div className={`p-3 rounded-3 border border-light-subtle ${className}`} style={{ backgroundColor: "#e8f0fe" }}>
      {title && (
        <label className="form-label text-muted small fw-semibold mb-2 d-block">
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
              className={`btn flex-fill py-2 fw-semibold rounded-3 d-flex align-items-center justify-content-center gap-2 ${
                isSelected ? "text-white" : "text-dark bg-white border-0"
              }`}
              style={{
                fontSize: 13,
                backgroundColor: isSelected ? "#2aabe2" : "#ffffff",
                boxShadow: !isSelected ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.15s ease",
              }}
              onClick={() => setPaymentMethod(m.id)}
            >
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default PaymentMethodSelect;
