import React, { createContext, useContext, useState, useCallback } from 'react';
import { submitCheckoutOrder } from '@shared/services/checkoutSubmissionService';

const OrderSubmissionContext = createContext();

export function useOrderSubmission() {
  const context = useContext(OrderSubmissionContext);
  if (!context) {
    return { submitOptimisticOrder: () => {}, optimisticOrders: [], lastSubmissionError: null };
  }
  return context;
}

export function OrderSubmissionProvider({ children }) {
  const [optimisticOrders, setOptimisticOrders] = useState([]);
  const [lastSubmittedOrder, setLastSubmittedOrder] = useState(null);
  const [lastSubmissionError, setLastSubmissionError] = useState(null);

  const buildMockOrderForActiveOrders = (localId, payload) => {
    // Generate a temporary order number
    const orderNumber = `OPT-${localId.substring(localId.length - 6)}`;
    
    // Format date similar to backend
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    // Format products for ActiveOrdersScreen
    const products = (payload.items || []).map(item => ({
      description: item.description || item.product?.name || 'Product',
      price: item.price,
      quantity: item.quantity,
      img: item.img || null,
      prescriptionRequired: item.prescriptionRequired || false,
      product: item.product || null,
      categoryName: item.category?.category_name || item.product?.category_name || ''
    }));

    // Calculate total summary
    const totalItems = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
    const totalPrice = products.reduce((sum, p) => sum + ((Number(p.price) || 0) * (Number(p.quantity) || 0)), 0);
    const orderSummary = `${totalItems} Items - PHP ${totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

    return {
      id: localId,
      orderNumber,
      date,
      status: 'submitting', // custom status for optimistic order
      products,
      orderSummary,
      _isOptimistic: true,
      _payload: payload // keep payload for retries
    };
  };

  const submitOptimisticOrder = useCallback((payload) => {
    const localId = Date.now().toString();
    const mockOrder = buildMockOrderForActiveOrders(localId, payload);
    
    // Clear previous error on new submission attempt
    setLastSubmissionError(null);

    // Add to state
    setOptimisticOrders(prev => [mockOrder, ...prev]);

    // Process in background
    processSubmission(localId, payload);

    return localId;
  }, []);

  const processSubmission = async (localId, payload) => {
    try {
      // Attempt API submission
      const result = await submitCheckoutOrder(payload);
      if (result?.order) {
        setLastSubmittedOrder(result.order);
      }
      
      // On success, clear any failure states
      setLastSubmissionError(null);
      setOptimisticOrders(prev => prev.filter(o => o.id !== localId));
    } catch (error) {
      console.warn('Optimistic order submission failed:', error);
      const specificMessage = error?.message || 'We encountered an issue submitting your order.';
      setLastSubmissionError(specificMessage);

      // Update status to error for this specific optimistic order
      setOptimisticOrders(prev => prev.map(o => 
        o.id === localId ? { ...o, status: 'error', errorMessage: specificMessage } : o
      ));
    }
  };

  const retrySubmission = useCallback((localId) => {
    setOptimisticOrders(prev => {
      const orderToRetry = prev.find(o => o.id === localId);
      if (!orderToRetry) return prev;

      setLastSubmissionError(null);

      // Process again in background
      processSubmission(localId, orderToRetry._payload);

      // Set status back to submitting
      return prev.map(o => 
        o.id === localId ? { ...o, status: 'submitting' } : o
      );
    });
  }, []);

  const removeOptimisticOrder = useCallback((localId) => {
    setOptimisticOrders(prev => prev.filter(o => o.id !== localId));
  }, []);

  const clearSubmissionError = useCallback(() => {
    setLastSubmissionError(null);
  }, []);

  return (
    <OrderSubmissionContext.Provider value={{ 
      optimisticOrders, 
      lastSubmittedOrder,
      lastSubmissionError,
      clearSubmissionError,
      submitOptimisticOrder, 
      retrySubmission,
      removeOptimisticOrder
    }}>
      {children}
    </OrderSubmissionContext.Provider>
  );
}
