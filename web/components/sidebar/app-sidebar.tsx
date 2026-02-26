"use client";

import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { NavChatHistory } from "../chat/nav-chat-history";
import { Button } from "../ui/button";
import { SidebarSearch } from "./sidebar-search";
import Link from "next/link";
import { useEffect, useState } from "react";
import { chatsService } from "@/data/chats";
import { meService, type MeUser } from "@/data/me";
import { ArchivedChatsButton } from '@/components/sidebar/archived-chats-button'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  chats: { id: string; title: string; pinnedAt?: string | null }[]
}

export default function AppSidebar({ chats: initialChats, ...props }: AppSidebarProps) {
  const [chats, setChats] = useState(initialChats);
  const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);

  useEffect(() => {
    const refresh = () => {
      chatsService.list().then((res) => {
        const data = res?.data;
        if (Array.isArray(data)) setChats(data);
      }).catch(() => { });
    };
    refresh();
    window.addEventListener('chats:refresh', refresh);
    return () => window.removeEventListener('chats:refresh', refresh);
  }, []);

  useEffect(() => {
    meService.get().then((u: MeUser) => {
      setUser({
        name: u.name || 'User',
        email: u.email || '',
        avatar: u.image || '',
      });
    }).catch(() => {
      setUser({ name: 'User', email: '', avatar: '' });
    });
  }, []);

  return (
    <div className="flex items-start gap-2">
      <div className="rounded-md">
        <Sidebar variant="floating" {...props}>
          <SidebarHeader >
            <div className="flex items-center gap-2">
              <Image src="/logos/pumkin.svg" alt="Logo" width={16} height={16} priority quality={100} className="m-2" />
              <h1 className="font-medium">Pumkin</h1>
            </div>
            <div className="mt-6 flex w-full flex-col gap-2">
              <Link href="/chat" className="flex-1">
                <Button className="w-full font-medium bg-accent border hover:bg-accent/80 border-border text-foreground h-9">Novo Chat</Button>
              </Link>
              <SidebarSearch chats={chats} />
              <ArchivedChatsButton onChanged={() => {
                chatsService.list().then((res) => {
                  const data = res?.data
                  if (Array.isArray(data)) setChats(data)
                }).catch(() => { })
              }} />
            </div>
          </SidebarHeader >
          <SidebarContent>
            <NavChatHistory chats={chats} onChatsChange={setChats} />
          </SidebarContent>
          <SidebarFooter>
            <NavUser user={user ?? { name: 'User', email: '', avatar: '' }} />
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
      </div>
    </div>
  )
}
