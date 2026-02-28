'use client'

import { Button } from '@/components/ui/button'
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import { chatsService } from '@/data/chats'
import { Archive03Icon, ArchiveArrowUpIcon, Loading03Icon } from '@hugeicons/core-free-icons'
import { Icon } from '@/components/ui/icon'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'

interface ArchivedChatItem {
	id: string
	title: string
}

export function ArchivedChatsButton(props: {
	onChanged?: () => void
	variant?: 'outline' | 'ghost' | 'default'
}) {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [items, setItems] = useState<ArchivedChatItem[]>([])
	const t = useTranslations()
	const locale = useLocale()

	useEffect(() => {
		if (!open) return

		async function load() {
			setIsLoading(true)
			try {
				try {
					const res = await chatsService.listArchived()
					const data = res?.data
					setItems(Array.isArray(data) ? data : [])
				} catch {
					setItems([])
				}
			} finally {
				setIsLoading(false)
			}
		}

		load()
	}, [open])

	const openChat = (id: string) => {
		setOpen(false)
		router.push(locale === 'pt' ? `/chat/${id}` : `/${locale}/chat/${id}`)
	}

	const unarchive = async (id: string) => {
		await chatsService.unarchive(id)
		setItems((prev) => prev.filter((x) => x.id !== id))
		props.onChanged?.()
		if (typeof window !== 'undefined') {
			window.dispatchEvent(new Event('chats:refresh'))
		}
	}

	return (
		<>
			<Button
				size="sm"
				variant="ghost"
				className="w-full justify-start gap-2 px-2 h-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
				onClick={() => setOpen(true)}
			>
				<Icon icon={Archive03Icon} className="size-4" />
				<span>{t('sidebar.archived')}</span>
			</Button>

			<CommandDialog
				open={open}
				onOpenChange={setOpen}
				title={t('sidebar.archived')}
				description={t('sidebar.archivedDescription')}
			>
				<CommandInput placeholder={t('sidebar.archivedSearchPlaceholder')} />
				<CommandList>
					<CommandEmpty className='flex w-full justify-center items-center py-4'>
						{isLoading ? <Icon icon={Loading03Icon} className="size-4 animate-spin" /> : t('sidebar.noArchivedChats')}
					</CommandEmpty>
					<CommandGroup heading={t('sidebar.archivedDescription')}>
						{items.map((c) => (
							<CommandItem
								key={c.id}
								value={c.title}
								onSelect={() => openChat(c.id)}
								className="group flex items-center justify-between h-11 rounded-sm!"
							>
								<span className="truncate">{c.title}</span>
								<button
									type="button"
									className="ml-2 cursor-pointer inline-flex size-8 items-center justify-center rounded-md opacity-0 transition-opacity group-hover:opacity-100"
									onClick={async (e) => {
										e.preventDefault()
										e.stopPropagation()
										await unarchive(c.id)
									}}
								>
									<Icon icon={ArchiveArrowUpIcon} size={12} />
								</button>
							</CommandItem>
						))}
					</CommandGroup>
				</CommandList>
			</CommandDialog>
		</>
	)
}
