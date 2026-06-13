export const CATEGORY_FILTERS = [
  "All",
  "Generic",
  "Branded",
  "Infant",
  "Milk",
  "Diapers",
  "Vitamins",
  "Supplies",
  "Eyes Med",
  "Hygiene",
  "Injectables/Vials",
  "Cosmetics",
  "Cream/Ointment",
  "Unclassified",
];

export const PRICE_FILTERS = [
  "All",
  "Below 10",
  "10 - 50",
  "51 - 100",
  "101 - 200",
  "200 - 500",
  "500 and above",
];

export const STOCK_FILTERS = [
  "All",
  "Below 10",
  "10 - 50",
  "51 - 100",
  "101 - 200",
  "200 - 500",
  "500 and above",
];

export const STATUS_FILTERS = ["All", "Normal", "Low Stocks", "Expiring soon", "Expired"];

export const DUMMY_PRIORITY_RESTOCKS = [
  {
    id: "restock-dummy-1",
    name: "Biogesic 500mg",
    quantity: 8,
    velocity: "Slow",
    expiringInDays: 120,
  },
  {
    id: "restock-dummy-2",
    name: "Amoxicillin 250mg",
    quantity: 14,
    velocity: "Medium",
    expiringInDays: 90,
  },
  {
    id: "restock-dummy-3",
    name: "Vitamin C Chewable",
    quantity: 19,
    velocity: "Fast",
    expiringInDays: 150,
  },
];

export const DUMMY_EXPIRING_SOON = [
  {
    id: "expiry-dummy-1",
    name: "Mefenamic Acid 500mg",
    quantity: 26,
    velocity: "Medium",
    expiringInDays: 12,
  },
  {
    id: "expiry-dummy-2",
    name: "Cetirizine Syrup",
    quantity: 34,
    velocity: "Slow",
    expiringInDays: 18,
  },
  {
    id: "expiry-dummy-3",
    name: "Paracetamol Drops",
    quantity: 11,
    velocity: "Fast",
    expiringInDays: 24,
  },
];

export const ITEMS_PER_PAGE = 10;
