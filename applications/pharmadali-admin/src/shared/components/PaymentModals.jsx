import React from "react";
import Modal from "./Modal";
import shieldQuestionIcon from "../../assets/icons/modal-icons/shield_question.svg";
import errorIcon from "../../assets/icons/modal-icons/error.svg";
import successfulTaskIcon from "../../assets/icons/modal-icons/successful-task.svg";
import unsuccessfulTaskIcon from "../../assets/icons/modal-icons/unsuccessful-task.svg";

export function ReceivePaymentModal({
  isOpen,
  onClose,
  paymentMethod,
  orderTotal = 0,
  cashReceived = "",
  setCashReceived,
  gcashReference = "",
  setGcashReference,
  onConfirm,
  isProcessing = false,
}) {
  const safeOrderTotal = Number(orderTotal) && !Number.isNaN(Number(orderTotal)) ? Number(orderTotal) : 0;
  const cashNumeric = Number(cashReceived) && !Number.isNaN(Number(cashReceived)) ? Number(cashReceived) : 0;
  const changeAmount = cashNumeric - safeOrderTotal;
  const isCashValid = cashNumeric >= safeOrderTotal;
  const isGcashValid = /^\d{13,}$/.test((gcashReference || "").trim());
  const showCashError = paymentMethod === "cash" && String(cashReceived).trim() !== "" && !isCashValid;
  const cashShortage = showCashError ? Math.max(safeOrderTotal - cashNumeric, 0) : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Receive Payment"
      size="md"
      className="pos-payment-modal"
      footer={null}
    >
      <div className="pos-payment-meta">
        <span>{paymentMethod === "cash" ? "Cash" : "GCash"}</span>
        <span>
          Order Total: <strong>PHP {safeOrderTotal.toFixed(2)}</strong>
        </span>
      </div>

      {paymentMethod === "cash" ? (
        <>
          <label className="pos-payment-label" htmlFor="pos-cash-received">
            Enter Cash Received
          </label>
          <input
            id="pos-cash-received"
            type="number"
            min="0"
            step="0.01"
            className={`pos-payment-input ${showCashError ? "is-error" : ""}`.trim()}
            value={cashReceived}
            onChange={(event) => setCashReceived(event.target.value)}
          />
          {showCashError && (
            <div className="pos-payment-error" role="alert">
              <img src={errorIcon} alt="" className="pos-payment-error-icon" aria-hidden="true" />
              <span>Not enough payment. Please add PHP {cashShortage.toFixed(2)}.</span>
            </div>
          )}
          <div className="pos-payment-change">
            Change: <strong>PHP {Math.max(changeAmount, 0).toFixed(2)}</strong>
          </div>
        </>
      ) : (
        <>
          <label className="pos-cash-received" htmlFor="pos-cash-received">
            Enter Amount Received
          </label>
          <input
            id="pos-cash-received"
            type="number"
            inputMode="decimal"
            className={`pos-payment-input ${showCashError ? "is-error" : ""}`.trim()}
            value={cashReceived}
            onChange={(event) => setCashReceived(event.target.value)}
          />
          <label className="pos-payment-label" htmlFor="pos-gcash-reference">
            Enter GCash Reference No.
          </label>
          <input
            id="pos-gcash-reference"
            type="text"
            inputMode="numeric"
            className="pos-payment-input"
            value={gcashReference}
            onChange={(event) => setGcashReference(event.target.value.replace(/\D/g, ""))}
            placeholder="1234567891011"
          />
        </>
      )}

      <button
        type="button"
        className="pos-payment-confirm-btn"
        onClick={onConfirm}
        disabled={isProcessing || (paymentMethod === "cash" ? !isCashValid : !isGcashValid)}
      >
        {isProcessing ? "Processing..." : "Confirm"}
      </button>
    </Modal>
  );
}

export function ConfirmOrderModal({
  isOpen,
  onClose,
  onContinue,
  isProcessing = false,
  title = "Confirm this order?",
  message = "Please review the details before proceeding. This action cannot be undone.",
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      className="pos-confirm-modal"
    >
      <div className="pos-confirm-content">
        <img src={shieldQuestionIcon} alt="" className="pos-confirm-icon" aria-hidden="true" />
        <h3 className="pos-confirm-title fw-semibold" style={{ fontWeight: 600 }}>{title}</h3>
        <p className="pos-confirm-text">{message}</p>
        <div className="pos-confirm-actions">
          <button
            type="button"
            className="pos-confirm-primary"
            onClick={onContinue}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Continue"}
          </button>
          <button
            type="button"
            className="pos-confirm-secondary"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function PaymentResultModal({
  isOpen,
  onClose,
  result = "success",
  message,
}) {
  const isSuccess = result === "success";

  const heading = isSuccess ? "Transaction Completed" : "Transaction Failed";
  const defaultSubtext = isSuccess
    ? "The transaction has been successfully completed and recorded."
    : "The transaction could not be completed. Please review the order and try again.";
  const buttonText = isSuccess ? "Continue" : "Go back";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      className="pos-payment-result-modal"
    >
      <button
        type="button"
        className="pos-result-close"
        onClick={onClose}
        aria-label="Close payment result"
      >
        <i className="fa-solid fa-xmark" />
      </button>

      <div className="pos-result-content text-center py-2 px-3">
        <img
          src={isSuccess ? successfulTaskIcon : unsuccessfulTaskIcon}
          alt={heading}
          className="pos-result-icon mb-3"
          style={{ width: 80, height: 80 }}
        />
        <h4 className="pos-result-title fw-semibold mb-2" style={{ color: "#222", fontSize: 20, fontWeight: 600 }}>
          {heading}
        </h4>
        <p className="pos-result-text text-muted mb-4" style={{ fontSize: 13, color: "#666" }}>
          {message || defaultSubtext}
        </p>
        <button
          type="button"
          className="btn btn-primary w-100 py-2 rounded-3 fw-semibold"
          style={{ backgroundColor: "#2aabe2", borderColor: "#2aabe2", fontSize: 14 }}
          onClick={onClose}
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
}

export default {
  ReceivePaymentModal,
  ConfirmOrderModal,
  PaymentResultModal,
};
