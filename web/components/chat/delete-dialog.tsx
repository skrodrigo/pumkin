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
import { useTranslations } from 'next-intl'
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
	const t = useTranslations('dialogs.deleteChat')

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
					<Button variant="destructive" onClick={onConfirm}>
						{t('confirm')}
					</Button>
				)}
			</Button>
			<Button
				className="h-10"
				variant="outline"
				onClick={() => onOpenChange(false)}
			>
				{t('cancel', { defaultValue: 'Cancelar' })}
			</Button>
		</div>
	)

	if (isMobile)
		return (
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>{t('title')}</DrawerTitle>
						<DrawerDescription>
							{t('description')}
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
					<DialogTitle>{t('title')}</DialogTitle>
					<DialogDescription>
						{t('description')}
					</DialogDescription>
				</DialogHeader>
				{actions}
			</DialogContent>
		</Dialog>
	)
}
