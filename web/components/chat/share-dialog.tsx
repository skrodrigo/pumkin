'use client'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icon } from '@/components/ui/icon'
import { useIsMobile } from '@/hooks/use-mobile'
import { Share05Icon } from '@hugeicons/core-free-icons'

interface ShareDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	shareLink: string
	onOpenShareLink?: () => void
	onCopy: () => void
}

export function ShareDialog({
	open,
	onOpenChange,
	shareLink,
	onOpenShareLink,
	onCopy,
}: ShareDialogProps) {
	const isMobile = useIsMobile()

	const actions = (
		<div className="flex justify-end w-full gap-2">
			{onOpenShareLink ? (
				<Button onClick={onOpenShareLink} size="sm" variant="secondary">
					<Icon icon={Share05Icon} className="size-4" />
					<span>Abrir na guia</span>
				</Button>
			) : null}
			<Button onClick={onCopy} size="sm">
				<span>Copiar</span>
			</Button>
		</div>
	)

	const body = (
		<div className="flex flex-col items-center space-x-2 w-full space-y-2">
			<Input
				id="link"
				defaultValue={shareLink}
				readOnly
				className="w-full h-10"
			/>
			{actions}
		</div>
	)

	if (isMobile)
		return (
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Compartilhar Chat</DrawerTitle>
						<DrawerDescription>
							Qualquer pessoa com este link poderá visualizar a conversa.
						</DrawerDescription>
					</DrawerHeader>
					<div className="px-4 pb-2">{body}</div>
					<DrawerFooter />
				</DrawerContent>
			</Drawer>
		)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Compartilhar Chat</DialogTitle>
					<DialogDescription>
						Qualquer pessoa com este link poderá visualizar a conversa.
					</DialogDescription>
				</DialogHeader>
				{body}
			</DialogContent>
		</Dialog>
	)
}
