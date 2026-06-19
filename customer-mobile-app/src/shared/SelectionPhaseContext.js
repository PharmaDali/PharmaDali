import { createContext, useContext, useState } from 'react';

const SelectionPhaseContext = createContext({
  selectionPhase: false,
  setSelectionPhase: () => {},
  selectedPharmacy: null,
  setSelectedPharmacy: () => {},
  operatingHours: null,
  setOperatingHours: () => {},
});

export function SelectionPhaseProvider({ children }) {
  const [selectionPhase, setSelectionPhase] = useState(true);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);

  const [operatingHours, setOperatingHours] = useState(null);

  return (
    <SelectionPhaseContext.Provider value={{ selectionPhase, setSelectionPhase, selectedPharmacy, setSelectedPharmacy, operatingHours, setOperatingHours }}>
      {children}
    </SelectionPhaseContext.Provider>
  );
}

export function useSelectionPhase() {
  return useContext(SelectionPhaseContext);
}
