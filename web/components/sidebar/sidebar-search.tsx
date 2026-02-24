"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

type ChatItem = { id: string; title: string }

interface SidebarSearchProps {
  chats: ChatItem[]
}

export function SidebarSearch({ chats }: SidebarSearchProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const onOpen = () => {
    setOpen(true)
  }

  const goToChat = (id: string) => {
    setOpen(false)
    router.push(`/chat/${id}`)
  }

  return (
    <div className="px-2 pb-2">
      <div
        className="relative w-full"
        onClick={() => {
          onOpen()
          setTimeout(() => inputRef.current?.blur(), 0)
        }}
      >
        <Input
          ref={inputRef}
          readOnly
          placeholder="Pesquisar..."
          className="h-9 pl-8 cursor-pointer bg-transparent! border-none"
        />
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      </div>

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
    </div>
  )
}
