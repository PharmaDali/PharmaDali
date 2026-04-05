import { createContext, useContext, useState } from 'react';

const SelectionPhaseContext = createContext({
  selectionPhase: false,
  setSelectionPhase: () => {},
  selectedBranch: null,
  setSelectedBranch: () => {},
});

export function SelectionPhaseProvider({ children }) {
  const [selectionPhase, setSelectionPhase] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(null);

  return (
    <SelectionPhaseContext.Provider value={{ selectionPhase, setSelectionPhase, selectedBranch, setSelectedBranch }}>
      {children}
    </SelectionPhaseContext.Provider>
  );
}

export function useSelectionPhase() {
  return useContext(SelectionPhaseContext);
}
