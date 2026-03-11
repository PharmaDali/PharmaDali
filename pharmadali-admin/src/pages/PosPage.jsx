import { useState } from "react";
import adminMedsIcon from "../assets/icons/admin_meds.svg";

const SAMPLE_PRODUCTS = [
  { id: 1, genericName: "Amoxicillin", brandName: "Amoxil",   strength: "500 mg Capsule",           price: 21.12, stocks: 120 },
  { id: 2, genericName: "Amoxicillin", brandName: "Ambimox",  strength: "500 mg Capsule",           price: 4.05,  stocks: 185 },
  { id: 3, genericName: "Amoxicillin", brandName: "Saphmox",  strength: "500 mg Capsule",           price: 4.02,  stocks: 264 },
  { id: 4, genericName: "Amoxicillin", brandName: "Axmel",    strength: "250 mg Capsule",           price: 4.71,  stocks: 150 },
  { id: 5, genericName: "Amoxicillin", brandName: "Axmel",    strength: "250 mg/5 mL Suspension",   price: 163.88,stocks: 250 },
  { id: 6, genericName: "Amoxicillin", brandName: "Ambimox",  strength: "500 mg Capsule",           price: 4.05,  stocks: 185 },
  { id: 7, genericName: "Amoxicillin", brandName: "Saphmox",  strength: "500 mg Capsule",           price: 4.02,  stocks: 264 },
  { id: 8, genericName: "Amoxicillin", brandName: "Axmel",    strength: "250 mg Capsule",           price: 4.71,  stocks: 150 },
  { id: 9, genericName: "Amoxicillin", brandName: "Axmel",    strength: "250 mg/5 mL Suspension",   price: 163.88,stocks: 250 },
  { id: 10,genericName: "Aspirin",     brandName: "Bayer",    strength: "325 mg Tablet",            price: 2.50,  stocks: 500 },
  { id: 11,genericName: "Azithromycin",brandName: "Zithromax",strength: "500 mg Tablet",            price: 55.00, stocks: 80  },
  { id: 12,genericName: "Ibuprofen",   brandName: "Advil",    strength: "200 mg Tablet",            price: 5.00,  stocks: 320 },
  { id: 13,genericName: "Paracetamol", brandName: "Biogesic", strength: "500 mg Tablet",            price: 1.50,  stocks: 600 },
];

function EmptyState() {
  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center h-100"
      style={{ minHeight: 260 }}
    >
      <img src={adminMedsIcon} alt="No items" width={150} className="mb-2" />
      <p className="mb-0" style={{ fontSize: 13, color: "#b5bec8" }}>
        Search for items
      </p>
    </div>
  );
}

const COL_WIDTHS = ["22%", "18%", "28%", "17%", "15%"];

