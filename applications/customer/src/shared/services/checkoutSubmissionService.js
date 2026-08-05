import { placeCustomerOrder } from '@shared/services/orderService'
import { uploadOrderItemPrescription } from '@shared/services/prescriptionService'

export function buildSelectedCartItemIds(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => Number(item?.id))
    .filter((id) => Number.isFinite(id) && id > 0)
}

// Keep payload shaping and API submission in one place so checkout screens stay focused on UI.
export async function submitCheckoutOrder({
  items,
  hasPrescription,
  prescriptionImage,
  selectedPharmacyLabel,
  scheduledPickupAt,
  customerNote,
}) {
  const selectedCartItemIds = buildSelectedCartItemIds(items)

  const orderPayload = await placeCustomerOrder({
    paymentMethod: 'cash',
    scheduledPickupAt: scheduledPickupAt.toISOString(),
    pickedUpAt: selectedPharmacyLabel,
    note: customerNote || null,
    cartItemIds: selectedCartItemIds,
  })

  const order = orderPayload?.data || {}
  const orderItems = Array.isArray(order?.items) ? order.items : []

  await uploadPrescriptionItemsIfNeeded({
    hasPrescription,
    items,
    orderItems,
    prescriptionImage,
  })

  return {
    order,
    orderId: Number(order?.id ?? 0) || null,
  }
}

// Order item matching uses pharmacy_product_id because cart/order item ids are different entities.
async function uploadPrescriptionItemsIfNeeded({
  hasPrescription,
  items,
  orderItems,
  prescriptionImage,
}) {
  if (!hasPrescription) {
    return
  }

  const prescriptionItems = (Array.isArray(items) ? items : []).filter((item) => item?.prescriptionRequired)

  for (const item of prescriptionItems) {
    const matchedOrderItem = orderItems.find(
      (orderItem) => Number(orderItem?.pharmacy_product_id) === Number(item?.pharmacyProductId),
    )

    const orderItemId = Number(matchedOrderItem?.id || 0)
    if (!orderItemId) {
      throw new Error('Unable to match prescription item to the created order.')
    }

    await uploadOrderItemPrescription(orderItemId, prescriptionImage)
  }
}
