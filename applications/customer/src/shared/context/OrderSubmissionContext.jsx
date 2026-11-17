import React, { createContext, useContext, useState, useCallback } from 'react';
import { submitCheckoutOrder } from '@shared/services/checkoutSubmissionService';
import { formatCurrency } from '@features/order/orderMappers';
import { formatBranchName } from '@shared/utils/notificationUtils';

const OrderSubmissionContext = createContext();

export function useOrderSubmission() {
  const context = useContext(OrderSubmissionContext);
  if (!context) {
    return {
      submitOptimisticOrder: () => {},
      clearLastSubmittedOrder: () => {},
      optimisticOrders: [],
      lastSubmittedOrder: null,
      lastSubmissionError: null,
    };
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
    const date = new Date().toLocaleString('en-PH', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Format products for ActiveOrdersScreen
    const products = (payload.items || []).map(item => {
      const unitPrice = Number(item.price) || 0;
      const product = item.product || null;
      return {
        pharmacyProductId: Number(item.pharmacyProductId || item.pharmacy_product_id || 0) || null,
        description: item.description || product?.product_name || product?.name || 'Product',
        price: formatCurrency(unitPrice),
        unitPrice,
        quantity: Number(item.quantity) || 1,
        img: item.img || product?.image_url || null,
        prescriptionRequired: Boolean(item.prescriptionRequired),
        product,
        categoryName: item.category?.category_name || product?.category_name || '',
        sizeLabel: product?.size ? 'Size' : (product?.strength ? 'Dosage' : 'Size'),
        size: item.size || product?.size || product?.strength || 'N/A',
      };
    });

    // Calculate total summary
    const totalPrice = products.reduce((sum, p) => sum + ((Number(p.unitPrice) || 0) * (Number(p.quantity) || 0)), 0);
    const orderSummary = formatCurrency(totalPrice);
    const rawBranch = payload.selectedPharmacyLabel || '';
    const branchName = formatBranchName(rawBranch, '') || rawBranch;

    return {
      id: localId,
      serverOrderId: null,
      orderNumber,
      date,
      branchName,
      pharmacyName: rawBranch,
      status: 'submitting', // custom status for optimistic order
      products,
      orderSummary,
      submittedAt: Number(localId) || Date.now(),
      _isOptimistic: true,
      _payload: payload // keep payload for retries
    };
  };

  const submitOptimisticOrder = useCallback((payload) => {
    const localId = Date.now().toString();
    const mockOrder = buildMockOrderForActiveOrders(localId, payload);
    
    // Clear previous error and stale lastSubmittedOrder on new submission attempt
    setLastSubmissionError(null);
    setLastSubmittedOrder(null);

    // Add to state
    setOptimisticOrders(prev => [mockOrder, ...prev]);

    // Process in background
    processSubmission(localId, payload);

    return localId;
  }, []);

  const processSubmission = async (localId, payload) => {
    try {
      // Attempt API submission
      const result = await submitCheckoutOrder(payload, {
        onOrderCreated: (createdOrder) => {
          const createdId = Number(createdOrder?.id || 0) || null;
          if (!createdId) return;
          setOptimisticOrders(prev => prev.map(o =>
            o.id === localId
              ? {
                  ...o,
                  serverOrderId: createdId,
                  orderNumber: createdOrder?.order_number || o.orderNumber,
                }
              : o
          ));
        },
      });
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

  const clearLastSubmittedOrder = useCallback(() => {
    setLastSubmittedOrder(null);
  }, []);

  return (
    <OrderSubmissionContext.Provider value={{ 
      optimisticOrders, 
      lastSubmittedOrder,
      lastSubmissionError,
      clearSubmissionError,
      clearLastSubmittedOrder,
      submitOptimisticOrder, 
      retrySubmission,
      removeOptimisticOrder
    }}>
      {children}
    </OrderSubmissionContext.Provider>
  );
}
