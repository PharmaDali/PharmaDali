import { useState } from "react";
import Modal from "../components/Modal";

const SAMPLE_ORDERS = [
  { id: "ORD-1025", customer: "Denmar Redondo",  items: 2,  total: "PHP 108.00",  status: "Ready" },
  { id: "ORD-1025", customer: "Abigail Barrion", items: 4,  total: "PHP 258.00",  status: "Ready" },
  { id: "ORD-1025", customer: "Althea Alvarez",  items: 6,  total: "PHP 408.00",  status: "Ready" },
  { id: "ORD-1025", customer: "James Mercado",   items: 8,  total: "PHP 1108.00", status: "Ready" },
  { id: "ORD-1025", customer: "James Orlanes",   items: 10, total: "PHP 908.00",  status: "Ready" },
];

function PickUp() {
  const [search, setSearch] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  const filtered = SAMPLE_ORDERS.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase())
  );

  const openDetailsModal = (order, index) => {
    setSelectedIdx(index);
    setActiveOrder(order);
    setIsDetailsOpen(true);
  };

  return (
    <div className="pickup-outer-card">
      <div className="d-flex align-items-center justify-content-between gap-3 mb-3 flex-wrap">
        <h1 className="fw-bold m-0 pickup-title">Pickup Orders</h1>
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
      </div>

      <div className="pickup-card">
        <table className="pickup-table w-100">
          <colgroup>
            <col style={{ width: "12%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "23%" }} />
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
            {filtered.map((order, i) => (
              <tr
                key={i}
                className={i === selectedIdx ? "pickup-row-selected" : ""}
                onClick={() => setSelectedIdx(i)}
              >
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td className="pickup-col-center">{order.items}</td>
                <td className="pickup-col-center">{order.total}</td>
                <td className="pickup-col-center">
                  <span className="pickup-status-ready">{order.status}</span>
                </td>
                <td className="pickup-col-center">
                  <button
                    className="pickup-view-btn"
                    onClick={(event) => {
                      event.stopPropagation();
                      openDetailsModal(order, i);
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Pickup Order Details"
        size="md"
        footer={(
          <>
            <button
              type="button"
              className="btn btn-light"
              onClick={() => setIsDetailsOpen(false)}
            >
              Close
            </button>
            <button type="button" className="btn btn-primary">
              Mark As Released
            </button>
          </>
        )}
      >
        {activeOrder && (
          <div className="pickup-order-details-grid">
            <div className="pickup-order-details-item">
              <span className="pickup-order-details-label">Order ID</span>
              <strong className="pickup-order-details-value">{activeOrder.id}</strong>
            </div>
            <div className="pickup-order-details-item">
              <span className="pickup-order-details-label">Customer</span>
              <strong className="pickup-order-details-value">{activeOrder.customer}</strong>
            </div>
            <div className="pickup-order-details-item">
              <span className="pickup-order-details-label">Items</span>
              <strong className="pickup-order-details-value">{activeOrder.items}</strong>
            </div>
            <div className="pickup-order-details-item">
              <span className="pickup-order-details-label">Total</span>
              <strong className="pickup-order-details-value">{activeOrder.total}</strong>
            </div>
            <div className="pickup-order-details-item pickup-order-details-item--wide">
              <span className="pickup-order-details-label">Status</span>
              <strong className="pickup-order-details-value pickup-status-ready">{activeOrder.status}</strong>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default PickUp;