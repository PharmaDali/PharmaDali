let checkoutDraft = {
  items: [],
  branchLabel: '',
  total: 0,
};

export function setCheckoutDraft(payload) {
  checkoutDraft = {
    items: Array.isArray(payload?.items) ? payload.items : [],
    branchLabel: payload?.branchLabel || '',
    total: Number(payload?.total ?? 0),
  };
}

export function getCheckoutDraft() {
  return checkoutDraft;
}

export function clearCheckoutDraft() {
  checkoutDraft = {
    items: [],
    branchLabel: '',
    total: 0,
  };
}
