let checkoutDraft = {
  items: [],
  selectedPharmacy: null,
  pharmacyLabel: '',
  pharmacyLocationLabel: '',
  total: 0,
  orderId: null,
  prescriptionImage: null,
  prescriptionPrepared: false,
  discountIdImage: null,
  discountType: null,
  discountIdNumber: '',
  gcashReceiptImage: null,
  isPharmacyOpen: true,
  closedPharmacyName: '',
  pharmacyHoursLabel: '',
};

export function setCheckoutDraft(payload) {
  checkoutDraft = {
    items: Array.isArray(payload?.items) ? payload.items : [],
    selectedPharmacy: payload?.selectedPharmacy || payload?.targetPharmacy || checkoutDraft.selectedPharmacy || null,
    pharmacyLabel: payload?.pharmacyLabel || '',
    pharmacyLocationLabel: payload?.pharmacyLocationLabel || '',
    total: Number(payload?.total ?? 0),
    orderId: payload?.orderId ? Number(payload.orderId) : null,
    prescriptionImage: payload?.prescriptionImage || null,
    prescriptionPrepared: Boolean(payload?.prescriptionPrepared),
    discountIdImage: payload?.discountIdImage || null,
    discountType: payload?.discountType || null,
    discountIdNumber: payload?.discountIdNumber || '',
    gcashReceiptImage: payload?.gcashReceiptImage || null,
    isPharmacyOpen: payload?.isPharmacyOpen !== false,
    closedPharmacyName: payload?.closedPharmacyName || '',
    pharmacyHoursLabel: payload?.pharmacyHoursLabel || '',
  };
}

export function getCheckoutDraft() {
  return checkoutDraft;
}

export function clearCheckoutDraft() {
  checkoutDraft = {
    items: [],
    selectedPharmacy: null,
    pharmacyLabel: '',
    pharmacyLocationLabel: '',
    total: 0,
    orderId: null,
    prescriptionImage: null,
    prescriptionPrepared: false,
    discountIdImage: null,
    discountType: null,
    discountIdNumber: '',
    gcashReceiptImage: null,
    isPharmacyOpen: true,
    closedPharmacyName: '',
    pharmacyHoursLabel: '',
  };
}


