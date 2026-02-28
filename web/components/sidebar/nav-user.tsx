"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useSidebar } from "@/components/ui/sidebar"
import { usageService } from "@/data/usage"
import { subscriptionService } from "@/data/subscription"
import { stripeService } from "@/data/stripe"
import {
  Cancel01Icon,
} from '@hugeicons/core-free-icons'
import { Icon } from '@/components/ui/icon'
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'

import { NavUserAccountSection } from '@/components/sidebar/_components/nav-user-account-section'
import { NavUserDataControlsSection } from '@/components/sidebar/_components/nav-user-data-controls-section'
import { NavUserMenu } from '@/components/sidebar/_components/nav-user-menu'
import { NavUserSubscriptionSection } from '@/components/sidebar/_components/nav-user-subscription-section'

type SettingsSection = 'account' | 'data-controls' | 'subscription'

type ThemeMode = 'system' | 'light' | 'dark'

interface AccountProfile {
  name: string
  occupation: string | null
  aiInstructions: string | null
}

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
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isArchivingChats, setIsArchivingChats] = useState(false)
  const [isDeletingChats, setIsDeletingChats] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteChatsConfirmText, setDeleteChatsConfirmText] = useState('')
  const [deleteChatsDialogOpen, setDeleteChatsDialogOpen] = useState(false)
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [nameDialogOpen, setNameDialogOpen] = useState(false)
  const [nameDraft, setNameDraft] = useState('')

  const router = useRouter()
  const t = useTranslations('settings')

  const { theme, setTheme } = useTheme()
  const selectedTheme: ThemeMode =
    theme === 'light' || theme === 'dark' || theme === 'system'
      ? theme
      : 'system'
  const selectedThemeIndex =
    selectedTheme === 'system'
      ? 0
      : selectedTheme === 'light'
        ? 1
        : 2

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

  const deleteAccount = async () => {
    if (isDeletingAccount) return
    setIsDeletingAccount(true)
    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
        cache: 'no-store',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        const code = body?.statusCode ?? res.status
        throw new Error(body?.error || `Request failed (${code})`)
      }
      await logout()
    } catch (err) {
      console.error(err)
      setIsDeletingAccount(false)
    }
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
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('account')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const Root = isMobile ? Drawer : Dialog
  const Content = isMobile ? DrawerContent : DialogContent
  const Header = isMobile ? DrawerHeader : DialogHeader
  const Title = isMobile ? DrawerTitle : DialogTitle
  const Description = isMobile ? DrawerDescription : DialogDescription

  useEffect(() => {
    if (deleteDialogOpen) return
    setDeleteConfirmText('')
  }, [deleteDialogOpen])

  useEffect(() => {
    if (deleteChatsDialogOpen) return
    setDeleteChatsConfirmText('')
  }, [deleteChatsDialogOpen])

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true)
      try {
        const res = await fetch('/api/account/profile', {
          method: 'GET',
          cache: 'no-store',
        })
        if (!res.ok) return
        const body = await res.json().catch(() => null)
        const data = body?.data
        if (!data) return
        setProfile({
          name: String(data.name ?? ''),
          occupation:
            data.occupation === null || typeof data.occupation === 'string'
              ? data.occupation
              : null,
          aiInstructions:
            data.aiInstructions === null || typeof data.aiInstructions === 'string'
              ? data.aiInstructions
              : null,
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (settingsOpen && settingsSection === 'account') {
      loadProfile()
    }
  }, [settingsOpen, settingsSection])

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

    if (settingsOpen && settingsSection === 'subscription') {
      loadSettingsData()
    }
  }, [settingsOpen, settingsSection])

  const saveProfile = async () => {
    if (!profile || isSavingProfile) return
    setIsSavingProfile(true)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          name: profile.name,
          occupation:
            profile.occupation && profile.occupation.trim().length
              ? profile.occupation
              : null,
          aiInstructions:
            profile.aiInstructions && profile.aiInstructions.trim().length
              ? profile.aiInstructions
              : null,
        }),
      })
      if (!res.ok) return
      const body = await res.json().catch(() => null)
      const data = body?.data
      if (!data) return
      setProfile({
        name: String(data.name ?? ''),
        occupation:
          data.occupation === null || typeof data.occupation === 'string'
            ? data.occupation
            : null,
        aiInstructions:
          data.aiInstructions === null || typeof data.aiInstructions === 'string'
            ? data.aiInstructions
            : null,
      })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const patchProfile = async (payload: Partial<AccountProfile>) => {
    if (isSavingProfile) return
    setIsSavingProfile(true)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify(payload),
      })
      if (!res.ok) return
      const body = await res.json().catch(() => null)
      const data = body?.data
      if (!data) return
      setProfile({
        name: String(data.name ?? ''),
        occupation:
          data.occupation === null || typeof data.occupation === 'string'
            ? data.occupation
            : null,
        aiInstructions:
          data.aiInstructions === null || typeof data.aiInstructions === 'string'
            ? data.aiInstructions
            : null,
      })
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('user:refresh'))
      }
    } finally {
      setIsSavingProfile(false)
    }
  }

  const archiveAllChats = async () => {
    if (isArchivingChats) return
    setIsArchivingChats(true)
    try {
      const res = await fetch('/api/chats/archive-all', {
        method: 'PATCH',
        cache: 'no-store',
      })
      if (res.ok && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('chats:refresh'))
      }
    } finally {
      setIsArchivingChats(false)
    }
  }

  const deleteAllChats = async () => {
    if (isDeletingChats) return
    setIsDeletingChats(true)
    try {
      const res = await fetch('/api/chats/delete-all', {
        method: 'DELETE',
        cache: 'no-store',
      })
      if (res.ok && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('chats:refresh'))
      }
    } finally {
      setIsDeletingChats(false)
      setDeleteChatsDialogOpen(false)
    }
  }

  const openSettings = (section: SettingsSection) => {
    setSettingsSection(section)
    setSettingsOpen(true)
  }

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
      <NavUserMenu
        user={user}
        initials={initials}
        isMobile={isMobile}
        selectedTheme={selectedTheme}
        selectedThemeIndex={selectedThemeIndex}
        setTheme={setTheme}
        openSettings={openSettings}
        logout={logout}
      />

      <Root open={settingsOpen} onOpenChange={setSettingsOpen}>
        <Content
          className={
            isMobile
              ? '[&>div:first-child]:hidden'
              : undefined
          }
        >
          {isMobile && (
            <DrawerClose className="ring-offset-background cursor-pointer focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute bg-muted border-t rounded-full p-2 top-2 right-2 hover:bg-muted/80 transition-opacity hover:opacity-100 focus:ring-[0.5px] focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
              <Icon icon={Cancel01Icon} className="size-5" />
            </DrawerClose>
          )}
          <Header>
            <Title>
              {settingsSection === 'account'
                ? t('account')
                : settingsSection === 'data-controls'
                  ? t('data')
                  : t('subscription')}
            </Title>
            <Description>
              {settingsSection === 'account'
                ? t('accountDescription')
                : settingsSection === 'data-controls'
                  ? t('dataDescription')
                  : t('subscriptionDescription')}
            </Description>
          </Header>

          <div
            className={
              isMobile
                ? 'space-y-4 pt-2 px-4 pb-6'
                : 'space-y-4 pt-2 md:px-0 px-4'
            }
          >
            {settingsSection === 'account' && (
              <NavUserAccountSection
                initialName={user.name}
                profile={profile}
                setProfile={setProfile}
                isLoading={isLoading}
                isSavingProfile={isSavingProfile}
                nameDialogOpen={nameDialogOpen}
                setNameDialogOpen={setNameDialogOpen}
                nameDraft={nameDraft}
                setNameDraft={setNameDraft}
                saveProfile={saveProfile}
                patchProfile={patchProfile}
              />
            )}

            {settingsSection === 'data-controls' && (
              <NavUserDataControlsSection
                archiveAllChats={archiveAllChats}
                isArchivingChats={isArchivingChats}
                deleteAllChats={deleteAllChats}
                isDeletingChats={isDeletingChats}
                deleteChatsConfirmText={deleteChatsConfirmText}
                setDeleteChatsConfirmText={setDeleteChatsConfirmText}
                deleteChatsDialogOpen={deleteChatsDialogOpen}
                setDeleteChatsDialogOpen={setDeleteChatsDialogOpen}
                deleteAccount={deleteAccount}
                isDeletingAccount={isDeletingAccount}
                deleteConfirmText={deleteConfirmText}
                setDeleteConfirmText={setDeleteConfirmText}
                deleteDialogOpen={deleteDialogOpen}
                setDeleteDialogOpen={setDeleteDialogOpen}
              />
            )}

            {settingsSection === 'subscription' && (
              <NavUserSubscriptionSection
                isLoading={isLoading}
                hasActiveSubscription={hasActiveSubscription}
                isManaging={isManaging}
                managePlan={managePlan}
                subscribe={subscribe}
                shouldShowUsage={shouldShowUsage}
                usageData={usageData}
              />
            )}
          </div>
        </Content>
      </Root>
    </>
  )
}
