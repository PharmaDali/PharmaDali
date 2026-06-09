import { apiRequest } from '@shared/api/client';

const unwrapList = (payload) => payload?.data?.data ?? payload?.data ?? [];

export async function getPharmacistChatContacts() {
  const payload = await apiRequest('/pharmacist/messages/conversations');
  return unwrapList(payload);
}

export async function getPharmacistConversations() {
  const payload = await apiRequest('/pharmacist/messages/conversations');
  return unwrapList(payload);
}

export async function startPharmacistConversation(orderId) {
  const payload = await apiRequest('/pharmacist/messages/conversations', {
    method: 'POST',
    body: { order_id: orderId },
  });

  return payload?.data ?? null;
}

export async function getPharmacistConversation(conversationId) {
  const payload = await apiRequest(`/pharmacist/messages/conversations/${conversationId}`);
  return payload?.data ?? null;
}

export async function sendPharmacistMessage(conversationId, body, imageFile = null) {
  if (imageFile) {
    const formData = new FormData();
    if (body) {
      formData.append('body', body);
    }
    
    const fileUri = imageFile.uri;
    const fileName = imageFile.fileName || imageFile.name || `chat-image-${Date.now()}.jpg`;
    const fileType = imageFile.mimeType || imageFile.type || 'image/jpeg';
    
    formData.append('image', {
      uri: fileUri,
      name: fileName,
      type: fileType,
    });

    const payload = await apiRequest(`/pharmacist/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: formData,
    });

    return payload?.data ?? null;
  } else {
    const payload = await apiRequest(`/pharmacist/messages/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: { body },
    });

    return payload?.data ?? null;
  }
}

