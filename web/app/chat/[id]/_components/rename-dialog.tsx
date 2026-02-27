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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Renomear chat</DialogTitle>
					<DialogDescription>
						Defina um novo título para esta conversa.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col gap-3">
					<Input
						value={value}
						onChange={(e) => onChangeValue(e.target.value)}
						className="h-10"
					/>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={onCancel}
							disabled={isPending || isLoading}
						>
							Cancelar
						</Button>
						<Button
							onClick={onSave}
							disabled={
							isPending || isLoading || !value.trim()
						}
						>
							Salvar
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
