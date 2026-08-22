import React from "react";
import { usePosContext } from "../../context/PosContext";
import {
  ReceivePaymentModal,
  ConfirmOrderModal,
  PaymentResultModal,
} from "../../shared/components/PaymentModals";
import AddQuantityModal from "./AddQuantityModal";

export default function PosModals() {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    paymentMethod,
    orderTotal,
    cashReceived,
    setCashReceived,
    gcashReference,
    setGcashReference,
    handleReceivePaymentConfirm,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    handleConfirmContinue,
    isProcessingPayment,
    isPaymentResultModalOpen,
    setIsPaymentResultModalOpen,
    paymentResult,
    isQuantityModalOpen,
    setIsQuantityModalOpen,
    productToQuantity,
    handleAddQuantityToOrder,
  } = usePosContext();

  return (
    <>
      <ReceivePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentMethod={paymentMethod}
        orderTotal={orderTotal}
        cashReceived={cashReceived}
        setCashReceived={setCashReceived}
        gcashReference={gcashReference}
        setGcashReference={setGcashReference}
        onConfirm={handleReceivePaymentConfirm}
      />

      <ConfirmOrderModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onContinue={handleConfirmContinue}
        isProcessing={isProcessingPayment}
      />

      <PaymentResultModal
        isOpen={isPaymentResultModalOpen}
        onClose={() => setIsPaymentResultModalOpen(false)}
        result={paymentResult}
      />

      <AddQuantityModal
        isOpen={isQuantityModalOpen}
        onClose={() => setIsQuantityModalOpen(false)}
        product={productToQuantity}
        onAddToOrder={handleAddQuantityToOrder}
      />
    </>
  );
}
