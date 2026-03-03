import { Chat } from './chat';
import { getApiBaseUrl, requireAuthToken } from '@/data/bff';
import type { UIMessage } from '@ai-sdk/react';
import { Metadata } from 'next';

export const revalidate = 30;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  const auth = await requireAuthToken();
  if (auth.ok) {
    const upstream = await fetch(`${getApiBaseUrl()}/api/chats/${id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      next: {
        tags: [`chats:list`, `chat:${id}`],
        revalidate: 30,
      },
    });
    const payload = await upstream.json().catch(() => null);
    const chat = payload?.data ?? null;
    if (chat?.title) {
      return {
        title: chat.title,
      };
    }
  }

  return {
    title: 'Chat',
  };
}

function toUiMessages(messages: any[]): UIMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .map((message) => {
      const content = message?.content;
      if (message.role !== 'user' && message.role !== 'assistant') return null;

      let parsedContent = content;
      if (typeof content === 'string') {
        try {
          parsedContent = JSON.parse(content);
        } catch {
          parsedContent = { type: 'text', text: content };
        }
      }

      if (parsedContent?.type === 'file' && typeof parsedContent?.url === 'string') {
        return {
          id: message.id,
          role: message.role,
          parts: [
            {
              type: 'file',
              url: parsedContent.url,
              mediaType: typeof parsedContent?.mediaType === 'string' ? parsedContent.mediaType : undefined,
            },
          ],
        } as UIMessage;
      }

      const text = typeof parsedContent === 'string'
        ? parsedContent
        : typeof parsedContent?.text === 'string'
          ? parsedContent.text
          : typeof parsedContent?.content === 'string'
            ? parsedContent.content
            : null;

      if (!text) return null;

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
  let initialPinnedAt: string | null = null
  let initialBranchId: string | null = null

  const auth = await requireAuthToken();
  if (auth.ok) {
    const upstream = await fetch(`${getApiBaseUrl()}/api/chats/${id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      next: {
        tags: [`chats:list`, `chat:${id}`],
        revalidate: 30,
      },
    });
    const payload = await upstream.json().catch(() => null);
    const chat = payload?.data ?? null;
    if (chat?.messages) {
      initialMessages = toUiMessages(chat.messages);
    }
    if (chat?.activeBranchId) {
      initialBranchId = chat.activeBranchId
    }
    if (chat?.model) {
      initialModel = chat.model;
    }
    if (chat?.title) {
      initialTitle = chat.title;
    }
    if (chat?.pinnedAt) {
      initialPinnedAt = chat.pinnedAt
    }
  }

  return (
    <Chat
      key={id}
      chatId={id}
      initialMessages={initialMessages}
      initialBranchId={initialBranchId}
      initialModel={initialModel}
      initialTitle={initialTitle}
      initialPinnedAt={initialPinnedAt}
    />
  )
}
