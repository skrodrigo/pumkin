"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Search01Icon } from '@hugeicons/core-free-icons'
import { Icon } from '@/components/ui/icon'
import { Button } from "@/components/ui/button"
import { useTranslations, useLocale } from 'next-intl'

type ChatItem = { id: string; title: string }

interface SidebarSearchProps {
  chats: ChatItem[]
}

export function SidebarSearch({ chats }: SidebarSearchProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const t = useTranslations()
  const locale = useLocale()

  const goToChat = (id: string) => {
    setOpen(false)
    router.push(locale === 'pt' ? `/chat/${id}` : `/${locale}/chat/${id}`)
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
        <span>{t('sidebar.searchChats')}</span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title={t('sidebar.searchTitle')} description={t('sidebar.searchDescription')}>
        <CommandInput placeholder={t('sidebar.searchPlaceholder')} />
        <CommandList>
          <CommandEmpty>{t('sidebar.noResults')}</CommandEmpty>
          <CommandGroup heading={t('sidebar.chatsGroup')}>
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
