'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import { Loader } from '@/components/ai-elements/loader';
import { ReloadIcon, Copy01Icon, MoreHorizontalIcon, Message02Icon, MessageMultiple02Icon, Share03Icon, Archive03Icon, Delete02Icon, Loading03Icon, GiftIcon, Share05Icon, PinIcon, PinOffIcon, Edit03Icon, ArrowLeft01Icon, ArrowRight02Icon } from '@hugeicons/core-free-icons';
import { Icon } from '@/components/ui/icon';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { useChat, UIMessage } from '@ai-sdk/react';
import { subscriptionService } from '@/data/subscription';
import { chatService } from '@/data/chat';
import { chatsService } from '@/data/chats';
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

export function Chat({
  chatId,
  initialMessages,
  initialBranchId,
  initialModel,
  initialTitle,
  initialPinnedAt,
}: {
  chatId?: string
  initialMessages: UIMessage[]
  initialBranchId?: string | null
  initialModel?: string
  initialTitle?: string
  initialPinnedAt?: string | null
}) {
  const router = useRouter();
  const pathname = usePathname()
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<AttachmentData[]>([]);
  const attachmentsRef = useRef<AttachmentData[]>([]);
  const [model, setModel] = useState<string>(() => initialModel ?? models[0].value)
  const [title, setTitle] = useState(initialTitle ?? '')
  const [webSearch, setWebSearch] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [isPinned, setIsPinned] = useState(Boolean(initialPinnedAt))
  const [isLoading, setIsLoading] = useState(false);
  const [isTemporary, setIsTemporary] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false)
  const [spotlightChats, setSpotlightChats] = useState<{ id: string; title: string }[]>([])
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const editingTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [activeBranchId, setActiveBranchId] = useState<string | null>(initialBranchId ?? null)
  const [messageBranches, setMessageBranches] = useState<Record<string, { options: any[]; currentIndex: number; currentBranchId: string }>>({})

  const selectedModel = models.find((m) => m.value === model);
  const canWebSearch = modelSupportsWebSearch(model);
  const [isPro, setIsPro] = useState<boolean | null>(null);

  const getVersionText = (content: unknown): string => {
    if (typeof content === 'string') return content
    if (!content) return ''
    if (typeof (content as any)?.text === 'string') return (content as any).text
    return ''
  }

  const toUiMessages = (messages: any[]): UIMessage[] => {
    if (!Array.isArray(messages)) return []
    return messages
      .map((message) => {
        const content = message?.content
        const text = typeof content === 'string'
          ? content
          : typeof content?.text === 'string'
            ? content.text
            : typeof content?.content === 'string'
              ? content.content
              : null

        if (!text || (message.role !== 'user' && message.role !== 'assistant')) return null
        return {
          id: message.id,
          role: message.role,
          parts: [{ type: 'text', text }],
        } as UIMessage
      })
      .filter(Boolean) as UIMessage[]
  }

  const ensureMessageBranchesLoaded = async (messageId: string) => {
    if (!chatId) return
    if (messageBranches[messageId]) return
    try {
      const data = await chatsService.getMessageBranches(chatId, messageId, activeBranchId)
      const options = Array.isArray(data?.options) ? data.options : []
      if (options.length <= 1) return
      setMessageBranches((prev) => ({
        ...prev,
        [messageId]: {
          options,
          currentIndex: typeof data?.currentIndex === 'number' ? data.currentIndex : 0,
          currentBranchId: data?.currentBranchId ?? '',
        },
      }))
    } catch {
    }
  }

  const switchToBranch = async (branchId: string, sourceMessageId?: string, nextIndex?: number) => {
    if (!chatId) return

    if (sourceMessageId && typeof nextIndex === 'number') {
      setMessageBranches((prev) => {
        const current = prev[sourceMessageId]
        if (!current) return prev
        return {
          ...prev,
          [sourceMessageId]: {
            ...current,
            currentIndex: nextIndex,
            currentBranchId: branchId,
          },
        }
      })
    }

    await chatsService.selectBranch(chatId, branchId)
    const payload = await chatsService.getById(chatId, branchId)
    const chat = payload?.data
    const nextMessages = toUiMessages(chat?.messages)
    setMessages(nextMessages)
    setActiveBranchId(chat?.activeBranchId ?? branchId)

    if (sourceMessageId) {
      try {
        const data = await chatsService.getMessageBranches(chatId, sourceMessageId, chat?.activeBranchId ?? branchId)
        const options = Array.isArray(data?.options) ? data.options : []
        if (options.length > 1) {
          setMessageBranches((prev) => ({
            ...prev,
            [sourceMessageId]: {
              options,
              currentIndex: typeof data?.currentIndex === 'number' ? data.currentIndex : 0,
              currentBranchId: data?.currentBranchId ?? (chat?.activeBranchId ?? branchId),
            },
          }))
        }
      } catch {
      }
    }
  }

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

  const isNewChat = !chatId && messages.length === 0

  const lastUserMessageIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i]?.role === 'user') return i
    }
    return -1
  })()

  useEffect(() => {
    if (initialMessages.length) {
      setMessages(initialMessages);
    }
  }, [initialMessages, setMessages]);

  useEffect(() => {
    setActiveBranchId(initialBranchId ?? null)
  }, [initialBranchId])

  useEffect(() => {
    if (chatId) return
    const saved = localStorage.getItem(NEW_CHAT_MODEL_KEY)
    if (!saved) return
    if (!models.some((m) => m.value === saved)) return
    setModel(saved)
  }, [chatId])

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

  useEffect(() => {
    if (!spotlightOpen) return
    async function load() {
      try {
        const res = await chatsService.list()
        const data = res?.data
        setSpotlightChats(Array.isArray(data) ? data : [])
      } catch {
        setSpotlightChats([])
      }
    }
    load()
  }, [spotlightOpen])

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

      const streamFn = isTemporary ? chatService.streamTemporaryChat : chatService.streamChat;

      await streamFn({
        body: {
          messages: updatedMessages,
          model,
          webSearch: canWebSearch ? webSearch : false,
          chatId,
          branchId: activeBranchId,
        },
        onEvent: (ev) => {
          if (ev.type === 'chat.created') {
            createdChatId = ev.chatId;
            if (typeof ev.branchId === 'string') setActiveBranchId(ev.branchId)
            if (typeof window !== 'undefined' && !isTemporary) {
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

      if (!chatId && !isTemporary) {
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

  const handleShare = () => {
    if (!chatId) return;
    setShareDialogOpen(true);
    setIsLoading(true);
    startTransition(async () => {
      const result = await chatsService.share(chatId);
      const data = result?.data;
      if (result?.success && data?.sharePath) {
        const url = new URL(window.location.href);
        url.pathname = `/share/${data.sharePath}`;
        setShareLink(url.toString());
      }
      setIsLoading(false);
    });
  };

  const handleArchive = () => {
    if (!chatId) return;
    setIsLoading(true);
    startTransition(async () => {
      const result = await chatsService.archive(chatId);
      if (result?.success) {
        router.push('/chat');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('chats:refresh'));
        }
      }
      setIsLoading(false);
    });
  };

  const handleDelete = () => {
    if (!chatId) return;
    setIsLoading(true);
    startTransition(async () => {
      const result = await chatsService.delete(chatId);
      if (result?.success) {
        router.push('/chat');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('chats:refresh'));
        }
      }
      setIsLoading(false);
      setDeleteDialogOpen(false);
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
  };

  const handleOpenShareLink = () => {
    if (!shareLink) return;
    window.open(shareLink, '_blank', 'noopener,noreferrer');
  };

  const handleTemporaryChat = () => {
    setIsTemporary((prev) => !prev);
  };

  const handleTogglePin = () => {
    if (!chatId) return
    setIsLoading(true)
    startTransition(async () => {
      try {
        if (isPinned) {
          await chatsService.unpin(chatId)
          setIsPinned(false)
        } else {
          await chatsService.pin(chatId)
          setIsPinned(true)
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('chats:refresh'))
        }
      } finally {
        setIsLoading(false)
      }
    })
  }

  const handleOpenRename = () => {
    if (!chatId) return
    setRenameValue(title || initialTitle || '')
    setRenameDialogOpen(true)
  }

  const handleRename = () => {
    if (!chatId) return
    const nextTitle = renameValue.trim()
    if (!nextTitle) return
    setIsLoading(true)
    startTransition(async () => {
      try {
        await chatsService.rename({
          id: chatId,
          title: nextTitle,
        })
        setTitle(nextTitle)
        setRenameDialogOpen(false)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('chats:refresh'))
        }
        router.refresh()
      } finally {
        setIsLoading(false)
      }
    })
  }

  return (
    <div className="relative flex flex-col h-screen w-full mx-2 overflow-x-hidden overflow-hidden">
      <div className="absolute top-0 left-0 right-0 mt-1 flex items-center gap-2 z-20">
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
        {initialTitle && chatId && (
          <>
            <span className="absolute hidden md:block left-1/2 -translate-x-1/2 font-medium text-sm text-muted-foreground/60 truncate max-w-[50%]">{title || initialTitle}</span>
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Icon icon={MoreHorizontalIcon} className="size-5" />
                    <span className="sr-only">Mais opções</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleTogglePin} disabled={isPending || isLoading}>
                    <Icon
                      icon={isPinned ? PinOffIcon : PinIcon}
                      className="text-muted-foreground mr-2 h-4 w-4"
                    />
                    <span>{isPinned ? 'Desafixar' : 'Pinar'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOpenRename} disabled={isPending || isLoading}>
                    <Icon icon={Edit03Icon} className="text-muted-foreground mr-2 h-4 w-4" />
                    <span>Renomear</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleShare} disabled={isPending}>
                    <Icon icon={Share03Icon} className="text-muted-foreground mr-2 h-4 w-4" />
                    <span>Compartilhar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleArchive} disabled={isPending}>
                    <Icon icon={Archive03Icon} className="text-muted-foreground mr-2 h-4 w-4" />
                    <span>Arquivar</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="focus:bg-destructive/20"
                    onClick={() => setDeleteDialogOpen(true)}
                    disabled={isPending}
                  >
                    <Icon icon={Delete02Icon} className="text-muted-foreground mr-2 h-4 w-4" />
                    <span>Deletar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
        {!chatId && (
          <div className="ml-auto flex items-center gap-2">
            {isPro === false && (
              <Button
                onClick={() => router.push('/upgrade')}
                variant="secondary"
                className="h-8 md:hidden"
              >
                <Icon icon={GiftIcon} className="h-4 w-4" />
                Upgrade
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleTemporaryChat}
              title={isTemporary ? 'Voltar ao chat normal' : 'Conversa temporária'}
            >
              {isTemporary ? (
                <Icon icon={MessageMultiple02Icon} className="h-4 w-4" />
              ) : (
                <Icon icon={Message02Icon} className="h-4 w-4" />
              )}
              <span className="sr-only">{isTemporary ? 'Voltar ao chat normal' : 'Conversa temporária'}</span>
            </Button>
          </div>
        )}
        {!chatId && isPro === false && (
          <div className="absolute left-1/2 hidden -translate-x-1/2 md:block">
            <Button
              onClick={() => router.push('/upgrade')}
              variant="secondary"
              className="mb-1 h-9"
            >
              <Icon icon={GiftIcon} className="h-4 w-4" />
              Upgrade
            </Button>
          </div>
        )}
      </div>
      <div className="absolute top-0 left-0 right-0 h-16 bg-linear-to-b from-background via-background/95 to-transparent pointer-events-none z-10" />
      <SidebarInset className="flex-1 overflow-hidden mb-10">
        {isNewChat ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="w-full max-w-3xl">
              <h1 className="text-2xl md:text-2xl font-medium tracking-tight text-center">{isTemporary ? 'Chat temporário' : 'Como posso te ajudar?'}</h1>
              <div className="mt-6">
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
                                  <h4 className="font-semibold text-sm leading-none">{label}</h4>
                                  {attachment.mediaType && (
                                    <p className="font-mono text-muted-foreground text-xs">{attachment.mediaType}</p>
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
          </div>
        ) : (
          <div className="flex flex-col w-full mx-auto h-full">
            <div
              className="w-full max-w-3xl mx-auto flex-1 overflow-y-auto scrollbar-hidden"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              <Conversation className="relative size-full pt-12 pb-6">
                <ConversationContent>
                  {messages.map((message: UIMessage, messageIndex: number) => {
                    const messageStableId = message.id ?? `m-${messageIndex}`
                    const assistantMessageText = message.parts
                      ?.filter((part: any) => part.type === 'text')
                      .map((part: any) => (part as { text: string }).text)
                      .join('') || ''

                    const userMessageText = message.parts
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
                      <div key={messageStableId}>
                        <Message
                          from={message.role}
                          key={`mi-${messageStableId}`}
                        >
                          <div
                            className={
                              message.role === 'user'
                                ? (editingMessageId === messageStableId
                                  ? 'flex w-full flex-col items-stretch'
                                  : 'flex flex-col items-end')
                                : 'flex flex-col'
                            }
                          >
                            <MessageContent
                              className={editingMessageId === messageStableId ? 'w-full px-2 py-2' : undefined}
                            >
                              {message.parts?.map((part: any, i: number) => {
                                switch (part.type) {
                                  case 'text':
                                    const isLastMessage =
                                      messageIndex === messages.length - 1
                                    const isEditing = editingMessageId === messageStableId

                                    const syncEditingTextareaHeight = () => {
                                      const el = editingTextareaRef.current
                                      if (!el) return
                                      el.style.height = '0px'
                                      const next = Math.min(el.scrollHeight, 300)
                                      el.style.height = `${next}px`
                                    }

                                    const submitEdit = async () => {
                                      const nextText = editingText.trim()
                                      if (!nextText || isStreaming) return

                                      setEditingMessageId(null)
                                      setEditingText('')

                                      const updatedMessages = messages.map((m, idx) => {
                                        const stableId = m.id ?? `m-${idx}`
                                        if (stableId !== messageStableId) return m
                                        const nextParts = (m.parts ?? []).map((p: any) =>
                                          p.type === 'text' ? { ...p, text: nextText } : p
                                        )
                                        return { ...m, parts: nextParts }
                                      }).slice(0, messageIndex + 1)

                                      const assistantMessage: UIMessage = {
                                        id: (Date.now() + 1).toString(),
                                        role: 'assistant',
                                        parts: [{ type: 'text', text: '' }],
                                      }

                                      setMessages([...updatedMessages, assistantMessage])
                                      setIsStreaming(true)

                                      try {
                                        let accumulatedText = ''
                                        let createdChatId: string | null = null

                                        const streamFn = isTemporary ? chatService.streamTemporaryChat : chatService.streamChat

                                        await streamFn({
                                          body: {
                                            messages: updatedMessages,
                                            model,
                                            webSearch: canWebSearch ? webSearch : false,
                                            chatId,
                                            branchId: activeBranchId,
                                            isEdit: true,
                                            lastMessageId: messageStableId,
                                          },
                                          onEvent: (ev) => {
                                            if (ev.type === 'chat.created') {
                                              createdChatId = ev.chatId
                                              if (typeof ev.branchId === 'string') setActiveBranchId(ev.branchId)
                                              if (typeof window !== 'undefined' && !isTemporary) {
                                                window.dispatchEvent(new Event('chats:refresh'))
                                              }
                                            }

                                            if (ev.type === 'response.output_text.delta') {
                                              accumulatedText += ev.delta
                                              setMessages((prev: UIMessage[]) =>
                                                prev.map((msg: UIMessage) =>
                                                  msg.id === assistantMessage.id
                                                    ? { ...msg, parts: [{ type: 'text', text: accumulatedText }] }
                                                    : msg
                                                )
                                              )
                                            }

                                            if (ev.type === 'response.error') {
                                              throw new Error(ev.error)
                                            }
                                          },
                                        })

                                        setIsStreaming(false)

                                        if (!chatId && !isTemporary) {
                                          if (createdChatId) {
                                            router.push(`/chat/${createdChatId}`)
                                          }
                                        }
                                      } catch (error) {
                                        setIsStreaming(false)
                                        setMessages((prev: UIMessage[]) => prev.slice(0, -1))
                                        toast.error(toApiErrorPayload(error).error)
                                      }
                                    }

                                    const cancelEdit = () => {
                                      setEditingMessageId(null)
                                      setEditingText('')
                                    }

                                    return (
                                      <div key={`${messageStableId}-${i}`}>
                                        {isEditing ? (
                                          <div className="w-full">
                                            <div className="w-full rounded-3xl bg-muted/60 px-3 py-2">
                                              <textarea
                                                ref={editingTextareaRef}
                                                value={editingText}
                                                onChange={(e) => {
                                                  setEditingText(e.target.value)
                                                  syncEditingTextareaHeight()
                                                }}
                                                onFocus={syncEditingTextareaHeight}
                                                className="max-h-[300px] w-full resize-none overflow-y-auto bg-transparent text-sm outline-none"
                                                rows={1}
                                                autoFocus
                                              />
                                            </div>
                                            <div className="mt-2 flex justify-end gap-2">
                                              <Button size="sm" variant="secondary" onClick={cancelEdit}>
                                                Cancelar
                                              </Button>
                                              <Button size="sm" onClick={submitEdit} disabled={!editingText.trim()}>
                                                Enviar
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="group">
                                            <Response>{part.text}</Response>
                                          </div>
                                        )}
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
                                                <Icon icon={ReloadIcon} className="size-4" />
                                              </Action>
                                              <Action
                                                onClick={() =>
                                                  navigator.clipboard.writeText(part.text)
                                                }
                                                label="Copy"
                                              >
                                                <Icon icon={Copy01Icon} className="size-4" />
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
                            {message.role === 'user' && editingMessageId !== messageStableId && userMessageText.trim() && (
                              <div
                                className={
                                  messageBranches[messageStableId] && (messageBranches[messageStableId].options?.length ?? 0) > 1
                                    ? 'my-2 opacity-100'
                                    : 'my-2 opacity-0 transition-opacity group-hover:opacity-100'
                                }
                                onMouseEnter={() => {
                                  if (!chatId) return
                                  void ensureMessageBranchesLoaded(messageStableId)
                                }}
                              >
                                <Actions className="gap-2">
                                  <Action
                                    onClick={() => {
                                      setEditingMessageId(messageStableId)
                                      setEditingText(userMessageText)
                                      setTimeout(() => {
                                        const el = editingTextareaRef.current
                                        if (!el) return
                                        el.style.height = '0px'
                                        const next = Math.min(el.scrollHeight, 300)
                                        el.style.height = `${next}px`
                                      }, 0)
                                    }}
                                    label="Edit"
                                  >
                                    <Icon icon={Edit03Icon} className="size-4" />
                                  </Action>
                                  <Action
                                    onClick={() => navigator.clipboard.writeText(userMessageText)}
                                    label="Copy"
                                  >
                                    <Icon icon={Copy01Icon} className="size-4" />
                                  </Action>
                                  {chatId && messageBranches[messageStableId] && (messageBranches[messageStableId].options?.length ?? 0) > 1 && (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={async () => {
                                          const branchState = messageBranches[messageStableId]
                                          const nextIndex = branchState.currentIndex - 1
                                          if (nextIndex < 0) return
                                          const nextBranchId = branchState.options[nextIndex]?.branchId
                                          if (!nextBranchId) return
                                          await switchToBranch(nextBranchId, messageStableId, nextIndex)
                                        }}
                                        disabled={messageBranches[messageStableId].currentIndex === 0}
                                        className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                      >
                                        <Icon icon={ArrowLeft01Icon} className="size-4" />
                                      </button>
                                      <span className="text-xs text-muted-foreground min-w-[3ch] text-center">
                                        {messageBranches[messageStableId].currentIndex + 1}/{messageBranches[messageStableId].options.length}
                                      </span>
                                      <button
                                        onClick={async () => {
                                          const branchState = messageBranches[messageStableId]
                                          const nextIndex = branchState.currentIndex + 1
                                          if (nextIndex >= branchState.options.length) return
                                          const nextBranchId = branchState.options[nextIndex]?.branchId
                                          if (!nextBranchId) return
                                          await switchToBranch(nextBranchId, messageStableId, nextIndex)
                                        }}
                                        disabled={messageBranches[messageStableId].currentIndex === messageBranches[messageStableId].options.length - 1}
                                        className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                                      >
                                        <Icon icon={ArrowRight02Icon} className="size-4" />
                                      </button>
                                    </div>
                                  )}
                                </Actions>
                              </div>
                            )}
                          </div>
                        </Message>
                      </div>
                    )
                  })}
                  {status === 'submitted' && <Loader />}
                </ConversationContent>
                <ConversationScrollButton />
              </Conversation>
            </div>
          </div>
        )}
      </SidebarInset>
      {!isNewChat && (
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
                            <h4 className="font-semibold text-sm leading-none">{label}</h4>
                            {attachment.mediaType && (
                              <p className="font-mono text-muted-foreground text-xs">{attachment.mediaType}</p>
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
                onKeyDown={(e) => {
                  if (e.key === '/' && !input.trim()) {
                    e.preventDefault()
                    setSpotlightOpen(true)
                  }
                }}
                value={input}
              />
            </PromptInputContent>
          </PromptInput>
        </div>
      )}

      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compartilhar Chat</DialogTitle>
            <DialogDescription>
              Qualquer pessoa com este link poderá visualizar a conversa.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-x-2 w-full space-y-2">
            <Input
              id="link"
              defaultValue={shareLink}
              readOnly
              className="w-full h-10"
            />
            <div className="flex justify-end w-full gap-2">
              <Button onClick={handleOpenShareLink} size="sm" variant='secondary'>
                <Icon icon={Share05Icon} className="size-4" />
                <span>Abrir na guia</span>
              </Button>
              <Button onClick={copyToClipboard} size="sm">
                <span>Copiar</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este chat? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="destructive"
              className="h-10"
              onClick={handleDelete}
              disabled={isPending || isLoading}
            >
              {isLoading ? <Icon icon={Loading03Icon} className="mr-2 h-4 w-4 animate-spin" /> : "Excluir Chat"}
            </Button>
            <Button
              className="h-10"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isPending || isLoading}
            >
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear chat</DialogTitle>
            <DialogDescription>Defina um novo título para esta conversa.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="h-10"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setRenameDialogOpen(false)}
                disabled={isPending || isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRename}
                disabled={isPending || isLoading || !renameValue.trim()}
              >
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <CommandDialog open={spotlightOpen} onOpenChange={setSpotlightOpen} title="Buscar chat" description="Pesquise e navegue para um chat">
        <CommandInput placeholder="Buscar chats..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado.</CommandEmpty>
          <CommandGroup heading="Chats">
            {spotlightChats.map((c) => (
              <CommandItem key={c.id} value={c.title} onSelect={() => {
                setSpotlightOpen(false)
                router.push(`/chat/${c.id}`)
              }}>
                {c.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

    </div>
  )
}
