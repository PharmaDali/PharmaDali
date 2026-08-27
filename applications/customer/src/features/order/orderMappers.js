import BetadineImg from '@assets/images/betadine_img.png'

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

  return {
    id: Number(item?.id || 0),
    img: BetadineImg,
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
  if (onHoldReason.toLowerCase().startsWith('rejected by pharmacist: ')) {
    onHoldReason = onHoldReason.replace(/^rejected by pharmacist:\s*/i, '')
  }

  return {
    id: Number(order?.id || 0),
    rawStatus,
    status: toStatusLabel(rawStatus),
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
    prescriptionImagePath,
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
