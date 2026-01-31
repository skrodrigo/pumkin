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
import { chatsService } from "@/server/chats";
import { meService, type MeUser } from "@/server/me";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  chats: { id: string; title: string }[];
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
    <div className="border border-border rounded-md">
      <Sidebar variant="floating" {...props}>
        < SidebarHeader >
          <div className="flex items-center gap-2">
            <Image src="/logos/nexus.svg" alt="Logo" width={24} height={24} priority quality={100} className="m-2" />
            <h1 className="font-medium">Nexus</h1>
          </div>
          <Link href="/chat" className="mt-6">
            <Button size="icon" className="w-full font-medium bg-accent border hover:bg-accent/80 border-border text-foreground">Novo Chat</Button>
          </Link>
        </SidebarHeader >
        <SidebarContent>
          <SidebarSearch chats={chats} />
          <NavChatHistory chats={chats} onChatsChange={setChats} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={user ?? { name: 'User', email: '', avatar: '' }} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar >
    </div>
  )
}
