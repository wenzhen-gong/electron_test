import { apiUrl } from '../config';
import type { ChatRequest, ChatResponse } from '../model/chat';

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const response = await fetch(apiUrl('/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    credentials: 'include'
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message =
      typeof body.error === 'string' ? body.error : `Chat request failed (${response.status})`;
    throw new Error(message);
  }

  return response.json() as Promise<ChatResponse>;
}
