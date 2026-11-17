import { placeCustomerOrder, uploadCustomerDiscountId, uploadCustomerPaymentReceipt } from '@shared/services/orderService'
import { uploadOrderItemPrescription } from '@shared/services/prescriptionService'

export function buildSelectedCartItemIds(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => Number(item?.id))
    .filter((id) => Number.isFinite(id) && id > 0)
}

// Keep payload shaping and API submission in one place so checkout screens stay focused on UI.
export async function submitCheckoutOrder(
  {
    items,
    hasPrescription,
    prescriptionImage,
    discountIdImage,
    discountType,
    discountIdNumber,
    gcashReceiptImage,
    selectedPharmacyLabel,
    scheduledPickupAt,
    customerNote,
    paymentMethod = 'cash',
  },
  { onOrderCreated } = {},
) {
  const selectedCartItemIds = buildSelectedCartItemIds(items)

  const orderPayload = await placeCustomerOrder({
    paymentMethod: paymentMethod || 'cash',
    scheduledPickupAt: scheduledPickupAt.toISOString(),
    pickedUpAt: selectedPharmacyLabel,
    note: customerNote || null,
    cartItemIds: selectedCartItemIds,
  })

  let order = orderPayload?.data || {}
  const orderId = Number(order?.id ?? 0) || null
  const orderItems = Array.isArray(order?.items) ? order.items : []

  if (orderId && typeof onOrderCreated === 'function') {
    onOrderCreated(order)
  }

  const uploadTasks = [
    uploadPrescriptionItemsIfNeeded({
      hasPrescription,
      items,
      orderItems,
      prescriptionImage,
    }),
  ]

  if (orderId && discountIdImage?.uri) {
    uploadTasks.push(
      uploadCustomerDiscountId(orderId, discountIdImage, discountType, discountIdNumber)
        .then((res) => {
          if (res?.data && typeof res.data === 'object') {
            order = { ...order, ...res.data }
          }
        })
        .catch((err) => {
          console.warn('Failed to upload discount ID image:', err)
        }),
    )
  }

  if (orderId && gcashReceiptImage?.uri) {
    uploadTasks.push(
      uploadCustomerPaymentReceipt(orderId, gcashReceiptImage)
        .then((res) => {
          if (res?.data && typeof res.data === 'object') {
            order = { ...order, ...res.data }
          }
        })
        .catch((err) => {
          console.warn('Failed to upload GCash payment receipt image:', err)
        }),
    )
  }

  await Promise.all(uploadTasks)

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

  await Promise.all(
    prescriptionItems.map((item) => {
      const matchedOrderItem = orderItems.find(
        (orderItem) => Number(orderItem?.pharmacy_product_id) === Number(item?.pharmacyProductId),
      )

      const orderItemId = Number(matchedOrderItem?.id || 0)
      if (!orderItemId) {
        throw new Error('Unable to match prescription item to the created order.')
      }

      return uploadOrderItemPrescription(orderItemId, prescriptionImage)
    }),
  )
}
