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

interface ArchivedChatItem {
	id: string
	title: string
}

export function ArchivedChatsButton(props: {
	onChanged?: () => void
}) {
	const router = useRouter()
	const [open, setOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [items, setItems] = useState<ArchivedChatItem[]>([])

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
		router.push(`/chat/${id}`)
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
				size="icon"
				variant="outline"
				className="rounded-full"
				onClick={() => setOpen(true)}
			>
				<Icon icon={Archive03Icon} className="size-4" />
			</Button>

			<CommandDialog
				open={open}
				onOpenChange={setOpen}
				title="Arquivados"
				description="Chats arquivados"
			>
				<CommandInput placeholder="Buscar chats arquivados..." />
				<CommandList>
					<CommandEmpty className='flex w-full justify-center items-center py-4'>
						{isLoading ? <Icon icon={Loading03Icon} className="size-4 animate-spin" /> : 'Nenhum chat arquivado.'}
					</CommandEmpty>
					<CommandGroup heading="Chats arquivados">
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
