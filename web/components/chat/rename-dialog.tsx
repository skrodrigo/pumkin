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
import { useTranslations } from 'next-intl'

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
	const t = useTranslations('dialogs.renameChat')

	const body = (
		<div className="flex flex-col gap-3">
			<Input
				value={value}
				onChange={(e) => onChangeValue(e.target.value)}
				className="h-10"
			/>
			<div className="flex justify-end gap-2">
				<Button variant="outline" onClick={() => onOpenChange(false)}>
					{t('cancel', { defaultValue: 'Cancelar' })}
				</Button>
				<Button onClick={onSave} disabled={isPending || isLoading || !value.trim()}>
					{t('confirm', { defaultValue: 'Salvar' })}
				</Button>
			</div>
		</div>
	)

	if (isMobile)
		return (
			<Drawer open={open} onOpenChange={onOpenChange}>
				<DrawerContent>
					<DrawerHeader>
						<DrawerTitle>{t('title')}</DrawerTitle>
						<DrawerDescription>{t('description')}</DrawerDescription>
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
					<DialogTitle>{t('title')}</DialogTitle>
					<DialogDescription>{t('description')}</DialogDescription>
				</DialogHeader>
				{body}
			</DialogContent>
		</Dialog>
	)
}
