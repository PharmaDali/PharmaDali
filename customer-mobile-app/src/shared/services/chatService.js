import { apiRequest } from '@shared/api/client';

const unwrapList = (payload) => payload?.data?.data ?? payload?.data ?? [];

export async function getCustomerChatContacts() {
  const payload = await apiRequest('/customer/messages/conversations');
  return unwrapList(payload);
}

export async function getCustomerConversations() {
  const payload = await apiRequest('/customer/messages/conversations');
  return unwrapList(payload);
}

export async function startCustomerConversation(orderId) {
  const payload = await apiRequest('/customer/messages/conversations', {
    method: 'POST',
    body: { order_id: orderId },
  });

  return payload?.data ?? null;
}

export async function getCustomerConversation(conversationId) {
  const payload = await apiRequest(`/customer/messages/conversations/${conversationId}`);
  return payload?.data ?? null;
}

export async function sendCustomerMessage(conversationId, body) {
  const payload = await apiRequest(`/customer/messages/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: { body },
  });

  return payload?.data ?? null;
}
