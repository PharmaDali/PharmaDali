import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelectionPhase } from '@shared/context/SelectionPhaseContext';
import {
  buildCartViewState,
  changeCartItemQuantity,
  clearCart,
  getCartItems,
  removeCartItem,
  toggleAllCartItems,
  toggleCartItemSelection,
} from '@shared/services/cartService';

export function useCartTab() {
  const { selectedPharmacy } = useSelectionPhase();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadCartItems = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const payload = await getCartItems();
      setCartItems(payload.items);
    } catch (error) {
      setCartItems([]);
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load your cart items.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);

  const toggleItem = useCallback((id) => {
    setCartItems((prev) => toggleCartItemSelection(prev, id));
  }, []);

  const incrementQty = useCallback((id) => {
    setCartItems((prev) => changeCartItemQuantity(prev, id, 'increment'));
  }, []);

  const decrementQty = useCallback((id) => {
    setCartItems((prev) => changeCartItemQuantity(prev, id, 'decrement'));
  }, []);

  const clearAll = useCallback(async () => {
    try {
      await clearCart();
      setCartItems([]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to clear cart.');
    }
  }, []);

  const removeItem = useCallback(async (id) => {
    try {
      await removeCartItem(id);
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to remove item.');
    }
  }, []);

  const viewState = useMemo(() => buildCartViewState(cartItems), [cartItems]);

  const toggleAll = useCallback(() => {
    setCartItems((prev) => toggleAllCartItems(prev, !viewState.allSelected));
  }, [viewState.allSelected]);

  const pharmacyLabel = useMemo(() => {
    const validCartName = viewState.pharmacyNames.find(
      (name) => name && name !== 'Unknown pharmacy' && name !== 'Selected pharmacy' && name !== 'No pharmacy selected'
    );
    if (validCartName) {
      return validCartName;
    }

    if (viewState.pharmacyNames.length > 1) {
      return `${viewState.pharmacyNames.length} pharmacies selected`;
    }

    const contextName = selectedPharmacy?.name || selectedPharmacy?.pharmacy_name;
    if (contextName && contextName !== 'Selected pharmacy') {
      return contextName;
    }

    return viewState.pharmacyNames[0] || contextName || 'Selected pharmacy';
  }, [viewState.pharmacyNames, selectedPharmacy]);

  const pharmacyLocationLabel = useMemo(() => {
    const validCartLocation = viewState.pharmacyLocations.find(
      (loc) => loc && loc.trim() !== ''
    );
    if (validCartLocation) {
      return validCartLocation;
    }

    if (viewState.pharmacyLocations.length > 1) {
      return 'Multiple locations';
    }

    return selectedPharmacy?.address || selectedPharmacy?.location || viewState.pharmacyLocations[0] || '';
  }, [viewState.pharmacyLocations, selectedPharmacy]);

  return {
    cartItems,
    loading,
    errorMessage,
    loadCartItems,
    toggleItem,
    incrementQty,
    decrementQty,
    removeItem,
    clearAll,
    toggleAll,
    viewState,
    pharmacyLabel,
    pharmacyLocationLabel,
  };
}
