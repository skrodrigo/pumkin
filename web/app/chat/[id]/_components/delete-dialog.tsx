'use client'

import { DeleteDialog as SharedDeleteDialog } from '@/components/chat/delete-dialog'

interface DeleteDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	isPending: boolean
	isLoading: boolean
	onConfirm: () => void
	onCancel: () => void
}

export function DeleteDialog({
	open,
	onOpenChange,
	isPending,
	isLoading,
	onConfirm,
	onCancel,
}: DeleteDialogProps) {
	return (
		<SharedDeleteDialog
			open={open}
			onOpenChange={onOpenChange}
			isPending={isPending}
			isLoading={isLoading}
			onConfirm={onConfirm}
			onCancel={onCancel}
		/>
	)
}
