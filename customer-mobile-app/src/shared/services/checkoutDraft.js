let checkoutDraft = {
  items: [],
  pharmacyLabel: '',
  total: 0,
  orderId: null,
  prescriptionImage: null,
  prescriptionPrepared: false,
};

export function setCheckoutDraft(payload) {
  checkoutDraft = {
    items: Array.isArray(payload?.items) ? payload.items : [],
    pharmacyLabel: payload?.pharmacyLabel || '',
    total: Number(payload?.total ?? 0),
    orderId: payload?.orderId ? Number(payload.orderId) : null,
    prescriptionImage: payload?.prescriptionImage || null,
    prescriptionPrepared: Boolean(payload?.prescriptionPrepared),
  };
}

export function getCheckoutDraft() {
  return checkoutDraft;
}

export function clearCheckoutDraft() {
  checkoutDraft = {
    items: [],
    pharmacyLabel: '',
    total: 0,
    orderId: null,
    prescriptionImage: null,
    prescriptionPrepared: false,
  };
}
