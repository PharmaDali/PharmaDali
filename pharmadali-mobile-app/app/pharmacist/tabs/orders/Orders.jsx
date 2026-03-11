import { View, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { OrderTabs, ReviewOrderCard, PreparingOrderCard, IssueOrderCard } from '@shared/components/pharmacist-orders-components';
import BetadineImg from '@assets/images/betadine_img.png';
import MaleIcon from '@assets/icons/person-icons/male_icon.svg';
import FemaleIcon from '@assets/icons/person-icons/female_icon.svg';
import RecitImg from '@assets/images/recit_dummy.png';

// Dummy data — replace with API data
const initialOrders = [
  {
    orderNumber: '1028',
    customerName: 'Denmar Redondo',
    customerAvatar: MaleIcon,
    pickupTime: 'Today, January 7 3 PM - 6 PM',
    submittedAgo: '10 mins ago',
    orderTotal: '527.50',
    status: 'For Review',
    items: [
      { img: BetadineImg, description: 'Imodium 2mg 4s - Diarrhea Medicine, Loperamide', price: '80.25', quantity: 1, size: '2mg' },
      { img: BetadineImg, description: 'MEDIPLAST Sterilized Gauze Pads 4x4', price: '9.50', quantity: 1, size: '4x4' },
      { img: BetadineImg, description: 'LACRYVISC Carbomer 10g', price: '437.75', quantity: 1, size: '10g', prescriptionRequired: true, prescriptionImage: RecitImg },
    ],
  },
  {
    orderNumber: '1027',
    customerName: 'Jane Doe',
    customerAvatar: FemaleIcon,
    pickupTime: 'Today, January 7 3 PM - 6 PM',
    submittedAgo: '10 mins ago',
    orderTotal: '339.00',
    status: 'For Review',
    items: [
      { img: BetadineImg, description: 'Berocca Effervescent Tablet Orange Flavor 15s', price: '339.00', quantity: 1, size: '15s' },
      { img: BetadineImg, description: 'LACRYVISC Carbomer 10g', price: '437.75', quantity: 1, size: '10g', prescriptionRequired: true, prescriptionImage: RecitImg },
    ],
  },
];

export default function Orders() {
  const [activeTab, setActiveTab] = useState('For Review');
  const [orders, setOrders] = useState(initialOrders);

  const forReviewOrders = orders.filter((o) => o.status === 'For Review');
  const preparingOrders = orders.filter((o) => o.status === 'Preparing');
  const issueOrders = orders.filter((o) => o.status === 'Issues');

  const handleApprove = (order, item) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderNumber !== order.orderNumber) return o;

        const updatedItems = o.items.map((i) =>
          i === item ? { ...i, status: 'Approved' } : i
        );

        // Move to Preparing once all Rx items are approved
        const allRxApproved = updatedItems
          .filter((i) => i.prescriptionRequired)
          .every((i) => i.status === 'Approved');

        return {
          ...o,
          items: updatedItems,
          status: allRxApproved ? 'Preparing' : o.status,
        };
      })
    );
  };

  const handleReject = (order, item) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.orderNumber !== order.orderNumber) return o;

        const updatedItems = o.items.map((i) =>
          i === item ? { ...i, status: 'Rejected', rejectionReason: 'Invalid Prescription' } : i
        );

        return {
          ...o,
          items: updatedItems,
          status: 'Issues',
        };
      })
    );
  };

  const handleMarkAsReady = (order) => {
    // TODO: handle mark as ready logic
  };

  return (
    <View className="flex-1 bg-gray-50">
      <OrderTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {activeTab === 'For Review' &&
          forReviewOrders.map((order, idx) => (
            <ReviewOrderCard key={idx} order={order} onApprove={handleApprove} onReject={handleReject} />
          ))}

        {activeTab === 'Preparing' &&
          preparingOrders.map((order, idx) => (
            <PreparingOrderCard key={idx} order={order} onMarkAsReady={handleMarkAsReady} />
          ))}

        {activeTab === 'Issues' &&
          issueOrders.map((order, idx) => (
            <IssueOrderCard key={idx} order={order} />
          ))}

        <View className="h-4" />
      </ScrollView>
    </View>
  );
}