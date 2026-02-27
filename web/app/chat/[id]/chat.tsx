'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MoreHorizontalIcon, Message02Icon, MessageMultiple02Icon, Share03Icon, Archive03Icon, Delete02Icon, GiftIcon, PinIcon, PinOffIcon, Edit03Icon } from '@hugeicons/core-free-icons';
import { Icon } from '@/components/ui/icon';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
import { Button } from '@/components/ui/button';
import { useChat, UIMessage } from '@ai-sdk/react';
import { subscriptionService } from '@/data/subscription';
import { chatService } from '@/data/chat';
import { chatsService } from '@/data/chats';
import { toast } from 'sonner';
import { toApiErrorPayload } from '@/data/api-error';
import { modelSupportsWebSearch } from '@/data/model-capabilities';
import { nanoid } from 'nanoid';
import type { AttachmentData } from '@/components/ai-elements/attachments';
import { AttachmentsInline } from './_components/attachments-inline'
import { ChatMessages } from './_components/chat-messages'
import { DeleteDialog } from './_components/delete-dialog'
import { RenameDialog } from './_components/rename-dialog'
import { ShareDialog } from './_components/share-dialog'
import { SpotlightDialog } from './_components/spotlight-dialog'

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
  const [activeBranchId, setActiveBranchId] = useState<string | null>(initialBranchId ?? null)

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

  const isNewChat = !chatId && messages.length === 0

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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PromptInputModelSelectTrigger>
                  {selectedModel && (
                    <div className="flex items-center gap-2">
                      {selectedModel.icon}
                      <span className="font-medium">{selectedModel.name}</span>
                    </div>
                  )}
                </PromptInputModelSelectTrigger>
              </TooltipTrigger>
              <TooltipContent sideOffset={6}>Selecionar modelo</TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
                <TooltipProvider>
                  <Tooltip>
                    <DropdownMenuTrigger asChild>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Icon icon={MoreHorizontalIcon} className="size-5" />
                          <span className="sr-only">Mais opções</span>
                        </Button>
                      </TooltipTrigger>
                    </DropdownMenuTrigger>
                    <TooltipContent sideOffset={6}>Mais opções</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
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
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>
                  {isTemporary ? 'Voltar ao chat normal' : 'Conversa temporária'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
                <AttachmentsInline
                  attachments={attachments}
                  onRemoveAttachment={handleRemoveAttachment}
                />
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
          <ChatMessages
            chatId={chatId}
            activeBranchId={activeBranchId}
            canWebSearch={canWebSearch}
            isStreaming={isStreaming}
            isTemporary={isTemporary}
            messages={messages}
            model={model}
            status={status}
            webSearch={webSearch}
            setActiveBranchId={setActiveBranchId}
            setIsStreaming={setIsStreaming}
            setMessages={setMessages}
            regenerate={regenerate}
            router={router}
          />
        )}
      </SidebarInset>
      {!isNewChat && (
        <div className="absolute bottom-4 left-0 right-0 rounded-md w-full max-w-3xl mx-auto">
          <AttachmentsInline
            attachments={attachments}
            onRemoveAttachment={handleRemoveAttachment}
          />
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

      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        shareLink={shareLink}
        onOpenShareLink={handleOpenShareLink}
        onCopy={copyToClipboard}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        isPending={isPending}
        isLoading={isLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      <RenameDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        value={renameValue}
        onChangeValue={setRenameValue}
        isPending={isPending}
        isLoading={isLoading}
        onCancel={() => setRenameDialogOpen(false)}
        onSave={handleRename}
      />

      <SpotlightDialog
        open={spotlightOpen}
        onOpenChange={setSpotlightOpen}
        chats={spotlightChats}
        onSelectChat={(id) => {
          setSpotlightOpen(false)
          router.push(`/chat/${id}`)
        }}
      />

    </div>
  )
}
