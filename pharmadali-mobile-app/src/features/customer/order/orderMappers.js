import BetadineImg from '@assets/images/betadine_img.png'

const COMPLETED_STATUSES = new Set(['completed', 'cancelled'])

const STATUS_LABELS = {
  pending: 'Pending',
  reviewing: 'Reviewing',
  preparing: 'Preparing',
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
    return '₱0.00'
  }

  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
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
  const description =
    item?.product_name ||
    item?.branchProduct?.product?.product_name ||
    item?.branchProduct?.product?.brand_name ||
    item?.branchProduct?.product?.generic_name ||
    'Unnamed product'

  return {
    img: BetadineImg,
    description,
    price: formatCurrency(item?.unit_price_snapshot),
    quantity: Number(item?.quantity || 0),
    size: item?.branchProduct?.product?.strength || item?.branchProduct?.product?.form || 'N/A',
    prescriptionRequired: Boolean(item?.branchProduct?.product?.is_prescribed),
  }
}

export function mapApiOrderToViewModel(order) {
  const rawStatus = String(order?.status || '').toLowerCase()
  const items = Array.isArray(order?.items) ? order.items : []

  return {
    id: Number(order?.id || 0),
    rawStatus,
    status: toStatusLabel(rawStatus),
    orderNumber: order?.order_number || String(order?.id || '-'),
    date: formatOrderDate(order?.placed_at || order?.created_at),
    products: items.map(mapOrderProduct),
    orderSummary: formatCurrency(order?.total_amount ?? order?.subtotal ?? 0),
    reason: order?.cancellation_reason || null,
  }
}

export function splitOrdersByTab(orders) {
  const active = []
  const completed = []

  for (const order of orders) {
    if (COMPLETED_STATUSES.has(order.rawStatus)) {
      completed.push(order)
      continue
    }

    active.push(order)
  }

  return { active, completed }
}
