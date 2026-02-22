import { streamSSE } from 'hono/streaming';
import { convertToModelMessages, streamText } from 'ai';
import { HTTPException } from 'hono/http-exception';
import type { Context } from 'hono';

import { chatRepository } from './../repositories/chat.repository.js';
import { messageRepository } from './../repositories/message.repository.js';
import { getUserUsage, incrementUserUsage } from './usage.service.js';
import crypto from 'node:crypto';

function extractLastUserMessageText(messages: any[]) {
  if (!Array.isArray(messages) || messages.length === 0) return '';
  const last = messages[messages.length - 1];
  if (Array.isArray(last?.parts)) {
    const p = last.parts.find((x: any) => x?.type === 'text');
    return typeof p?.text === 'string' ? p.text : '';
  }
  return typeof last?.content === 'string' ? last.content : '';
}

function toHistoryFromClient(rawMessages: any[]) {
  if (!Array.isArray(rawMessages)) return [];
  return rawMessages
    .map((m) => {
      const role = m?.role;
      if (role !== 'user' && role !== 'assistant') return null;

      let text: string | null = null;
      if (Array.isArray(m?.parts)) {
        const p = m.parts.find((x: any) => x?.type === 'text');
        if (typeof p?.text === 'string') text = p.text;
      } else if (typeof m?.content === 'string') {
        text = m.content;
      }

      if (!text) return null;
      return {
        id: typeof m?.id === 'string' ? m.id : crypto.randomUUID(),
        role,
        parts: [{ type: 'text' as const, text }],
      };
    })
    .filter(Boolean) as any[];
}

export async function handleChatSse(c: Context) {
  const user = c.get('user') as { id: string } | null;
  if (!user?.id) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  c.header('Content-Type', 'text/event-stream; charset=utf-8');
  c.header('Cache-Control', 'no-cache, no-transform');
  c.header('Connection', 'keep-alive');
  c.header('X-Accel-Buffering', 'no');

  const body = await c.req.json();
  const rawMessages = Array.isArray(body?.messages) ? body.messages : body?.messages ?? [];
  const model: string | undefined = body?.model;
  let chatId: string | null = body?.chatId ?? null;

  if (!Array.isArray(rawMessages) || rawMessages.length === 0) {
    throw new HTTPException(400, { message: 'Invalid request: messages array is required' });
  }

  const usage = await getUserUsage(user.id);
  if (!usage || usage.limitReached) {
    throw new HTTPException(403, { message: 'Message limit reached' });
  }

  const userText = extractLastUserMessageText(rawMessages);
  if (!userText) {
    throw new HTTPException(400, { message: 'Invalid request: last message text is required' });
  }

  if (chatId) {
    const existing = await chatRepository.findMetaForUser(chatId, user.id);
    if (!existing) {
      chatId = null;
    }
  }

  if (!chatId) {
    const created = await chatRepository.create(user.id, userText.substring(0, 50));
    chatId = created.id;
  }

  await messageRepository.create(chatId, 'user', { type: 'text', text: userText });
  await incrementUserUsage(user.id);

  const history = toHistoryFromClient(rawMessages);
  const selectedModel = model || 'google/gemini-2.5-flash';
  let assistantText = '';

  return streamSSE(c, async (stream) => {
    await stream.writeSSE({
      event: 'message',
      data: JSON.stringify({ type: 'chat.created', chatId }),
    });

    stream.onAbort(async () => {
      try {
        if (assistantText.trim()) {
          await messageRepository.create(chatId!, 'assistant', { type: 'text', text: assistantText });
        }
      } catch {
      }
    });

    try {
      const modelMessages = await convertToModelMessages(history);
      const result = streamText({
        model: selectedModel,
        messages: modelMessages,
        system: 'You are a helpful assistant that can answer questions and help with tasks',
      });

      for await (const delta of result.textStream) {
        assistantText += delta;
        await stream.writeSSE({
          event: 'message',
          data: JSON.stringify({ type: 'response.output_text.delta', delta }),
        });
      }

      await messageRepository.create(chatId!, 'assistant', { type: 'text', text: assistantText });

      await stream.writeSSE({ event: 'message', data: JSON.stringify({ type: 'response.completed', chatId }) });
      await stream.writeSSE({ event: 'message', data: '[DONE]' });
    } catch (err: any) {
      await stream.writeSSE({
        event: 'message',
        data: JSON.stringify({ type: 'response.error', error: err?.message || 'AI service temporarily unavailable' }),
      });
      await stream.writeSSE({ event: 'message', data: '[DONE]' });
    }
  });
}
