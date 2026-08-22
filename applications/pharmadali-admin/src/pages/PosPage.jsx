import React from "react";
import "../assets/css/pospage.css";
import { PosProvider } from "../context/PosContext";
import PosProductPane from "../components/Pos/PosProductPane";
import PosOrderPane from "../components/Pos/PosOrderPane";
import PosModals from "../components/Pos/PosModals";

function PosPage() {
  return (
    <PosProvider>
      <section>
        <div className="d-flex flex-column flex-md-row gap-4 pos-page">
          <PosProductPane />
          <PosOrderPane />
          <PosModals />
        </div>
      </section>
    </PosProvider>
  );
}

export default PosPage;