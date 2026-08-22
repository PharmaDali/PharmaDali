import React, { createContext, useContext } from "react";
import { usePos } from "../hooks/usePos";

const PosContext = createContext(null);

export function PosProvider({ children }) {
  const posState = usePos();

  return (
    <PosContext.Provider value={posState}>
      {children}
    </PosContext.Provider>
  );
}

export function usePosContext() {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error("usePosContext must be used within a PosProvider");
  }
  return context;
}
