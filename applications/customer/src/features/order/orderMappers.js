const COMPLETED_STATUSES = new Set(['completed', 'cancelled', 'overdue'])

const STATUS_LABELS = {
  pending: 'Pending',
  reviewing: 'Reviewing',
  preparing: 'Preparing',
  stand_by: 'On Hold',
  ready_for_pickup: 'Ready for Pickup',
  completed: 'Completed',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
  approved: 'Approved',
  awaiting_payment: 'Awaiting Payment',
}

function formatCurrency(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) {
    return 'PHP 0.00'
  }

  return `PHP ${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatOrderDate(value) {
  if (!value) {
    return 'Date unavailable'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return date.toLocaleString('en-PH', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function toStatusLabel(rawStatus) {
  const key = String(rawStatus || '').toLowerCase()

  if (STATUS_LABELS[key]) {
    return STATUS_LABELS[key]
  }

  if (!key) {
    return 'Pending'
  }

  return key
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function mapOrderProduct(item) {
  const pharmacyProduct = item?.pharmacyProduct || item?.pharmacy_product || null
  const product = pharmacyProduct?.product || null
  const categoryName = pharmacyProduct?.category?.category_name || ''

  const description =
    item?.product_name ||
    product?.product_name ||
    product?.brand_name ||
    product?.generic_name ||
    'Unnamed product'

  const prescriptionRequired = Boolean(Number(product?.is_prescribed ?? 0))
  const rxDescription = prescriptionRequired
    ? (product?.description || 'Please provide a valid prescription for this medicine.')
    : ''
  if (product && pharmacyProduct?.category) {
    product.category = pharmacyProduct.category;
  }

  return {
    id: Number(item?.id || 0),
    img: product?.image_url || null,
    product,
    categoryName,
    description,
    price: formatCurrency(item?.unit_price_snapshot),
    quantity: Number(item?.quantity || 0),
    sizeLabel: product?.size ? 'Size' : (product?.strength ? 'Dosage' : 'Size'),
    size: product?.size || product?.strength || 'N/A',
    prescriptionRequired,
    rxDescription,
  }
}

export function mapApiOrderToViewModel(order) {
  const rawStatusFromApi = String(order?.status || '').toLowerCase()
  const items = Array.isArray(order?.items) ? order.items : []
  const reason = order?.cancellation_reason || ''

  const baseUrl = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/+$/, '').replace(/\/api$/, '')
  const prescriptionItem = items.find((item) => {
    const rx = item?.order_item_prescription || item?.orderItemPrescription
    return rx?.prescription_image_path
  })
  const rxRecord = prescriptionItem?.order_item_prescription || prescriptionItem?.orderItemPrescription
  const prescriptionImagePath = rxRecord?.prescription_image_path ? `${baseUrl}/storage/${rxRecord.prescription_image_path}` : null

  // Logic to distinguish between Rejected (by Pharmacist) and Cancelled (by Customer)
  let rawStatus = rawStatusFromApi
  if (rawStatusFromApi === 'cancelled') {
    if (reason.toLowerCase().includes('rejected by pharmacist')) {
      rawStatus = 'rejected'
    } else {
      rawStatus = 'cancelled'
    }
  }

  let onHoldReason = reason || order?.discount_remarks || order?.note || ''
  onHoldReason = onHoldReason
    .replace(/^rejected by pharmacist:\s*/i, '')
    .replace(/^rejected:\s*/i, '')
    .replace(/^acknowledged_rejected:\s*/i, '')
    .replace(/^payment receipt unverified:\s*/i, '')
    .replace(/^.*payment receipt rejected:\s*/i, '')
    .replace(/^.*customer acknowledged payment issue:\s*/i, '')

  // Determine specialized badges based on section rejections
  let displayStatus = toStatusLabel(rawStatus);
  let customRawStatus = rawStatus;

  // If order is stand_by because of a prescription issue
  if (rawStatus === 'stand_by' && reason.toLowerCase().includes('prescription rejected')) {
    displayStatus = 'Rejected';
  }

  // If ID is rejected, show ID Rejected (but don't override completed/cancelled states)
  const hasAcknowledgedDiscount = order?.discount_remarks?.toLowerCase().startsWith('acknowledged_rejected:');
  const hasAcknowledgedPayment = order?.note?.toLowerCase().includes('customer acknowledged payment issue');
  
  const isDiscountRejected = order?.discount_remarks?.toLowerCase().includes('rejected') && !hasAcknowledgedDiscount;
  const isReceiptRejected = order?.payment_status === 'failed' && !hasAcknowledgedPayment;
  
  const hasAcknowledged = hasAcknowledgedDiscount || hasAcknowledgedPayment;

  // awaiting_payment should never be overridden by rejection logic
  if (rawStatus === 'awaiting_payment') {
    displayStatus = 'Awaiting Payment';
    customRawStatus = 'awaiting_payment';
  } else if (!COMPLETED_STATUSES.has(rawStatus) && rawStatus !== 'rejected') {
    if (isDiscountRejected && isReceiptRejected) {
      displayStatus = 'Action Required';
    } else if (isDiscountRejected) {
      displayStatus = 'ID Rejected';
      customRawStatus = 'id_rejected';
    } else if (isReceiptRejected) {
      displayStatus = 'Receipt Rejected';
      customRawStatus = 'receipt_rejected';
    } else if (hasAcknowledged && (rawStatus === 'pending' || rawStatus === 'reviewing' || rawStatus === 'stand_by')) {
      displayStatus = 'Reviewing';
      customRawStatus = 'reviewing';
    }
  }

  return {
    id: Number(order?.id || 0),
    rawStatus: customRawStatus,
    status: displayStatus,
    orderNumber: order?.order_number || String(order?.id || '-'),
    date: formatOrderDate(order?.placed_at || order?.created_at),
    products: items.map(mapOrderProduct),
    orderSummary: formatCurrency(order?.total_amount ?? order?.subtotal ?? 0),
    reason: reason || null,
    onHoldReason: onHoldReason || 'Your order is currently on hold by the pharmacist.',
    cancellationReason: order?.cancellation_reason || '',
    discountRemarks: order?.discount_remarks || '',
    note: order?.note || '',
    paymentStatus: order?.payment_status || '',
    paymentMethod: order?.payment_method || '',
    prescriptionImagePath,
    discountIdImagePath: order?.discount_id_image_path ? `${baseUrl}/storage/${order.discount_id_image_path}` : null,
    paymentReceiptImagePath: order?.payment_receipt_image_path ? `${baseUrl}/storage/${order.payment_receipt_image_path}` : null,
  }
}

export function splitOrdersByTab(orders) {
  const active = []
  const completed = []

  for (const order of orders) {
    if (COMPLETED_STATUSES.has(order.rawStatus) || order.rawStatus === 'rejected') {
      completed.push(order)
      continue
    }

    active.push(order)
  }

  return { active, completed }
}
