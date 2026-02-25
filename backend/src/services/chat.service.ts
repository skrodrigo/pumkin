import type { Context } from 'hono';
import { handleChatSse, handleTemporaryChatSse } from './chat-core.service.js';

export async function handleChatRequestFromApi(c: Context) {
  return handleChatSse(c);
}

export async function handleTemporaryChatRequestFromApi(c: Context) {
  return handleTemporaryChatSse(c);
}
