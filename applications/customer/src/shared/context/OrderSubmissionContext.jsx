import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { submitCheckoutOrder } from '@shared/services/checkoutSubmissionService';

const OrderSubmissionContext = createContext();

export function useOrderSubmission() {
  const context = useContext(OrderSubmissionContext);
  if (!context) {
    return { submitOptimisticOrder: () => {}, optimisticOrders: [] };
  }
  return context;
}

export function OrderSubmissionProvider({ children }) {
  const [optimisticOrders, setOptimisticOrders] = useState([]);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

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
    const orderSummary = `${totalItems} Items - ₱${totalPrice.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

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
    
    // Add to state
    setOptimisticOrders(prev => [mockOrder, ...prev]);

    // Process in background
    processSubmission(localId, payload);

    return localId;
  }, []);

  const processSubmission = async (localId, payload) => {
    try {
      // Attempt API submission
      await submitCheckoutOrder(payload);
      
      // On success, remove from optimistic orders list
      setOptimisticOrders(prev => prev.filter(o => o.id !== localId));
    } catch (error) {
      console.warn('Optimistic order submission failed:', error);
      // Update status to error
      setOptimisticOrders(prev => prev.map(o => 
        o.id === localId ? { ...o, status: 'error' } : o
      ));

      setErrorModalVisible(true);
    }
  };

  const retrySubmission = useCallback((localId) => {
    setOptimisticOrders(prev => {
      const orderToRetry = prev.find(o => o.id === localId);
      if (!orderToRetry) return prev;

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

  return (
    <OrderSubmissionContext.Provider value={{ 
      optimisticOrders, 
      submitOptimisticOrder, 
      retrySubmission,
      removeOptimisticOrder
    }}>
      {children}
      <Modal visible={errorModalVisible} transparent animationType="fade" onRequestClose={() => setErrorModalVisible(false)}>
        <Pressable className="flex-1 bg-black/50 justify-center items-center px-8" onPress={() => setErrorModalVisible(false)}>
          <Pressable className="bg-white rounded-2xl p-6 w-full items-center shadow-xl" onPress={(e) => e.stopPropagation()}>
            <View className="w-16 h-16 rounded-full border-4 border-red-500 bg-red-50 items-center justify-center mb-4">
              <Text className="text-3xl text-red-500" style={styles.fontBold}>!</Text>
            </View>
            <Text className="text-xl mb-2" style={styles.errorTitle}>Submission Failed</Text>
            <Text className="text-sm text-center mb-4" style={styles.fontMedium}>
              We encountered an issue submitting your order. You can retry from your Active Orders.
            </Text>
            <TouchableOpacity
              className="w-full rounded-xl py-3 items-center bg-[#48AAD9]"
              onPress={() => setErrorModalVisible(false)}
            >
              <Text className="text-sm text-white" style={styles.fontSemiBold}>OK</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </OrderSubmissionContext.Provider>
  );
}

const styles = StyleSheet.create({
  errorTitle: {
    fontFamily: 'Poppins-Bold',
    color: '#DC3545',
  },
  fontBold: {
    fontFamily: 'Poppins-Bold',
  },
  fontMedium: {
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  fontSemiBold: {
    fontFamily: 'Poppins-SemiBold',
  },
});

