import { Chat } from './chat';
import { getApiBaseUrl, requireAuthToken } from '@/data/bff';
import type { UIMessage } from '@ai-sdk/react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function toUiMessages(messages: any[]): UIMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .map((message) => {
      const content = message?.content;
      const text = typeof content === 'string'
        ? content
        : typeof content?.text === 'string'
          ? content.text
          : typeof content?.content === 'string'
            ? content.content
            : null;

      if (!text || (message.role !== 'user' && message.role !== 'assistant')) return null;
      return {
        id: message.id,
        role: message.role,
        parts: [{ type: 'text', text }],
      } as UIMessage;
    })
    .filter(Boolean) as UIMessage[];
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let initialMessages: UIMessage[] = [];
  let initialModel: string | undefined;
  let initialTitle: string | undefined;

  const auth = await requireAuthToken();
  if (auth.ok) {
    const upstream = await fetch(`${getApiBaseUrl()}/api/chats/${id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      cache: 'no-store',
    });
    const payload = await upstream.json().catch(() => null);
    const chat = payload?.data ?? null;
    if (chat?.messages) {
      initialMessages = toUiMessages(chat.messages);
    }
    if (chat?.model) {
      initialModel = chat.model;
    }
    if (chat?.title) {
      initialTitle = chat.title;
    }
  }

  return <Chat key={id} chatId={id} initialMessages={initialMessages} initialModel={initialModel} initialTitle={initialTitle} />;
}
