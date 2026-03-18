import { ScrollView, View } from 'react-native';
import React, { useMemo, useState } from 'react';
import { Tabs, ReadyOrderCard } from '@shared/components/pharmacist-orders-and-ready-components';
import BetadineImg from '@assets/images/betadine_img.png';
import MaleIcon from '@assets/icons/person-icons/male_icon.svg';
import FemaleIcon from '@assets/icons/person-icons/female_icon.svg';
import RecitImg from '@assets/images/recit_dummy.png';

const readyTabs = ['For Pickup', 'Completed', 'Expired'];

const initialReadyOrders = [
  {
    orderNumber: '2001',
    customerName: 'Denmar Redondo',
    customerAvatar: MaleIcon,
    pickupTime: 'Today, January 7 3 PM - 6 PM', 
    submittedAgo: '10 mins ago',
    orderTotal: '527.50',
    status: 'For Pickup',
    items: [
      { img: BetadineImg, description: 'Imodium 2mg 4s - Diarrhea Medicine, Loperamide', price: '80.25', quantity: 1, size: '2mg' },
      { img: BetadineImg, description: 'MEDIPLAST Sterilized Gauze Pads 4x4', price: '9.50', quantity: 1, size: '4x4' },
      { img: BetadineImg, description: 'LACRYVISC Carbomer 10g', price: '437.75', quantity: 1, size: '10g', prescriptionRequired: true, prescriptionImage: RecitImg },
    ],
  },
  {
    orderNumber: '2002',
    customerName: 'Jane Doe',
    customerAvatar: FemaleIcon,
    pickupTime: 'Today, January 7 3 PM - 6 PM',
    submittedAgo: '30 mins ago',
    orderTotal: '339.00',
    status: 'Completed',
    items: [
      { img: BetadineImg, description: 'Berocca Effervescent Tablet Orange Flavor 15s', price: '339.00', quantity: 1, size: '15s' },
      { img: BetadineImg, description: 'LACRYVISC Carbomer 10g', price: '437.75', quantity: 1, size: '10g', prescriptionRequired: true, prescriptionImage: RecitImg },
    ],
  },
  {
    orderNumber: '2003',
    customerName: 'John Smith',
    customerAvatar: MaleIcon,
    pickupTime: 'Yesterday, January 6 3 PM - 6 PM',
    submittedAgo: '1 day ago',
    orderTotal: '180.75',
    status: 'Expired',
    items: [
      { img: BetadineImg, description: 'Paracetamol 500mg 10s', price: '120.75', quantity: 1, size: '500mg' },
      { img: BetadineImg, description: 'Vitamin C 500mg 20s', price: '60.00', quantity: 1, size: '500mg' },
    ],
  },
];

const Ready = () => {
  const [activeTab, setActiveTab] = useState('For Pickup');
  const [readyOrders, setReadyOrders] = useState(initialReadyOrders);

  const handleMarkAsCompleted = (order) => {
    setReadyOrders((prev) =>
      prev.map((o) =>
        o.orderNumber === order.orderNumber
          ? { ...o, status: 'Completed' }
          : o
      )
    );
  };

  const filteredOrders = useMemo(
    () => readyOrders.filter((order) => order.status === activeTab),
    [activeTab, readyOrders]
  );

  return (
    <View className="flex-1 bg-gray-50">
      <Tabs activeTab={activeTab} onTabChange={setActiveTab} tabs={readyTabs} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {filteredOrders.map((order, idx) => (
          <ReadyOrderCard
            key={`${order.orderNumber}-${idx}`}
            order={order}
            onMarkAsCompleted={handleMarkAsCompleted}
          />
        ))}

        <View className="h-4" />
      </ScrollView>
    </View>
  );
};

export default Ready;