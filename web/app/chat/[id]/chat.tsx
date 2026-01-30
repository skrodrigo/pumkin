'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Loader } from '@/components/ai-elements/loader';
import { UpgradePage } from '@/components/common/upgrade-page';
import { GlobeIcon, RefreshCcwIcon, CopyIcon } from 'lucide-react';
import Image from 'next/image';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputButton,
  PromptInputSubmit
} from '@/components/ai-elements/prompt-input';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Response } from '@/components/ai-elements/response';
import { Actions, Action } from '@/components/ai-elements/actions';
import {
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ScrollArea } from '@/components/ui/scroll-area';
// @ts-ignore
import { useChat, UIMessage } from '@ai-sdk/react';
import { getSubscription } from '@/server/stripe/get-subscription';

const models = [
  {
    name: 'Gemini 2.5',
    value: 'gemini/gemini-2.5-flash',
    icon: <Image src="/models/gemini.svg" alt="Gemini" width={24} height={24} priority quality={100} />,
  },
  {
    name: 'Chat GPT 5',
    value: 'openai/gpt-5-nano',
    icon: <Image src="/models/chatgpt.svg" alt="openai" width={24} height={24} priority quality={100} />,
  },
  {
    name: 'Chat GPT 4.1',
    value: 'openai/gpt-4.1-nano',
    icon: <Image src="/models/chatgpt.svg" alt="openai" width={24} height={24} priority quality={100} />,
  },
  {
    name: 'Claude 4 Sonnet',
    value: 'anthropic/claude-4-sonnet',
    icon: <Image src="/models/claude.svg" alt="claude" width={24} height={24} priority quality={100} />,
    off: true,
  },
  {
    name: 'DeepSeek V3',
    value: 'deepseek/deepseek-v3',
    icon: <Image src="/models/deepseek.svg" alt="deepseek" width={24} height={24} priority quality={100} />,
  },
];

