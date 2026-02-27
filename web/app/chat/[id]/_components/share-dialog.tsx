'use client'

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Icon } from '@/components/ui/icon'
import { Share05Icon } from '@hugeicons/core-free-icons'

interface ShareDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	shareLink: string
	onOpenShareLink: () => void
	onCopy: () => void
}

export function ShareDialog({
	open,
	onOpenChange,
	shareLink,
	onOpenShareLink,
	onCopy,
}: ShareDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Compartilhar Chat</DialogTitle>
					<DialogDescription>
						Qualquer pessoa com este link poderá visualizar a conversa.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col items-center space-x-2 w-full space-y-2">
					<Input
						id="link"
						defaultValue={shareLink}
						readOnly
						className="w-full h-10"
					/>
					<div className="flex justify-end w-full gap-2">
						<Button
							onClick={onOpenShareLink}
							size="sm"
							variant="secondary"
						>
							<Icon icon={Share05Icon} className="size-4" />
							<span>Abrir na guia</span>
						</Button>
						<Button onClick={onCopy} size="sm">
							<span>Copiar</span>
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