function ProductTable({ results, selectedId, onSelect }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      
      <table className="table mb-0" style={{ fontSize: 13, tableLayout: "fixed" }}>
        <colgroup>
          {COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
        </colgroup>
        <thead>
          <tr style={{ background: "#96D2EE" }}>
            <th className="px-3 py-2 fw-semibold border-0" style={{ color: "#555", background: "#96D2EE" }}>Generic Name</th>
            <th className="px-3 py-2 fw-semibold border-0" style={{ color: "#555", background: "#96D2EE" }}>Brand Name</th>
            <th className="px-3 py-2 fw-semibold border-0" style={{ color: "#555", background: "#96D2EE" }}>Strength</th>
            <th className="px-3 py-2 fw-semibold border-0" style={{ color: "#555", background: "#96D2EE" }}>Price (PHP)</th>
            <th className="px-3 py-2 fw-semibold border-0" style={{ color: "#555", background: "#96D2EE" }}>Stocks</th>
          </tr>
        </thead>
      </table>
      
      <div className="pos-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <table className="table table-hover mb-0" style={{ fontSize: 13, tableLayout: "fixed" }}>
          <colgroup>
            {COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
          </colgroup>
          <tbody>
            {results.map((item) => (
              <tr
                key={item.id}
                className="pos-row"
                onClick={() => onSelect(item)}
                style={{
                  cursor: "pointer",
                  background: selectedId === item.id ? "#e8f0fe" : "white",
                }}
              >
                <td className="py-3 border-0 border-bottom" style={{ color: "#333", borderLeft: selectedId === item.id ? "4px solid #2aabe2" : "4px solid transparent", paddingLeft: 8, paddingRight: 12 }}>{item.genericName}</td>
                <td className="px-3 py-3 border-0 border-bottom" style={{ color: "#333" }}>{item.brandName}</td>
                <td className="px-3 py-3 border-0 border-bottom" style={{ color: "#333" }}>{item.strength}</td>
                <td className="px-3 py-3 border-0 border-bottom" style={{ color: "#333" }}>{item.price.toFixed(2)}</td>
                <td className="px-3 py-3 border-0 border-bottom" style={{ color: "#333" }}>{item.stocks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ORDER_COL_WIDTHS = ["40%", "11%", "20%", "19%", "10%"];

function CurrentOrder({ items, paymentMethod, onPaymentChange, onCompleteSale, onRemove }) {
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const orderTotal = items.reduce((s, i) => s + i.qty * i.product.price, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div
        className="card border-1 shadow-sm"
        style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
      >
        <table className="table mb-0" style={{ fontSize: 13, tableLayout: "fixed" }}>
          <colgroup>
            {ORDER_COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
          </colgroup>
          <thead>
            <tr>
              <th className="px-3 py-2 fw-semibold border-0" style={{ color: "#555", background: "#96D2EE" }}>Product</th>
              <th className="px-2 py-2 fw-semibold border-0 text-center" style={{ color: "#555", background: "#96D2EE" }}>Qty</th>
              <th className="px-2 py-2 fw-semibold border-0 text-end" style={{ color: "#555", background: "#96D2EE" }}>Price (PHP)</th>
              <th className="px-3 py-2 fw-semibold border-0 text-end" style={{ color: "#555", background: "#96D2EE" }}>Subtotal</th>
              <th className="px-2 py-2 fw-semibold border-0" style={{ color: "#555", background: "#96D2EE" }}></th>
            </tr>
          </thead>
        </table>
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="pos-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
            <table className="table mb-0" style={{ fontSize: 13, tableLayout: "fixed" }}>
              <colgroup>
                {ORDER_COL_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
              </colgroup>
              <tbody>
                {items.map(({ product, qty }) => (
                  <tr key={product.id}>
                    <td className="px-3 py-2 border-0 border-bottom" style={{ color: "#333" }}>
                      {product.genericName} {product.brandName}
                    </td>
                    <td className="px-2 py-2 border-0 border-bottom text-center" style={{ color: "#333" }}>{qty}</td>
                    <td className="px-2 py-2 border-0 border-bottom text-end" style={{ color: "#333" }}>{product.price.toFixed(2)}</td>
                    <td className="px-3 py-2 border-0 border-bottom text-end" style={{ color: "#333" }}>{(qty * product.price).toFixed(2)}</td>
                    <td className="px-2 py-2 border-0 border-bottom text-center">
                      <button
                        onClick={() => onRemove(product.id)}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "#e25252", fontSize: 14, lineHeight: 1 }}
                      >&times;</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="d-flex justify-content-between align-items-end px-1 pt-3 pb-2">
        <div>
          <div style={{ fontSize: 12, color: "#888" }}>No. of Items</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#222" }}>{totalQty}</div>
        </div>
        <div className="text-end">
          <div style={{ fontSize: 12, color: "#888" }}>Order Total</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#222" }}>PHP {orderTotal.toFixed(2)}</div>
        </div>
      </div>

      <div className="pb-2">
        <div style={{ fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 }}>Payment Method</div>
        <div className="d-flex gap-2">
          <button
            className="btn flex-grow-1 py-2"
            style={{
              fontSize: 13,
              background: paymentMethod === "cash" ? "#2aabe2" : "white",
              color: paymentMethod === "cash" ? "white" : "#555",
              border: "1.5px solid #dde3ec",
              borderRadius: 8,
            }}
            onClick={() => onPaymentChange("cash")}
          >Cash</button>
          <button
            className="btn flex-grow-1 py-2"
            style={{
              fontSize: 13,
              background: paymentMethod === "gcash" ? "#2aabe2" : "white",
              color: paymentMethod === "gcash" ? "white" : "#555",
              border: "1.5px solid #dde3ec",
              borderRadius: 8,
            }}
            onClick={() => onPaymentChange("gcash")}
          >GCash</button>
        </div>
      </div>

      <button
        className="btn w-100 py-2"
        style={{ background: "#2aabe2", color: "white", fontSize: 14, fontWeight: 600, borderRadius: 8 }}
        onClick={onCompleteSale}
      >
        Complete Sale
      </button>
    </div>
  );
}

function PosPage() {
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  function addToOrder(product) {
    setSelectedProduct(product);
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  }

  function removeFromOrder(productId) {
    setOrderItems((prev) => prev.filter((i) => i.product.id !== productId));
  }

  const filtered = search.trim()
    ? SAMPLE_PRODUCTS.filter(
        (p) =>
          p.genericName.toLowerCase().includes(search.toLowerCase()) ||
          p.brandName.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div
      className="d-flex flex-column flex-md-row gap-4"
      style={{ height: "calc(90vh - 90px)", minHeight: 400 }}
    >
      <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
        <div className="card border-0 shadow-md" style={{ height: "calc(90vh - 130px)" }}>
          <div className="card-header bg-white border-0 d-flex align-items-center gap-3 flex-wrap pt-3 pb-2 px-3">
            <h6
              className="fw-semibold mb-0 flex-shrink-0"
              style={{ color: "#222", fontSize: 20 }}
            >
              Product List
            </h6>
            <div
              className="d-flex align-items-center gap-3 rounded-pill px-3 py-2 flex-grow-1 flex-md-grow-0"
              style={{
                background: "#E3EBF3",
                border: "1.5px solid #dde3ec",
                width: 300,
              }}
            >
              <i
                className="fa-solid fa-magnifying-glass"
                style={{ color: "#9ca3af", fontSize: 13 }}
              />
              <input
                type="text"
                className="border-0 bg-transparent w-100"
                placeholder="Search for Medicine name or brand"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  fontSize: 13,
                  color: "#555",
                  outline: "none",
                  boxShadow: "none",
                }}
              />
            </div>
          </div>
          <div className="card-body p-3 pt-3 overflow-hidden" style={{ flex: 1, minHeight: 0 }}>
            <div className="card border-1 shadow-md" style={{ height: "100%", overflow: "hidden" }}>
              <div className="card-body d-flex flex-column p-0" style={{ flex: 1, minHeight: 0 }}>
                {filtered.length > 0 ? (
                  <ProductTable
                    results={filtered}
                    selectedId={selectedProduct?.id}
                    onSelect={addToOrder}
                  />
                ) : (
                  <EmptyState />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="d-flex flex-column"
        style={{ width: 500, flexShrink: 0, minWidth: 0 }}
      >
        <div className="card border-0 shadow-sm" style={{ height: "calc(90vh - 130px)" }}>
          <div className="card-header bg-white border-0 d-flex align-items-center gap-3 flex-wrap pt-4 pb-2 px-3">
            <h6
              className="fw-semibold mb-3 flex-shrink-0"
              style={{ color: "#222", fontSize: 20 }}
            >
              Current Order
            </h6>
          </div>
          <div className="card-body p-3 pt-1 overflow-hidden" style={{ flex: 1, minHeight: 0 }}>
            <CurrentOrder
              items={orderItems}
              paymentMethod={paymentMethod}
              onPaymentChange={setPaymentMethod}
              onRemove={removeFromOrder}
              onCompleteSale={() => { setOrderItems([]); setSelectedProduct(null); }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PosPage;