export function Chat({ chatId, initialMessages }: { chatId?: string; initialMessages: UIMessage[] }) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [model, setModel] = useState<string>(models[0].value);
  const [webSearch, setWebSearch] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showUpgradePage, setShowUpgradePage] = useState(false);

  const selectedModel = models.find((m) => m.value === model);
  const [isPro, setIsPro] = useState<boolean | null>(null);

  const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  const { messages, status, regenerate, setMessages } = useChat({
    onError: (error: any) => {
      try {
        const errorBody = JSON.parse(error.message);
        if (errorBody.error === 'Message limit reached') {
          setShowUpgradePage(true);
        }
      } catch (e) { }
    },
  });

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, setMessages]);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const subscription = await getSubscription();
        const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
        setIsPro(isActive && subscription?.plan?.toLowerCase() === 'pro');
      } catch (error) {
        setIsPro(false);
      }
    };
    checkSubscription();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    if (isPro === false) {
      setShowUpgradePage(true);
      return;
    }

    setInput('');

    const userMessage: UIMessage = {
      id: Date.now().toString(),
      role: 'user',
      parts: [{ type: 'text', text: trimmedInput }],
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    const assistantMessage: UIMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      parts: [{ type: 'text', text: '' }],
    };

    setMessages([...updatedMessages, assistantMessage]);
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          model,
          webSearch,
          chatId,
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        accumulatedText += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, parts: [{ type: 'text', text: accumulatedText }] }
              : msg
          )
        );
      }

      setIsStreaming(false);

      if (!chatId) {
        const newId = getCookie('chatId');
        if (newId) {
          router.push(`/chat/${newId}`);
          router.refresh();
        }
      }
    } catch (error) {
      setIsStreaming(false);
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  return (
    <>
      {showUpgradePage && <UpgradePage onClose={() => setShowUpgradePage(false)} />}
      <div className="relative flex flex-col h-screen w-full mx-2">
        <SidebarTrigger className="my-2 sticky top-2" />
        <SidebarInset className="overflow-hidden flex-1 mb-24">
          <div className="flex flex-col w-full mx-auto h-full">
            <ScrollArea className="flex-grow overflow-y-auto h-full">
              <Conversation className="flex-grow overflow-y-auto w-full max-w-3xl mx-auto h-full">
                <ConversationContent>
                  {messages.map((message: UIMessage, messageIndex: number) => {
                    const assistantMessageText = message.parts
                      ?.filter(part => part.type === 'text')
                      .map(part => (part as { text: string }).text)
                      .join('') || '';
                    const isEmptyAssistantMessage =
                      message.role === 'assistant' &&
                      assistantMessageText.trim() === '' &&
                      isStreaming;

                    if (isEmptyAssistantMessage) {
                      return <Loader key={message.id ?? `m-${messageIndex}`} />;
                    }

                    return (
                      <div key={message.id ?? `m-${messageIndex}`}>
                        <Message from={message.role} key={message.id ?? `mi-${messageIndex}`}>
                          <MessageContent>
                            {message.parts?.map((part: any, i: number) => {
                              switch (part.type) {
                                case 'text':
                                  const isLastMessage = messageIndex === messages.length - 1;
                                  return (
                                    <div key={`${message.id}-${i}`}>
                                      <Response>{part.text}</Response>
                                      {message.role === 'assistant' && isLastMessage && part.text && (
                                        <Actions className="mt-2">
                                          <Action
                                            onClick={() =>
                                              regenerate({
                                                body: {
                                                  model: model,
                                                  webSearch: webSearch,
                                                  chatId: chatId,
                                                },
                                              })
                                            }
                                            label="Retry"
                                          >
                                            <RefreshCcwIcon className="size-3" />
                                          </Action>
                                          <Action
                                            onClick={() =>
                                              navigator.clipboard.writeText(part.text)
                                            }
                                            label="Copy"
                                          >
                                            <CopyIcon className="size-3" />
                                          </Action>
                                        </Actions>
                                      )}
                                    </div>
                                  );
                                case 'reasoning':
                                  return (
                                    <Reasoning
                                      key={`${message.id}-${i}`}
                                      className="w-full"
                                      isStreaming={status === 'streaming'}
                                    >
                                      <ReasoningTrigger />
                                      <ReasoningContent>{part.text}</ReasoningContent>
                                    </Reasoning>
                                  );
                                default:
                                  return null;
                              }
                            })}
                          </MessageContent>
                        </Message>
                      </div>
                    );
                  })}
                  {status === 'submitted' && <Loader />}
                </ConversationContent>
                <ConversationScrollButton />
              </Conversation>
            </ScrollArea>
          </div>
        </SidebarInset>
        <div className="absolute bottom-0 left-0 right-0 p-1 border border-border bg-muted/20 backdrop-blur-xl rounded-2xl w-full max-w-3xl mx-auto">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
            <PromptInputToolbar>
              <PromptInputTools>
                <PromptInputModelSelect
                  onValueChange={(value) => {
                    setModel(value);
                  }}
                  value={model}
                >
                  <PromptInputModelSelectTrigger>
                    {selectedModel && (
                      <div className="flex items-center gap-2">
                        {selectedModel.icon}
                        <span className="font-medium">{selectedModel.name}</span>
                      </div>
                    )}
                  </PromptInputModelSelectTrigger>
                  <PromptInputModelSelectContent>
                    {models.map((model) => {
                      const Icon = model.icon;
                      return (
                        <PromptInputModelSelectItem
                          key={model.value}
                          value={model.value}
                          disabled={model.off}
                        >
                          <div className="flex items-center gap-2">
                            {Icon}
                            <span className="font-medium">{model.name}</span>
                            {model.off && (
                              <span className="text-xs text-amber-500">Em breve</span>
                            )}
                          </div>
                        </PromptInputModelSelectItem>
                      );
                    })}
                  </PromptInputModelSelectContent>
                </PromptInputModelSelect>
                <PromptInputButton
                  variant={webSearch ? 'default' : 'ghost'}
                  onClick={() => setWebSearch(!webSearch)}
                >
                  <GlobeIcon size={16} />
                  <span className="hidden sm:flex">Pesquisar</span>
                </PromptInputButton>
              </PromptInputTools>
              <PromptInputSubmit disabled={!input} status={status} />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </>
  );
}
