import { useState } from "react";
import adminMedsIcon from "../assets/icons/admin_meds.svg";

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

function PosPage() {
  const [search, setSearch] = useState("");

  return (
    <div
      className="d-flex flex-column flex-md-row gap-4"
      style={{ height: "calc(90vh - 90px)", minHeight: 400 }}
    >
      {/* Leftside para sa product list */}
      <div className="d-flex flex-column flex-grow-1" style={{ minWidth: 0 }}>
        <div className="card flex-grow-1 border-0 shadow-md">
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
          <div className="card-body p-3 pt-3">
            <div className="card border-1 shadow-md h-100" style={{ minHeight: 260 }}>
              <div className="card-body d-flex flex-column p-0">
                <EmptyState />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rightside: para sa current order */}
      <div
        className="d-flex flex-column"
        style={{ width: 500, flexShrink: 0, minWidth: 0 }}
      >
        <div className="card flex-grow-1 border-0 shadow-sm">
          <div className="card-header bg-white border-0 d-flex align-items-center gap-3 flex-wrap pt-4 pb-2 px-3">
            <h6
              className="fw-semibold mb-3 flex-shrink-0"
              style={{ color: "#222", fontSize: 20 }}
            >
              Current Order
            </h6>
          </div>
          <div className="card-body p-3 pt-1">
            <div className="card border-1 shadow-sm h-100" style={{ minHeight: 260 }}>
              <div className="card-body d-flex flex-column p-0">
                <EmptyState />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PosPage;