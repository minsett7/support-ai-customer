const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${BACKEND_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
  } catch (error) {
    throw new Error('Backend not reachable. Please make sure the chat backend is running.');
  }

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    throw new Error('Backend returned an invalid response.');
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || 'Request failed.');
  }

  return payload.data;
}

export function createChatSession({ customerFullName, category, briefDescription }) {
  return request('/api/chat/sessions', {
    method: 'POST',
    body: JSON.stringify({
      customerFullName,
      category,
      briefDescription
    })
  });
}

export function getChatSession(sessionId) {
  return request(`/api/chat/sessions/${sessionId}`);
}

export function getChatMessages(sessionId) {
  return request(`/api/chat/sessions/${sessionId}/messages`);
}

export function closeChatSession(sessionId) {
  return request(`/api/chat/sessions/${sessionId}/close`, {
    method: 'PATCH'
  });
}

export function createSupportTicket({
  customerFullName,
  category,
  priority,
  subject,
  description
}) {
  return request('/api/tickets', {
    method: 'POST',
    body: JSON.stringify({
      customerFullName,
      category,
      priority,
      subject,
      description
    })
  });
}

export function trackSupportTicket(trackingCode) {
  return request(`/api/tickets/track/${encodeURIComponent(trackingCode.trim().toUpperCase())}`);
}

export function createCustomerTicketReply(trackingCode, message) {
  return request(
    `/api/tickets/${encodeURIComponent(trackingCode.trim().toUpperCase())}/customer-replies`,
    {
      method: 'POST',
      body: JSON.stringify({ message })
    }
  );
}

export { BACKEND_URL };
