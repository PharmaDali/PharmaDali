import React, { useState, useEffect } from "react";
import Modal from "../../shared/components/Modal";

export function AddQuantityModal({
  isOpen,
  onClose,
  product,
  onAddToOrder,
}) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
    }
  }, [isOpen, product]);

  if (!product) return null;

  const stock = Number(product.stock) || 0;
  const price = Number(product.selling_price) || 0;
  const subtotal = quantity * price;

  const handleDecrement = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity((prev) => (stock > 0 ? Math.min(stock, prev + 1) : prev + 1));
  };

  const handleInputChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      setQuantity(1);
    } else if (stock > 0 && val > stock) {
      setQuantity(stock);
    } else {
      setQuantity(val);
    }
  };

  const handleConfirm = () => {
    if (onAddToOrder) {
      onAddToOrder(product, quantity);
    }
    onClose();
  };

  const genericName = product.product?.generic_name || product.product?.product_name || "Product";
  const brandName = product.product?.brand_name || "Generic";
  const details = [product.product?.strength, product.product?.form, product.product?.size].filter(Boolean).join(" ") || "---";

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="p-2 position-relative">
        <button
          type="button"
          className="btn btn-sm btn-light rounded-circle d-flex align-items-center justify-content-center border-0 text-secondary position-absolute"
          style={{ width: "28px", height: "28px", top: "2px", right: "2px" }}
          onClick={onClose}
          aria-label="Close modal"
        >
          <i className="fa-solid fa-xmark" style={{ fontSize: "14px" }} />
        </button>

        <div className="mb-2 pe-4">
          <h4 className="fw-semibold mb-1" style={{ color: "#444444", fontSize: "20px" }}>
            {genericName}
          </h4>
          <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
            {brandName}
          </p>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3 text-muted" style={{ fontSize: "14px" }}>
          <span>{details}</span>
          <span>
            <strong className="fw-semibold" style={{ color: "#444444", fontSize: "15px" }}>PHP {price.toFixed(2)}</strong> each
          </span>
        </div>

        <hr className="my-3" style={{ borderColor: "#e5e7eb" }} />

        <div className="mb-4">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="fw-semibold" style={{ color: "#444444", fontSize: "15px" }}>
              Enter Quantity
            </span>
            <span className="text-muted small">({stock} in stock)</span>
          </div>

          <div className="d-flex align-items-center justify-content-between gap-3">
            {/* Wider Stepper Input Form */}
            <div
              className="d-flex align-items-center p-2 rounded-3 flex-grow-1"
              style={{
                backgroundColor: "#eef6fb",
                border: "1px solid #bae6fd",
              }}
            >
              <button
                type="button"
                className="btn btn-sm d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #7dd3fc",
                  color: "#2aabe2",
                  fontSize: "20px",
                  fontWeight: 400,
                  lineHeight: "1",
                }}
                onClick={handleDecrement}
                disabled={quantity <= 1}
              >
                −
              </button>
              <input
                type="number"
                className="form-control form-control-sm text-center border-0 bg-transparent fw-semibold flex-grow-1"
                style={{ fontSize: "16px", color: "#444444", minWidth: "90px" }}
                value={quantity}
                onChange={handleInputChange}
                min={1}
                max={stock > 0 ? stock : undefined}
              />
              <button
                type="button"
                className="btn btn-sm d-flex align-items-center justify-content-center rounded-2 flex-shrink-0"
                style={{
                  width: "36px",
                  height: "36px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #7dd3fc",
                  color: "#2aabe2",
                  fontSize: "20px",
                  fontWeight: 400,
                  lineHeight: "1",
                }}
                onClick={handleIncrement}
                disabled={stock > 0 && quantity >= stock}
              >
                +
              </button>
            </div>

            {/* Subtotal Display */}
            <div className="text-end flex-shrink-0 ms-2">
              <div className="text-muted" style={{ fontSize: "12px" }}>
                Subtotal:
              </div>
              <strong className="fw-semibold" style={{ color: "#444444", fontSize: "16px" }}>
                PHP {subtotal.toFixed(2)}
              </strong>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn w-100 py-2 rounded-3 fw-semibold text-white shadow-sm"
          style={{ backgroundColor: "#2aabe2", borderColor: "#2aabe2", fontSize: "15px" }}
          onClick={handleConfirm}
        >
          Add to Order
        </button>
      </div>
    </Modal>
  );
}

export default AddQuantityModal;
