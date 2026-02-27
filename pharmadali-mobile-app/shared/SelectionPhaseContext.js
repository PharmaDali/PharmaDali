import { createContext, useContext, useState } from 'react';

const SelectionPhaseContext = createContext({
  selectionPhase: false,
  setSelectionPhase: () => {},
});

export function SelectionPhaseProvider({ children }) {
  const [selectionPhase, setSelectionPhase] = useState(true);

  return (
    <SelectionPhaseContext.Provider value={{ selectionPhase, setSelectionPhase }}>
      {children}
    </SelectionPhaseContext.Provider>
  );
}

export function useSelectionPhase() {
  return useContext(SelectionPhaseContext);
}
