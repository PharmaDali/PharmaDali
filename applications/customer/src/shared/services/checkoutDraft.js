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
    items: Array.isArray(payload?.items) ? payload.items : (checkoutDraft.items || []),
    selectedPharmacy: payload?.selectedPharmacy || payload?.targetPharmacy || checkoutDraft.selectedPharmacy || null,
    pharmacyLabel: payload?.pharmacyLabel !== undefined ? payload.pharmacyLabel : (checkoutDraft.pharmacyLabel || ''),
    pharmacyLocationLabel: payload?.pharmacyLocationLabel !== undefined ? payload.pharmacyLocationLabel : (checkoutDraft.pharmacyLocationLabel || ''),
    total: payload?.total !== undefined ? Number(payload.total) : (checkoutDraft.total || 0),
    orderId: payload?.orderId !== undefined ? (payload.orderId ? Number(payload.orderId) : null) : checkoutDraft.orderId,
    prescriptionImage: payload?.prescriptionImage !== undefined ? payload.prescriptionImage : checkoutDraft.prescriptionImage,
    prescriptionPrepared: payload?.prescriptionPrepared !== undefined ? Boolean(payload.prescriptionPrepared) : checkoutDraft.prescriptionPrepared,
    discountIdImage: payload?.discountIdImage !== undefined ? payload.discountIdImage : checkoutDraft.discountIdImage,
    discountType: payload?.discountType !== undefined ? payload.discountType : checkoutDraft.discountType,
    discountIdNumber: payload?.discountIdNumber !== undefined ? payload.discountIdNumber : (checkoutDraft.discountIdNumber || ''),
    gcashReceiptImage: payload?.gcashReceiptImage !== undefined ? payload.gcashReceiptImage : checkoutDraft.gcashReceiptImage,
    isPharmacyOpen: payload?.isPharmacyOpen !== undefined ? (payload.isPharmacyOpen !== false) : checkoutDraft.isPharmacyOpen,
    closedPharmacyName: payload?.closedPharmacyName !== undefined ? payload.closedPharmacyName : (checkoutDraft.closedPharmacyName || ''),
    pharmacyHoursLabel: payload?.pharmacyHoursLabel !== undefined ? payload.pharmacyHoursLabel : (checkoutDraft.pharmacyHoursLabel || ''),
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


