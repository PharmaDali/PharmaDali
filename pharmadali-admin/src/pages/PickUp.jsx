import { useState } from "react";
import Modal from "../components/Modal";
import successfulTaskIcon from "../assets/icons/modal-icons/successful-task.svg";
import unsuccessfulTaskIcon from "../assets/icons/modal-icons/unsuccessful-task.svg";
import errorIcon from "../assets/icons/modal-icons/error.svg";
import shieldQuestionIcon from "../assets/icons/modal-icons/shield-question.svg";
import "../assets/css/pospage.css";

const SAMPLE_ORDERS = [
  {
    id: "ORD-1025",
    customer: "Denmar Redondo",
    contact: "09123451234",
    items: 2,
    total: "PHP 108.00",
    status: "Ready",
    orderDetails: ["Cetirizine | box x 1", "Bioflu | box x 1"],
  },
  {
    id: "ORD-1026",
    customer: "James Orlanes",
    contact: "09129112233",
    items: 10,
    total: "PHP 908.00",
    status: "Ready",
    orderDetails: ["Paracetamol | box x 2", "Amoxicillin | box x 8"],
  },
  {
    id: "ORD-1027",
    customer: "James Mercado",
    contact: "09134561234",
    items: 8,
    total: "PHP 1108.00",
    status: "Ready",
    orderDetails: ["Vitamin C | box x 3", "Loperamide | box x 5"],
  },
  {
    id: "ORD-1028",
    customer: "Abigail Barrion",
    contact: "09131239876",
    items: 4,
    total: "PHP 258.00",
    status: "Ready",
    orderDetails: ["Loratadine | box x 2", "Ascorbic Acid | box x 2"],
  },
  {
    id: "ORD-1029",
    customer: "Althea Alvarez",
    contact: "09136784521",
    items: 6,
    total: "PHP 408.00",
    status: "Ready",
    orderDetails: ["Mefenamic Acid | box x 3", "Cetirizine | box x 3"],
  },
];

