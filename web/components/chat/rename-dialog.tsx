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
import { useIsMobile } from '@/hooks/use-mobile'

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
	const isMobile = useIsMobile()

	const body = (
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
					disabled={isPending || isLoading || !value.trim()}
				>
					Salvar
				</Button>
			</div>
		</div>
	)

	if (isMobile)
		return (
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Renomear chat</DrawerTitle>
						<DrawerDescription>
							Defina um novo título para esta conversa.
						</DrawerDescription>
					</DrawerHeader>
					<div className="px-4 pb-4">{body}</div>
					<DrawerFooter />
				</DrawerContent>
			</Drawer>
		)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Renomear chat</DialogTitle>
					<DialogDescription>
						Defina um novo título para esta conversa.
					</DialogDescription>
				</DialogHeader>
				{body}
			</DialogContent>
		</Dialog>
	)
}
