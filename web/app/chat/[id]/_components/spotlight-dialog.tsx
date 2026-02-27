'use client'

import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command'

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
	return (
		<CommandDialog
			open={open}
			onOpenChange={onOpenChange}
			title="Buscar chat"
			description="Pesquise e navegue para um chat"
		>
			<CommandInput placeholder="Buscar chats..." />
			<CommandList>
				<CommandEmpty>Nenhum resultado.</CommandEmpty>
				<CommandGroup heading="Chats">
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