function PickUp() {
  const [orders, setOrders] = useState(SAMPLE_ORDERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeOrder, setActiveOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isPaymentResultModalOpen, setIsPaymentResultModalOpen] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [gcashReference, setGcashReference] = useState("");
  const [paymentResult, setPaymentResult] = useState("success");

  const filtered = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      order.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusClassName = (status) => {
    if (status.toLowerCase() === "completed") return "pickup-status-completed";
    return "pickup-status-ready";
  };

  const parseAmount = (amountText) => Number(amountText.replace(/[^\d.]/g, ""));
  const orderTotal = activeOrder ? parseAmount(activeOrder.total) : 0;
  const cashNumeric = Number(cashReceived);
  const changeAmount = Number.isFinite(cashNumeric) ? cashNumeric - orderTotal : 0;
  const isCashValid = Number.isFinite(cashNumeric) && cashNumeric >= orderTotal;
  const isGcashValid = /^\d{13,}$/.test(gcashReference.trim());
  const showCashError = paymentMethod === "cash" && cashReceived.trim() !== "" && !isCashValid;
  const cashShortage = showCashError ? Math.max(orderTotal - cashNumeric, 0) : 0;

  const openDetailsPanel = (order) => {
    setActiveOrder(order);
  };

  const openCompleteSaleModal = () => {
    if (!activeOrder || activeOrder.status.toLowerCase() === "completed") {
      return;
    }

    setCashReceived(orderTotal.toFixed(2));
    setGcashReference("");
    setIsPaymentModalOpen(true);
  };

  const processPayment = () => {
    const isSuccess = paymentMethod === "cash"
      ? isCashValid
      : isGcashValid;

    setPaymentResult(isSuccess ? "success" : "failed");
    setIsPaymentModalOpen(false);
    setIsPaymentResultModalOpen(true);

    if (!isSuccess || !activeOrder) {
      return;
    }

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === activeOrder.id
          ? { ...order, status: "Completed" }
          : order
      )
    );

    setActiveOrder((prevOrder) =>
      prevOrder
        ? { ...prevOrder, status: "Completed" }
        : prevOrder
    );
  };

  const openConfirmModal = () => {
    setIsPaymentModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmContinue = () => {
    setIsConfirmModalOpen(false);
    processPayment();
  };

  const handleConfirmCancel = () => {
    setIsConfirmModalOpen(false);
    setIsPaymentModalOpen(true);
  };

  return (
    <>
      <div className="pickup-layout">
        <div className="pickup-outer-card">
          <div className="d-flex align-items-center justify-content-between gap-3 mb-3 flex-wrap">
            <h1 className="fw-bold m-0 pickup-title">Pickup Orders</h1>
            <div className="pickup-toolbar-actions">
              <div className="position-relative pickup-search-wrap">
                <i className="fa-solid fa-magnifying-glass pickup-search-icon" />
                <input
                  type="text"
                  className="pickup-search-input"
                  placeholder="Search an order by order ID or Customer Name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="pickup-filter-wrap">
                <select
                  className="pickup-filter-select"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter pickup orders by status"
                >
                  <option value="All">All</option>
                  <option value="Ready">Ready</option>
                  <option value="Completed">Completed</option>
                </select>
                <i className="fa-solid fa-chevron-down pickup-filter-chevron" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="pickup-card">
            <table className="pickup-table w-100">
              <colgroup>
                <col style={{ width: "16%" }} />
                <col style={{ width: "26%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th className="pickup-col-center">Items</th>
                  <th className="pickup-col-center">Total</th>
                  <th className="pickup-col-center">Status</th>
                  <th className="pickup-col-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr
                    key={order.id}
                    className={activeOrder?.id === order.id ? "pickup-row-selected" : ""}
                  >
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td className="pickup-col-center">{order.items}</td>
                    <td className="pickup-col-center">{order.total}</td>
                    <td className="pickup-col-center">
                      <span className={getStatusClassName(order.status)}>{order.status}</span>
                    </td>
                    <td className="pickup-col-center">
                      <button
                        className="pickup-view-btn"
                        onClick={() => openDetailsPanel(order)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {activeOrder && (
          <aside className="pickup-details-panel">
            <div className="pickup-details-header">
              <h6>Order Details</h6>
              <button
                type="button"
                className="pickup-details-close"
                onClick={() => setActiveOrder(null)}
                aria-label="Close order details"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <p className="pickup-details-customer">Customer: {activeOrder.customer}</p>
            <p className="pickup-details-contact">Contact: {activeOrder.contact}</p>

            <hr className="pickup-details-divider" />

            <div className="pickup-details-section">
              <p className="pickup-details-section-title">Order Details</p>
              <ul className="pickup-details-list">
                {activeOrder.orderDetails.map((item, index) => (
                  <li key={`${activeOrder.id}-${index}`}>{item}</li>
                ))}
              </ul>
            </div>

            <hr className="pickup-details-divider" />

            <div className="pickup-details-row">
              <span>Total Amount</span>
              <strong>{activeOrder.total}</strong>
            </div>

            <hr className="pickup-details-divider" />

            <div className="pickup-details-row pickup-details-status">
              <span>Status:</span>
              <strong className={getStatusClassName(activeOrder.status)}>{activeOrder.status}</strong>
            </div>


            <div className="pickup-payment-method-wrap">
              <p className="pickup-details-section-title">Select Payment Method</p>
              <div className="d-flex gap-2 pos-payment-actions">
                <button
                  className="btn flex-grow-1 py-2"
                  style={{
                    fontSize: 13,
                    background: paymentMethod === "cash" ? "#2aabe2" : "white",
                    color: paymentMethod === "cash" ? "white" : "#555",
                    border: "1.5px solid #dde3ec",
                    borderRadius: "var(--pd-radius-md)",
                  }}
                  onClick={() => setPaymentMethod("cash")}
                  type="button"
                >
                  Cash
                </button>
                <button
                  className="btn flex-grow-1 py-2"
                  style={{
                    fontSize: 13,
                    background: paymentMethod === "gcash" ? "#2aabe2" : "white",
                    color: paymentMethod === "gcash" ? "white" : "#555",
                    border: "1.5px solid #dde3ec",
                    borderRadius: "var(--pd-radius-md)",
                  }}
                  onClick={() => setPaymentMethod("gcash")}
                  type="button"
                >
                  GCash
                </button>
              </div>
            </div>

            <button
              type="button"
              className="pickup-complete-sale-btn"
              onClick={openCompleteSaleModal}
              disabled={activeOrder.status.toLowerCase() === "completed"}
            >
              {activeOrder.status.toLowerCase() === "completed" ? "Sale Completed" : "Complete Sale"}
            </button>
          </aside>
        )}
      </div>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Receive Payment"
        size="md"
        className="pos-payment-modal"
        footer={null}
      >
        <div className="pos-payment-meta">
          <span>{paymentMethod === "cash" ? "Cash" : "GCash"}</span>
          <span>
            Order Total: <strong>PHP {orderTotal.toFixed(2)}</strong>
          </span>
        </div>

        {paymentMethod === "cash" ? (
          <>
            <label className="pos-payment-label" htmlFor="pickup-cash-received">
              Enter Cash Received
            </label>
            <input
              id="pickup-cash-received"
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
            <label className="pos-payment-label" htmlFor="pickup-gcash-reference">
              Enter GCash Reference No.
            </label>
            <input
              id="pickup-gcash-reference"
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
          onClick={openConfirmModal}
          disabled={paymentMethod === "cash" ? !isCashValid : !isGcashValid}
        >
          Confirm
        </button>
      </Modal>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={handleConfirmCancel}
        size="sm"
        showCloseButton={false}
        className="pos-confirm-modal"
      >
        <div className="pos-confirm-content">
          <img src={shieldQuestionIcon} alt="" className="pos-confirm-icon" aria-hidden="true" />
          <h3 className="pos-confirm-title">Confirm this order?</h3>
          <p className="pos-confirm-text">
            Please review the details before proceeding. This action cannot be undone.
          </p>
          <div className="pos-confirm-actions">
            <button type="button" className="pos-confirm-primary" onClick={handleConfirmContinue}>
              Continue
            </button>
            <button type="button" className="pos-confirm-secondary" onClick={handleConfirmCancel}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isPaymentResultModalOpen}
        onClose={() => setIsPaymentResultModalOpen(false)}
        size="sm"
        showCloseButton={false}
        className="pos-payment-result-modal"
      >
        <button
          type="button"
          className="pos-result-close"
          onClick={() => setIsPaymentResultModalOpen(false)}
          aria-label="Close payment result"
        >
          <i className="fa-solid fa-xmark" />
        </button>

        <div className="pos-result-content">
          <img
            src={paymentResult === "success" ? successfulTaskIcon : unsuccessfulTaskIcon}
            alt={paymentResult === "success" ? "Payment successful" : "Payment unsuccessful"}
            className="pos-result-icon"
          />
          <p className="pos-result-text">
            Payment {paymentResult === "success" ? "Successful" : "Unsuccessful"}
          </p>
        </div>
      </Modal>
    </>
  );
}

export default PickUp;