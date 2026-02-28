import type { Metadata } from 'next'
import { AppSidebarLoader } from "@/components/sidebar/app-sidebar-loader";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: 'Chat',
  description: 'Chat with AI models',
}

export const dynamic = 'force-dynamic'

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider suppressHydrationWarning={true}>
      <AppSidebarLoader />
      {children}
    </SidebarProvider>
  );
}
