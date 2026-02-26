import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Conversation, ConversationContent } from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Response } from '@/components/ai-elements/response';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { Icon } from '@/components/ui/icon';
import Image from 'next/image';

function getMessageText(message: any) {
  const directParts = Array.isArray(message?.parts) ? message.parts : null;
  if (directParts) {
    const part = directParts.find((p: any) => p?.type === 'text');
    if (typeof part?.text === 'string') return part.text;
  }

  const content = message?.content;
  if (typeof content === 'string') return content;
  if (typeof content?.text === 'string') return content.text;
  if (typeof content?.content === 'string') return content.content;

  const contentParts = Array.isArray(content?.parts) ? content.parts : null;
  if (contentParts) {
    const part = contentParts.find((p: any) => p?.type === 'text');
    if (typeof part?.text === 'string') return part.text;
  }

  return null;
}

export default async function SharedChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;
  if (!baseUrl) {
    notFound();
  }

  const res = await fetch(`${baseUrl}/api/public/chats/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    notFound();
  }
  const payload = await res.json().catch(() => null);
  const chat = payload?.data ?? null;

  if (!chat) {
    notFound();
  }

  const messages = Array.isArray(chat?.messages) ? chat.messages : [];

  return (
    <div className="relative flex flex-col h-screen w-full p-4">
      <ScrollArea className="grow overflow-y-auto h-full rounded-md">
        <Conversation className="grow overflow-y-auto w-full max-w-3xl mx-auto h-full">
          <ConversationContent>
            {messages.map((message: any) => {
              const role = message?.role;
              if (role !== 'user' && role !== 'assistant') return null;

              const text = getMessageText(message);
              if (!text) return null;

              return (
                <div key={message.id}>
                  <Message from={role}>
                    <MessageContent>
                      <Response>{text}</Response>
                    </MessageContent>
                  </Message>
                </div>
              );
            })}
          </ConversationContent>
        </Conversation>
      </ScrollArea>
      <div className="fixed bottom-4 left-0 right-0 flex justify-center px-4">
        <div className='bg-accent mr-2 border-t border-b border-border/80 rounded-full w-12 h-12 flex items-center justify-center'>
          <Image src="/logos/pumkin.svg" alt="Logo" width={20} height={20} />
        </div>
        <Button asChild className='group' variant="default">
          <Link href="/chat">
            <span>Continue para o pumkin</span>
            <Icon icon={ArrowRight01Icon} className="group-hover:ml-3  size-4 transition-all" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
