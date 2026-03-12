import { useState } from "react";

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

  const filtered = SAMPLE_ORDERS.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase())
  );

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
                  <button className="pickup-view-btn">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PickUp;