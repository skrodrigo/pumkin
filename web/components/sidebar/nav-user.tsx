"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { usageService } from "@/data/usage"
import { subscriptionService } from "@/data/subscription"
import { stripeService } from "@/data/stripe"
import {
  ChevronsUpDown,
  LogOut,
  Settings,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const [subscription, setSubscription] = useState<any | null>(null)
  const [usageData, setUsageData] = useState<{
    dayCount: number
    weekCount: number
    monthCount: number

    limits: {
      promptsDay: number
      promptsWeek: number
      promptsMonth: number
    }
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isManaging, setIsManaging] = useState(false)

  const router = useRouter()

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        cache: 'no-store',
      })
    } catch {
    }
    router.replace('/')
    router.refresh()
  }

  const subscribe = () => {
    router.push('/upgrade')
  }

  const managePlan = async () => {
    setIsManaging(true)
    try {
      const session = await stripeService.createPortal()
      window.location.href = session.url
    } catch (err) {
      console.error(err)
      setIsManaging(false)
    }
  }

  const initials = (user.name || 'U')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  const { isMobile } = useSidebar()
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    async function loadSettingsData() {
      setIsLoading(true)
      try {
        const sub = await subscriptionService.get()
        setSubscription(sub)

        const data = await usageService.get()
        if (data) {
          setUsageData(data)
        }
      } catch (error) {
      } finally {
        setIsLoading(false)
      }
    }

    if (settingsOpen) {
      loadSettingsData()
    }
  }, [settingsOpen])

  const hasActiveSubscription =
    subscription?.status === 'active' ||
    subscription?.status === 'trialing'

  const shouldShowUsage =
    hasActiveSubscription &&
    Boolean(usageData) &&
    typeof usageData?.limits?.promptsDay === 'number' &&
    typeof usageData?.limits?.promptsWeek === 'number' &&
    typeof usageData?.limits?.promptsMonth === 'number' &&
    typeof usageData?.dayCount === 'number' &&
    typeof usageData?.weekCount === 'number' &&
    typeof usageData?.monthCount === 'number'

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-md">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-md">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-foreground/80">{user.name}</span>
                  <span className="truncate text-xs text-foreground/40">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-md"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-md">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-md">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium text-foreground/80">{user.name}</span>
                    <span className="truncate text-xs text-foreground/40">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Settings />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="focus:bg-destructive/20" onClick={logout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações da Conta</DialogTitle>
            <DialogDescription>Veja suas informações e opções de suporte.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-foreground/70">Usuário</h3>
              <div className="mt-2 flex items-center gap-3">
                <Avatar className="h-9 w-9 rounded-full">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-md">{initials}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-foreground/60">{user.email}</div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-foreground/90">Plano</h3>
              {isLoading ? (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-20" />
                </div>
              ) : (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <div>
                    <div className="text-foreground/60">
                      {hasActiveSubscription ? 'Ativo' : 'Sem plano'}
                    </div>
                  </div>
                  {hasActiveSubscription ? (
                    <Button size="sm" variant="secondary" onClick={managePlan} disabled={isManaging}>
                      {isManaging ? 'Abrindo…' : 'Gerenciar plano'}
                    </Button>
                  ) : (
                    <Button size="sm" variant="default" onClick={subscribe}>
                      Assine agora
                    </Button>
                  )}
                </div>
              )}
            </div>

            {hasActiveSubscription && isLoading ? (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-foreground/90">Uso do Plano</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/12" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/12" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/12" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/12" />
                  </div>
                </div>
              </div>
            ) : shouldShowUsage && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-foreground/90">Uso do Plano</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Hoje</span>
                    <span className="font-medium">
                      {usageData.dayCount}/<span className="text-foreground/60">{usageData.limits.promptsDay}</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Esta semana</span>
                    <span className="font-medium">
                      {usageData.weekCount}/<span className="text-foreground/60">{usageData.limits.promptsWeek}</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Este mês</span>
                    <span className="font-medium">
                      {usageData.monthCount}/<span className="text-foreground/60">{usageData.limits.promptsMonth}</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-foreground/70">Suporte</h3>
              <div className="mt-2 text-sm text-foreground/70">
                Precisa de ajuda? Entre em contato com o suporte.
              </div>
              <div className="mt-3 flex gap-2">
                <Button asChild size="sm" variant="secondary">
                  <a href="#">Email</a>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href="#">Centro de ajuda</a>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
