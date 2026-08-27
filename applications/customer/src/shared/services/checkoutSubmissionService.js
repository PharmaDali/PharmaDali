import { placeCustomerOrder, uploadCustomerDiscountId, uploadCustomerPaymentReceipt } from '@shared/services/orderService'
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
  discountIdImage,
  discountType,
  gcashReceiptImage,
  selectedPharmacyLabel,
  scheduledPickupAt,
  customerNote,
  paymentMethod = 'cash',
}) {
  const selectedCartItemIds = buildSelectedCartItemIds(items)

  const orderPayload = await placeCustomerOrder({
    paymentMethod: paymentMethod || 'cash',
    scheduledPickupAt: scheduledPickupAt.toISOString(),
    pickedUpAt: selectedPharmacyLabel,
    note: customerNote || null,
    cartItemIds: selectedCartItemIds,
  })

  const order = orderPayload?.data || {}
  const orderId = Number(order?.id ?? 0) || null
  const orderItems = Array.isArray(order?.items) ? order.items : []

  await uploadPrescriptionItemsIfNeeded({
    hasPrescription,
    items,
    orderItems,
    prescriptionImage,
  })

  if (orderId && discountIdImage?.uri) {
    try {
      await uploadCustomerDiscountId(orderId, discountIdImage, discountType)
    } catch (err) {
      console.warn('Failed to upload discount ID image:', err)
    }
  }

  if (orderId && gcashReceiptImage?.uri) {
    try {
      await uploadCustomerPaymentReceipt(orderId, gcashReceiptImage)
    } catch (err) {
      console.warn('Failed to upload GCash payment receipt image:', err)
    }
  }

  return {
    order,
    orderId,
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
