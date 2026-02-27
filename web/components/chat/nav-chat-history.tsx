"use client"

import { useRef, useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Archive03Icon,
  Share03Icon,
  Loading03Icon,
  MoreHorizontalIcon,
  Delete02Icon,
  PinIcon,
  PinOffIcon,
  Edit03Icon,
} from '@hugeicons/core-free-icons'
import { Icon } from '@/components/ui/icon'
import { chatsService } from '@/data/chats';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"


export function NavChatHistory({
  chats,
  onChatsChange,
}: {
  chats: {
    id: string;
    title: string;
    pinnedAt?: string | null
  }[]
  onChatsChange?: (chats: { id: string; title: string; pinnedAt?: string | null }[]) => void;
}) {
  const { isMobile } = useSidebar();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const longPressTimerRef = useRef<number | null>(null)
  const longPressTriggeredIdRef = useRef<string | null>(null)
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatIdToDelete, setChatIdToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renameValue, setRenameValue] = useState('')

  function cancelLongPress() {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  function startLongPress(chatId: string) {
    if (!isMobile) return
    cancelLongPress()
    longPressTriggeredIdRef.current = null
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredIdRef.current = chatId
      setOpenDropdownId(chatId)
    }, 450)
  }

  const handleShareClick = (chatId: string) => {
    setSelectedChatId(chatId);
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

  const handlePin = (chatId: string) => {
    setIsLoading(true)
    startTransition(async () => {
      try {
        await chatsService.pin(chatId)
        const res = await chatsService.list()
        const data = res?.data
        if (Array.isArray(data)) onChatsChange?.(data)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('chats:refresh'))
        }
      } finally {
        setIsLoading(false)
      }
    })
  }

  const handleUnpin = (chatId: string) => {
    setIsLoading(true)
    startTransition(async () => {
      try {
        await chatsService.unpin(chatId)
        const res = await chatsService.list()
        const data = res?.data
        if (Array.isArray(data)) onChatsChange?.(data)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('chats:refresh'))
        }
      } finally {
        setIsLoading(false)
      }
    })
  }

  const handleOpenRename = (chatId: string, currentTitle: string) => {
    setSelectedChatId(chatId)
    setRenameValue(currentTitle)
    setRenameDialogOpen(true)
  }

  const handleRename = () => {
    const chatId = selectedChatId
    const nextTitle = renameValue.trim()
    if (!chatId || !nextTitle) return
    setIsLoading(true)
    startTransition(async () => {
      try {
        await chatsService.rename({ id: chatId, title: nextTitle })
        setRenameDialogOpen(false)
        const res = await chatsService.list()
        const data = res?.data
        if (Array.isArray(data)) onChatsChange?.(data)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('chats:refresh'))
        }
        router.refresh()
      } finally {
        setIsLoading(false)
      }
    })
  }

  const handleArchive = (chatId: string) => {
    setIsLoading(true)
    startTransition(async () => {
      onChatsChange?.(chats.filter((c) => c.id !== chatId))
      const result = await chatsService.archive(chatId)
      if (result?.success) {
        if (pathname === `/chat/${chatId}`) {
          router.push('/chat')
        }
        try {
          const res = await chatsService.list()
          const data = res?.data
          if (Array.isArray(data)) onChatsChange?.(data)
        } catch {
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('chats:refresh'))
        }
      }
      setIsLoading(false)
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
  };

  const handleDelete = (chatId: string) => {
    setIsLoading(true);
    startTransition(async () => {
      onChatsChange?.(chats.filter((c) => c.id !== chatId));
      const result = await chatsService.delete(chatId);
      if (result?.success) {
        if (pathname === `/chat/${chatId}`) {
          router.push('/chat');
        }
        startTransition(async () => {
          try {
            const res = await chatsService.list();
            const data = res?.data;
            if (Array.isArray(data)) onChatsChange?.(data);
          } catch {
          }
        });
      }
      setIsLoading(false);
    });
  };

  return (
    <>
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Chats</SidebarGroupLabel>
        <SidebarMenu>
          {chats.map((chat) => (
            <SidebarMenuItem key={chat.id} className="group/chat-item">
              <SidebarMenuButton
                asChild
                isActive={pathname === `/chat/${chat.id}`}
                className="group-hover/chat-item:bg-sidebar-accent group-hover/chat-item:text-sidebar-accent-foreground"
              >
                <Link
                  href={`/chat/${chat.id}`}
                  onPointerDown={() => startLongPress(chat.id)}
                  onPointerUp={cancelLongPress}
                  onPointerCancel={cancelLongPress}
                  onPointerLeave={cancelLongPress}
                  onContextMenu={(e) => {
                    if (!isMobile) return
                    e.preventDefault()
                  }}
                  onClick={(e) => {
                    if (!isMobile) return
                    if (longPressTriggeredIdRef.current !== chat.id) return
                    e.preventDefault()
                    e.stopPropagation()
                    longPressTriggeredIdRef.current = null
                    cancelLongPress()
                  }}
                >
                  <span className="truncate">{chat.title}</span>
                </Link>
              </SidebarMenuButton>
              {chat.pinnedAt && openDropdownId !== chat.id && (
                <SidebarMenuAction
                  className="flex"
                >
                  <Icon icon={PinIcon} className="h-3.5 w-3.5 text-muted-foreground/20" fill='currentColor' />
                </SidebarMenuAction>
              )}
              <DropdownMenu
                open={openDropdownId === chat.id}
                onOpenChange={(open) => setOpenDropdownId(open ? chat.id : null)}
              >
                {isMobile ? (
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-hidden
                      tabIndex={-1}
                      className="pointer-events-none absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 opacity-0"
                    />
                  </DropdownMenuTrigger>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <DropdownMenuTrigger asChild>
                        <TooltipTrigger asChild>
                          <SidebarMenuAction
                            showOnHover
                            className="group-hover/chat-item:bg-sidebar-accent group-hover/chat-item:text-sidebar-accent-foreground"
                          >
                            <Icon icon={MoreHorizontalIcon} className='cursor-pointer size-5' />
                          </SidebarMenuAction>
                        </TooltipTrigger>
                      </DropdownMenuTrigger>
                      <TooltipContent sideOffset={6}>Mais opções</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <DropdownMenuContent
                  className="w-48 rounded-md"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem
                    onClick={() => {
                      if (chat.pinnedAt) {
                        handleUnpin(chat.id)
                        return
                      }
                      handlePin(chat.id)
                    }}
                    disabled={isPending || isLoading}
                  >
                    <Icon icon={chat.pinnedAt ? PinOffIcon : PinIcon} className="text-muted-foreground" />
                    <span>{chat.pinnedAt ? 'Desafixar' : 'Pinar'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleOpenRename(chat.id, chat.title)} disabled={isPending || isLoading}>
                    <Icon icon={Edit03Icon} className="text-muted-foreground" />
                    <span>Renomear</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleShareClick(chat.id)} disabled={isPending}>
                    <Icon icon={Share03Icon} className="text-muted-foreground" />
                    <span>Compartilhar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleArchive(chat.id)} disabled={isPending}>
                    <Icon icon={Archive03Icon} className="text-muted-foreground" />
                    <span>Arquivar</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className='focus:bg-destructive/20'
                    onClick={() => {
                      setChatIdToDelete(chat.id)
                      setDeleteDialogOpen(true)
                    }}
                    disabled={isPending}
                  >
                    <Icon icon={Delete02Icon} className="text-muted-foreground" />
                    <span>Deletar</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>

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
              className='w-full h-10'
            />
            <div className="flex justify-end w-full">
              <Button onClick={copyToClipboard} size="sm" className='mr-1'>
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
              className='h-10'
              onClick={() => {
                if (chatIdToDelete) {
                  handleDelete(chatIdToDelete)
                }
                setDeleteDialogOpen(false)
                setChatIdToDelete(null)
              }}
              disabled={isPending}
            >
              {isLoading ? <Icon icon={Loading03Icon} className="mr-2 size-4 animate-spin" /> : "Excluir Chat"}
            </Button>
            <Button
              className='h-10'
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isPending}
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
    </>
  )
}
