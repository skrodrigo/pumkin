'use client'

import { RenameDialog as SharedRenameDialog } from '@/components/chat/rename-dialog'

interface RenameDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	value: string
	onChangeValue: (value: string) => void
	isPending: boolean
	isLoading: boolean
	onCancel: () => void
	onSave: () => void
}

export function RenameDialog({
	open,
	onOpenChange,
	value,
	onChangeValue,
	isPending,
	isLoading,
	onCancel,
	onSave,
}: RenameDialogProps) {
	return (
		<SharedRenameDialog
			open={open}
			onOpenChange={onOpenChange}
			value={value}
			onChangeValue={onChangeValue}
			isPending={isPending}
			isLoading={isLoading}
			onCancel={onCancel}
			onSave={onSave}
		/>
	)
}
