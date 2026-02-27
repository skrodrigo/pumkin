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
import { Icon } from '@/components/ui/icon'
import { useIsMobile } from '@/hooks/use-mobile'
import { Loading03Icon } from '@hugeicons/core-free-icons'

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
	const isMobile = useIsMobile()

	const actions = (
		<div className="flex justify-end gap-2">
			<Button
				variant="destructive"
				className="h-10"
				onClick={onConfirm}
				disabled={isPending || isLoading}
			>
				{isLoading ? (
					<Icon icon={Loading03Icon} className="mr-2 size-4 animate-spin" />
				) : (
					'Excluir Chat'
				)}
			</Button>
			<Button
				className="h-10"
				variant="outline"
				onClick={onCancel}
				disabled={isPending || isLoading}
			>
				Cancelar
			</Button>
		</div>
	)

	if (isMobile)
		return (
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>Confirmar exclusão</DrawerTitle>
						<DrawerDescription>
							Tem certeza que deseja excluir este chat? Esta ação não pode ser
							desfeita.
						</DrawerDescription>
					</DrawerHeader>
					<DrawerFooter className="flex-row justify-end gap-2">
						{actions}
					</DrawerFooter>
				</DrawerContent>
			</Drawer>
		)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Confirmar exclusão</DialogTitle>
					<DialogDescription>
						Tem certeza que deseja excluir este chat? Esta ação não pode ser
						desfeita.
					</DialogDescription>
				</DialogHeader>
				{actions}
			</DialogContent>
		</Dialog>
	)
}
