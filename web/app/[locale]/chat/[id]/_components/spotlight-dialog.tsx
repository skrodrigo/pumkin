'use client'

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'
import { useTranslations } from 'next-intl'

interface SpotlightChat {
	id: string
	title: string
}

interface SpotlightDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	chats: SpotlightChat[]
	onSelectChat: (chatId: string) => void
}

export function SpotlightDialog({
	open,
	onOpenChange,
	chats,
	onSelectChat,
}: SpotlightDialogProps) {
	const t = useTranslations('spotlightDialog')
	return (
		<CommandDialog
			open={open}
			onOpenChange={onOpenChange}
			title={t('title')}
			description={t('description')}
		>
			<CommandInput placeholder={t('placeholder')} />
			<CommandList>
				<CommandEmpty>{t('noResults')}</CommandEmpty>
				<CommandGroup heading={t('chatsHeading')}>
					{chats.map((chat) => (
						<CommandItem
							key={chat.id}
							value={chat.title}
							onSelect={() => onSelectChat(chat.id)}
						>
							{chat.title}
						</CommandItem>
					))}
				</CommandGroup>
			</CommandList>
		</CommandDialog>
	)
}
