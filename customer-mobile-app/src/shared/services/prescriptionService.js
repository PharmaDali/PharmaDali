import { apiRequest } from '@shared/api/client';

export async function uploadOrderItemPrescription(orderItemId, imageAsset) {
  if (!orderItemId) {
    throw new Error('Order item id is required.');
  }

  if (!imageAsset?.uri) {
    throw new Error('Prescription image is required.');
  }

  const filename = imageAsset.fileName || `prescription-${orderItemId}.jpg`;
  const mimeType = imageAsset.mimeType || 'image/jpeg';

  const formData = new FormData();
  formData.append('prescription_image', {
    uri: imageAsset.uri,
    name: filename,
    type: mimeType,
  });

  return apiRequest(`/customer/order-items/${orderItemId}/prescription`, {
    method: 'POST',
    body: formData,
  });
}

