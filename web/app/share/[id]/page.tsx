import { notFound } from 'next/navigation';
import { Conversation, ConversationContent } from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
import { ScrollArea } from '@/components/ui/scroll-area';

export default async function SharedChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  if (!baseUrl) {
    notFound();
  }

  const res = await fetch(`${baseUrl}/api/public/chats/${id}`, { cache: 'no-store' });
  const payload = await res.json().catch(() => null);
  const chat = payload?.data ?? null;

  if (!chat) {
    notFound();
  }

  return (
    <div className="relative flex flex-col h-screen w-full p-4">
      <ScrollArea className="flex-grow overflow-y-auto h-full border rounded-md">
        <Conversation className="flex-grow overflow-y-auto w-full max-w-3xl mx-auto h-full">
          <ConversationContent>
            {chat?.messages.map((message: any) => (
              <div key={message.id}>
                <Message from={message.role as 'user' | 'assistant'}>
                  <MessageContent>
                    {typeof message.content === 'string' && <Response>{message.content}</Response>}
                  </MessageContent>
                </Message>
              </div>
            ))}
          </ConversationContent>
        </Conversation>
      </ScrollArea>
    </div>
  );
}
