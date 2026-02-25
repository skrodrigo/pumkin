'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Loader } from '@/components/ai-elements/loader';
import { RefreshCcwIcon, CopyIcon } from 'lucide-react';
import Image from 'next/image';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputModelSelect,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputSubmit,
  PromptInputAttachmentButton,
  PromptInputContent,
  PromptInputWebSearchButton
} from '@/components/ai-elements/prompt-input';
import {
  Attachments,
  Attachment,
  AttachmentHoverCard,
  AttachmentHoverCardContent,
  AttachmentHoverCardTrigger,
  AttachmentInfo,
  AttachmentPreview,
  AttachmentRemove,
  getAttachmentLabel,
  getMediaCategory,
} from '@/components/ai-elements/attachments';
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
import { useChat, UIMessage } from '@ai-sdk/react';
import { subscriptionService } from '@/data/subscription';
import { chatService } from '@/data/chat';
import { toast } from 'sonner';
import { toApiErrorPayload } from '@/data/api-error';
import { modelSupportsWebSearch } from '@/data/model-capabilities';
import { nanoid } from 'nanoid';
import type { AttachmentData } from '@/components/ai-elements/attachments';

const models = [
  {
    name: 'Gemini',
    value: 'google/gemini-2.5-flash',
    icon: <Image src="/models/gemini.svg" alt="Gemini" width={20} height={20} priority quality={100} />,
  },
  {
    name: 'ChatGPT',
    value: 'openai/gpt-5-nano',
    icon: <Image src="/models/chatgpt.svg" alt="openai" width={20} height={20} priority quality={100} />,
  },
  {
    name: 'Claude',
    value: 'anthropic/claude-haiku-4.5',
    icon: <Image src="/models/claude.svg" alt="claude" width={20} height={20} priority quality={100} />,
    off: false,
  },
  {
    name: 'DeepSeek',
    value: 'deepseek/deepseek-v3.2',
    icon: <Image src="/models/deepseek.svg" alt="deepseek" width={20} height={20} priority quality={100} />,
  },
  {
    name: 'Kimi',
    value: 'moonshotai/kimi-k2.5',
    icon: <Image src="/models/kimi.svg" alt="moonshotai" width={18} height={18} priority quality={100} />,
  },
  {
    name: 'MiniMax',
    value: 'minimax/minimax-m2.5',
    icon: <Image src="/models/minimax.png" alt="minimax" width={20} height={20} priority quality={100} />,
  },
  {
    name: 'Grok',
    value: 'xai/grok-code-fast-1',
    icon: <Image src="/models/grok.svg" alt="xai" width={20} height={20} priority quality={100} />,
  },
  {
    name: 'GLM',
    value: 'zai/glm-5',
    icon: <Image src="/models/zai.svg" alt="zai" width={20} height={20} priority quality={100} />,
  },
  {
    name: 'Qwen',
    value: 'alibaba/qwen3.5-plus',
    icon: <Image src="/models/qwen.svg" alt="alibaba" width={20} height={20} priority quality={100} />,
  },
  {
    name: 'Llama',
    value: 'meta/llama-3.3-70b',
    icon: <Image src="/models/llama.svg" alt="meta" width={20} height={20} priority quality={100} />,
  },
  {
    name: 'Perplexity',
    value: 'perplexity/sonar',
    icon: <Image src="/models/perplexity.svg" alt="perplexity" width={20} height={20} priority quality={100} />,
  },
];

const NEW_CHAT_MODEL_KEY = 'new-chat-model';

