"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Search01Icon } from '@hugeicons/core-free-icons'
import { Icon } from '@/components/ui/icon'
import { Button } from "@/components/ui/button"

type ChatItem = { id: string; title: string }

interface SidebarSearchProps {
  chats: ChatItem[]
}

export function SidebarSearch({ chats }: SidebarSearchProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const goToChat = (id: string) => {
    setOpen(false)
    router.push(`/chat/${id}`)
  }

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        className="w-full justify-start gap-2 px-2 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
        onClick={() => setOpen(true)}
      >
        <Icon icon={Search01Icon} className="size-4" />
        <span>Pesquisar Chats</span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title="Pesquisar" description="Busque chats ou ações">
        <CommandInput placeholder="Buscar chats..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado.</CommandEmpty>
          <CommandGroup heading="Chats">
            {chats.map((c) => (
              <CommandItem key={c.id} value={c.title} onSelect={() => goToChat(c.id)}>
                {c.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
