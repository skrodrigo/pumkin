import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useTranslations } from 'next-intl'

interface NavUserDataControlsSectionProps {
	archiveAllChats: () => void
	isArchivingChats: boolean
	deleteAllChats: () => void
	isDeletingChats: boolean
	deleteChatsConfirmText: string
	setDeleteChatsConfirmText: (value: string) => void
	deleteChatsDialogOpen: boolean
	setDeleteChatsDialogOpen: (open: boolean) => void
	deleteAccount: () => void
	isDeletingAccount: boolean
	deleteConfirmText: string
	setDeleteConfirmText: (value: string) => void
	deleteDialogOpen: boolean
	setDeleteDialogOpen: (open: boolean) => void
}

export function NavUserDataControlsSection({
	archiveAllChats,
	isArchivingChats,
	deleteAllChats,
	isDeletingChats,
	deleteChatsConfirmText,
	setDeleteChatsConfirmText,
	deleteChatsDialogOpen,
	setDeleteChatsDialogOpen,
	deleteAccount,
	isDeletingAccount,
	deleteConfirmText,
	setDeleteConfirmText,
	deleteDialogOpen,
	setDeleteDialogOpen,
}: NavUserDataControlsSectionProps) {
	const t = useTranslations()
	return (
		<div className="space-y-4 pt-2">
			<div>
				<h3 className="text-sm font-medium text-foreground/70">{t('chats.archiveAllTitle')}</h3>
				<div className="mt-2 text-sm bg-background md:bg-muted/30 p-2 rounded-xl">
					<div className="flex items-center justify-between gap-3">
						<div className="text-sm text-foreground/70">
							{t('chats.archiveAllDescription')}
						</div>
						<Button
							variant="secondary"
							onClick={archiveAllChats}
							disabled={isArchivingChats}
							className="shrink-0 h-9"
						>
							{isArchivingChats ? t('chats.archiving') : t('chats.archiveChats')}
						</Button>
					</div>
				</div>
			</div>

			<div>
				<h3 className="text-sm font-medium text-foreground/70">{t('chats.deleteAllTitle')}</h3>
				<div className="mt-2 text-sm bg-background md:bg-muted/30 p-2 rounded-xl">
					<div className="flex items-center justify-between gap-3">
						<div className="text-sm text-foreground/70">
							{t('chats.deleteAllDescription')}
						</div>
						<AlertDialog
							open={deleteChatsDialogOpen}
							onOpenChange={setDeleteChatsDialogOpen}
						>
							<AlertDialogTrigger asChild>
								<Button variant="destructive" className="shrink-0 h-9">
									{t('chats.deleteChats')}
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>{t('chats.deleteAllTitle')}</AlertDialogTitle>
									<AlertDialogDescription>
										<div className="space-y-2">
											<p>
												{t('chats.deleteAllConfirmDescription')}
											</p>
											<p>
												Para confirmar, digite{' '}
												<span className="font-semibold text-foreground">
													{t('chats.deleteAllConfirm')}
												</span>{' '}
												no campo abaixo.
											</p>
										</div>
									</AlertDialogDescription>
								</AlertDialogHeader>
								<Input
									value={deleteChatsConfirmText}
									onChange={(e) => setDeleteChatsConfirmText(e.target.value)}
									placeholder={t('chats.deleteAllConfirmPlaceholder')}
									autoComplete="off"
									className="placeholder:text-muted-foreground/30"
								/>
								<AlertDialogFooter>
									<AlertDialogCancel
										disabled={isDeletingChats}
										className="border-t h-11! border-border/40! border-r-0! border-l-0! border-b-0! ring-0!"
									>
										{t('common.cancel')}
									</AlertDialogCancel>
									<AlertDialogAction
										variant="destructive"
										disabled={
											isDeletingChats ||
											deleteChatsConfirmText.trim() !== t('chats.deleteAllConfirm')
										}
										className="h-11!"
										onClick={deleteAllChats}
									>
										{isDeletingChats ? <Spinner /> : t('common.delete')}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>
			</div>

			<div>
				<h3 className="text-sm font-medium text-foreground/70">{t('accountDelete.title')}</h3>
				<div className="mt-2 text-sm bg-background md:bg-muted/30 p-2 rounded-xl">
					<div className="flex items-center justify-between gap-3">
						<div className="text-sm text-foreground/70">
							{t('accountDelete.description')}
						</div>
						<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
							<AlertDialogTrigger asChild>
								<Button variant="destructive" className="shrink-0 h-9">
									{t('accountDelete.deleteAccount')}
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>{t('accountDelete.title')}</AlertDialogTitle>
									<AlertDialogDescription>
										<div className="space-y-2">
											<p>
												{t('accountDelete.confirmDescription')}
											</p>
											<p>
												Para confirmar, digite{' '}
												<span className="font-semibold text-foreground">
													{t('accountDelete.confirm')}
												</span>{' '}
												no campo abaixo.
											</p>
										</div>
									</AlertDialogDescription>
								</AlertDialogHeader>
								<Input
									value={deleteConfirmText}
									onChange={(e) => setDeleteConfirmText(e.target.value)}
									placeholder={t('accountDelete.confirmPlaceholder')}
									autoComplete="off"
									className="placeholder:text-muted-foreground/30"
								/>
								<AlertDialogFooter>
									<AlertDialogCancel
										disabled={isDeletingAccount}
										className="border-t h-11! border-border/40! border-r-0! border-l-0! border-b-0! ring-0!"
									>
										{t('common.cancel')}
									</AlertDialogCancel>
									<AlertDialogAction
										variant="destructive"
										disabled={
											isDeletingAccount ||
											deleteConfirmText.trim() !== t('accountDelete.confirm')
										}
										className="h-11!"
										onClick={deleteAccount}
									>
										{isDeletingAccount ? <Spinner /> : t('common.delete')}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>
			</div>
		</div>
	)
}