export function Chat({ chatId, initialMessages, initialModel }: { chatId?: string; initialMessages: UIMessage[]; initialModel?: string }) {
  const router = useRouter();
  const pathname = usePathname()
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<AttachmentData[]>([]);
  const attachmentsRef = useRef<AttachmentData[]>([]);
  const [model, setModel] = useState<string>(() => {
    if (chatId && initialModel) return initialModel;
    if (!chatId && typeof window !== 'undefined') {
      const saved = localStorage.getItem(NEW_CHAT_MODEL_KEY);
      if (saved && models.some(m => m.value === saved)) return saved;
    }
    return initialModel ?? models[0].value;
  });
  const [webSearch, setWebSearch] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const selectedModel = models.find((m) => m.value === model);
  const canWebSearch = modelSupportsWebSearch(model);
  const [isPro, setIsPro] = useState<boolean | null>(null);

  const { messages, status, regenerate, setMessages } = useChat({
    onError: (error: any) => {
      try {
        const errorBody = JSON.parse(error.message);
        if (errorBody.error === 'Message limit reached') {
          const returnTo = pathname ? `?returnTo=${encodeURIComponent(pathname)}` : ''
          router.push(`/upgrade${returnTo}`)
        }
      } catch (e) { }
    },
  });

  useEffect(() => {
    if (initialMessages.length) {
      setMessages(initialMessages);
    }
  }, [initialMessages, setMessages]);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    return () => {
      for (const attachment of attachmentsRef.current) {
        if (attachment.type !== 'file') continue;
        if (!attachment.url) continue;
        URL.revokeObjectURL(attachment.url);
      }
    };
  }, []);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const subscription = await subscriptionService.get();
        const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
        setIsPro(Boolean(isActive));
      } catch (error) {
        setIsPro(false);
      }
    };
    checkSubscription();
  }, []);

  function handleAddAttachments(files: File[]) {
    const next = files.map<AttachmentData>((file) => ({
      id: nanoid(),
      type: 'file',
      filename: file.name,
      mediaType: file.type,
      url: URL.createObjectURL(file),
    }));
    setAttachments((prev) => [...prev, ...next]);
  }

  function handleRemoveAttachment(id: string) {
    setAttachments((prev) => {
      const current = prev.find((a) => a.id === id);
      if (current?.type === 'file' && current.url) {
        URL.revokeObjectURL(current.url);
      }
      return prev.filter((a) => a.id !== id);
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isStreaming) return;

    if (isPro === false) {
      const returnTo = pathname ? `?returnTo=${encodeURIComponent(pathname)}` : ''
      router.push(`/upgrade${returnTo}`)
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
      let accumulatedText = '';

      let createdChatId: string | null = null;

      await chatService.streamChat({
        body: {
          messages: updatedMessages,
          model,
          webSearch: canWebSearch ? webSearch : false,
          chatId,
        },
        onEvent: (ev) => {
          if (ev.type === 'chat.created') {
            createdChatId = ev.chatId;
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new Event('chats:refresh'));
            }
          }

          if (ev.type === 'response.output_text.delta') {
            accumulatedText += ev.delta;
            setMessages((prev: UIMessage[]) =>
              prev.map((msg: UIMessage) =>
                msg.id === assistantMessage.id
                  ? { ...msg, parts: [{ type: 'text', text: accumulatedText }] }
                  : msg
              )
            );
          }

          if (ev.type === 'response.error') {
            throw new Error(ev.error);
          }
        },
      });

      setIsStreaming(false);

      if (!chatId) {
        if (createdChatId) {
          router.push(`/chat/${createdChatId}`);
        }
      }
    } catch (error) {
      setIsStreaming(false);
      setMessages((prev: UIMessage[]) => prev.slice(0, -1));
      toast.error(toApiErrorPayload(error).error);
    }
  };

  return (
    <div className="relative flex flex-col h-screen w-full mx-2">
      <div className="my-2 sticky top-2 flex items-center gap-2">
        <SidebarTrigger />
        <PromptInputModelSelect
          onValueChange={async (value) => {
            setModel(value)
            if (!modelSupportsWebSearch(value)) {
              setWebSearch(false)
            }
            if (chatId) {
              try {
                await chatService.updateModel(chatId, value)
              } catch { }
            } else {
              localStorage.setItem(NEW_CHAT_MODEL_KEY, value)
            }
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
              const Icon = model.icon
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
                      <span className="text-xs text-amber-500">
                        Em breve
                      </span>
                    )}
                  </div>
                </PromptInputModelSelectItem>
              )
            })}
          </PromptInputModelSelectContent>
        </PromptInputModelSelect>
      </div>
      <SidebarInset className="overflow-hidden flex-1 mb-10">
        <div className="flex flex-col w-full mx-auto h-full">
          <ScrollArea className="grow overflow-y-auto h-full">
            <Conversation className="grow overflow-y-auto w-full max-w-3xl mx-auto h-full">
              <ConversationContent>
                {messages.map((message: UIMessage, messageIndex: number) => {
                  const assistantMessageText = message.parts
                    ?.filter((part: any) => part.type === 'text')
                    .map((part: any) => (part as { text: string }).text)
                    .join('') || ''

                  const isEmptyAssistantMessage =
                    message.role === 'assistant' &&
                    assistantMessageText.trim() === '' &&
                    isStreaming

                  if (isEmptyAssistantMessage) {
                    return <Loader key={message.id ?? `m-${messageIndex}`} />
                  }

                  return (
                    <div key={message.id ?? `m-${messageIndex}`}>
                      <Message
                        from={message.role}
                        key={message.id ?? `mi-${messageIndex}`}
                      >
                        <MessageContent>
                          {message.parts?.map((part: any, i: number) => {
                            switch (part.type) {
                              case 'text':
                                const isLastMessage = messageIndex === messages.length - 1
                                return (
                                  <div key={`${message.id}-${i}`}>
                                    <Response>{part.text}</Response>
                                    {message.role === 'assistant' &&
                                      isLastMessage &&
                                      part.text && (
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
                                )
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
                                )
                              default:
                                return null
                            }
                          })}
                        </MessageContent>
                      </Message>
                    </div>
                  )
                })}
                {status === 'submitted' && <Loader />}
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          </ScrollArea>
        </div>
      </SidebarInset>

      <div className="absolute bottom-4 left-0 right-0 rounded-md w-full max-w-3xl mx-auto">
        {attachments.length > 0 && (
          <div className="mb-2 px-2">
            <Attachments variant="inline">
              {attachments.map((attachment) => {
                const mediaCategory = getMediaCategory(attachment)
                const label = getAttachmentLabel(attachment)

                return (
                  <AttachmentHoverCard key={attachment.id}>
                    <AttachmentHoverCardTrigger asChild>
                      <Attachment
                        data={attachment}
                        onRemove={() => handleRemoveAttachment(attachment.id)}
                      >
                        <AttachmentPreview className="size-5 rounded bg-background" />
                        <AttachmentInfo className="pr-6" />
                        <AttachmentRemove
                          className="absolute right-1 dark:hover:bg-transparent hover:bg-transparent"
                          label="Remove"
                        />
                      </Attachment>
                    </AttachmentHoverCardTrigger>
                    <AttachmentHoverCardContent>
                      <div className="space-y-3">
                        {mediaCategory === 'image' &&
                          attachment.type === 'file' &&
                          attachment.url && (
                            <div className="flex max-h-96 w-80 items-center justify-center overflow-hidden rounded-md border">
                              <img
                                alt={label}
                                className="max-h-full max-w-full object-contain"
                                height={384}
                                src={attachment.url}
                                width={320}
                              />
                            </div>
                          )}
                        <div className="space-y-1 px-0.5">
                          <h4 className="font-semibold text-sm leading-none">
                            {label}
                          </h4>
                          {attachment.mediaType && (
                            <p className="font-mono text-muted-foreground text-xs">
                              {attachment.mediaType}
                            </p>
                          )}
                        </div>
                      </div>
                    </AttachmentHoverCardContent>
                  </AttachmentHoverCard>
                )
              })}
            </Attachments>
          </div>
        )}

        <PromptInput onSubmit={handleSubmit}>
          <PromptInputContent
            leftContent={
              <>
                <PromptInputAttachmentButton
                  onFilesSelected={handleAddAttachments}
                  variant="ghost"
                  className="h-8 w-8"
                />
                {canWebSearch && (
                  <PromptInputWebSearchButton
                    active={webSearch}
                    onClick={() => setWebSearch(!webSearch)}
                  />
                )}
              </>
            }
            rightContent={<PromptInputSubmit disabled={!input || isStreaming} status={isStreaming ? 'streaming' : status} className="h-8 w-8" />}
          >
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputContent>
        </PromptInput>
      </div>
    </div>
  )
}
