import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildCartViewState,
  changeCartItemQuantity,
  getCartItems,
  toggleAllCartItems,
  toggleCartItemSelection,
} from '@shared/services/cartService';

export function useCartTab() {
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

  const clearAll = useCallback(() => {
    setCartItems([]);
  }, []);

  const viewState = useMemo(() => buildCartViewState(cartItems), [cartItems]);

  const toggleAll = useCallback(() => {
    setCartItems((prev) => toggleAllCartItems(prev, !viewState.allSelected));
  }, [viewState.allSelected]);

  const pharmacyLabel = useMemo(() => {
    if (viewState.pharmacyNames.length > 1) {
      return `${viewState.pharmacyNames.length} pharmacies selected`;
    }

    return viewState.pharmacyNames[0] || 'No pharmacy selected';
  }, [viewState.pharmacyNames]);

  return {
    cartItems,
    loading,
    errorMessage,
    loadCartItems,
    toggleItem,
    incrementQty,
    decrementQty,
    clearAll,
    toggleAll,
    viewState,
    pharmacyLabel,
  };
}
