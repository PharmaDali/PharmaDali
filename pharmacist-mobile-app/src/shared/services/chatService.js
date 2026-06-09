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

export async function sendPharmacistMessage(conversationId, body) {
  const payload = await apiRequest(`/pharmacist/messages/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: { body },
  });

  return payload?.data ?? null;
}
