'use client'

import { ShareDialog as SharedShareDialog } from '@/components/chat/share-dialog'

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
		<SharedShareDialog
			open={open}
			onOpenChange={onOpenChange}
			shareLink={shareLink}
			onOpenShareLink={onOpenShareLink}
			onCopy={onCopy}
		/>
	)
}
