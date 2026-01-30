"use client"

import { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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

  Forward,
  Loader2Icon,
  MoreHorizontal,
  Trash2,
} from "lucide-react"
import { deleteChat } from '@/server/chat/delete-chat';
import { shareChat } from '@/server/chat/share-chat';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
}: {
  chats: {
    id: string;
    title: string;
  }[]
}) {
  const { isMobile } = useSidebar();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [, setSelectedChatId] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatIdToDelete, setChatIdToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleShareClick = (chatId: string) => {
    setSelectedChatId(chatId);
    setShareDialogOpen(true);
    setIsLoading(true);
    startTransition(async () => {
      const { success, data } = await shareChat(chatId);
      if (success && data?.sharePath) {
        const url = new URL(window.location.href);
        url.pathname = `/share/${data.sharePath}`;
        setShareLink(url.toString());
      }
      setIsLoading(false);
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
  };

  const handleDelete = (chatId: string) => {
    setIsLoading(true);
    startTransition(async () => {
      const { success } = await deleteChat(chatId);
      if (success) {
        if (pathname === `/chat/${chatId}`) {
          router.push('/chat');
        }
        router.refresh();
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
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton asChild>
                <a href={`/chat/${chat.id}`}>
                  <span>{chat.title}</span>
                </a>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal className='cursor-pointer' />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-2xl"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem onClick={() => handleShareClick(chat.id)} disabled={isPending}>
                    <Forward className="text-muted-foreground" />
                    <span>Compartilhar</span>
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
                    <Trash2 className="text-muted-foreground" />
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
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (chatIdToDelete) {
                  handleDelete(chatIdToDelete)
                }
                setDeleteDialogOpen(false)
                setChatIdToDelete(null)
              }}
              disabled={isPending}
            >
              {isLoading ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
