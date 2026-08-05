import { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

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

  useEffect(() => {
    const pharmacyId = selectedPharmacy?.id ?? selectedPharmacy?.pharmacy_id;
    if (pharmacyId) {
      SecureStore.setItemAsync('customer_selected_pharmacy_id', String(pharmacyId)).catch(() => {});
    } else {
      SecureStore.deleteItemAsync('customer_selected_pharmacy_id').catch(() => {});
    }
  }, [selectedPharmacy]);

  return (
    <SelectionPhaseContext.Provider value={{ selectionPhase, setSelectionPhase, selectedPharmacy, setSelectedPharmacy, operatingHours, setOperatingHours }}>
      {children}
    </SelectionPhaseContext.Provider>
  );
}

export function useSelectionPhase() {
  return useContext(SelectionPhaseContext);
}
