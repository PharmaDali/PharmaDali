import BetadineImg from '@assets/images/betadine_img.png'

export const activeOrders = [
  {
    orderNumber: '06',
    date: 'January 25, 2026, 10:00am',
    status: 'Pending',
    products: [
      { img: BetadineImg, description: 'Berocca Effervescent Tablet Orange Flavor 15s', price: 'P339.00', quantity: 1, size: '15s' },
    ],
    orderSummary: 'P339.00',
  },
  {
    orderNumber: '06',
    date: 'January 25, 2026, 10:00am',
    status: 'Preparing',
    products: [
      { img: BetadineImg, description: 'Berocca Effervescent Tablet Orange Flavor 15s', price: 'P339.00', quantity: 1, size: '15s' },
    ],
    orderSummary: 'P339.00',
  },
  {
    orderNumber: '1028',
    date: 'January 07, 2026, 10:00am',
    status: 'Approved',
    products: [
      { img: BetadineImg, description: 'Imodium 2mg 4s - Diarrhea Medicine, Loperamide', price: 'P80.25', quantity: 1, size: '2mg' },
      { img: BetadineImg, description: 'LACRYVISC Carbomer 10g', price: 'P437.75', quantity: 0, size: '10g', prescriptionRequired: true },
      { img: BetadineImg, description: 'MEDIPLAST Sterilized Gauze Pads 4x4', price: 'P9.50', quantity: 1, size: '4x4' },
    ],
    orderSummary: 'P527.50',
  },
]

export const completedOrders = [
  {
    orderNumber: '05',
    date: 'January 20, 2026, 10:00am',
    status: 'Completed',
    products: [
      { img: BetadineImg, description: 'Tolak Angin Care Essential Oil Roll On 10ml', price: 'P50.00', quantity: 1, size: '10ml' },
    ],
    orderSummary: 'P339.00',
  },
  {
    orderNumber: '04',
    date: 'January 10, 2026, 10:00am',
    status: 'Rejected',
    products: [
      { img: BetadineImg, description: 'Acnetrex Isotretinoin 20mg 20 Softgel Capsule', price: 'P1,530.00', quantity: 1, size: '20mg', prescriptionRequired: true },
    ],
    orderSummary: 'P1,530.00',
  },
]

export const orderDetailsMap = {
  '04': {
    orderNumber: '04',
    date: 'January 10, 2026, 10:00am',
    status: 'Rejected',
    products: [
      { img: BetadineImg, description: 'Acnetrex Isotretinoin 20mg 20 Softgel Capsule', price: 'P1,530.00', quantity: 1, size: '20mg', prescriptionRequired: true },
    ],
    reason: 'Your order has been rejected for the following reason:\nA Medical Prescription is required.',
  },
  '05': {
    orderNumber: '05',
    date: 'January 20, 2026, 10:00am',
    status: 'Completed',
    products: [
      { img: BetadineImg, description: 'Tolak Angin Care Essential Oil Roll On 10ml', price: 'P50.00', quantity: 1, size: '10ml' },
    ],
    reason: null,
  },
}
