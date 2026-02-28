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
	return (
		<div className="space-y-4 pt-2">
			<div>
				<h3 className="text-sm font-medium text-foreground/70">Arquivar chats</h3>
				<div className="mt-2 text-sm bg-background md:bg-muted/30 p-2 rounded-xl">
					<div className="flex items-center justify-between gap-3">
						<div className="text-sm text-foreground/70">
							Mover todos os chats para os arquivados
						</div>
						<Button
							variant="secondary"
							onClick={archiveAllChats}
							disabled={isArchivingChats}
							className="shrink-0 h-9"
						>
							{isArchivingChats ? 'Arquivando…' : 'Arquivar Chats'}
						</Button>
					</div>
				</div>
			</div>

			<div>
				<h3 className="text-sm font-medium text-foreground/70">Excluir chats</h3>
				<div className="mt-2 text-sm bg-background md:bg-muted/30 p-2 rounded-xl">
					<div className="flex items-center justify-between gap-3">
						<div className="text-sm text-foreground/70">
							Excluir permanentemente todos os chats
						</div>
						<AlertDialog
							open={deleteChatsDialogOpen}
							onOpenChange={setDeleteChatsDialogOpen}
						>
							<AlertDialogTrigger asChild>
								<Button variant="destructive" className="shrink-0 h-9">
									Excluir Chats
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Excluir todos os chats</AlertDialogTitle>
									<AlertDialogDescription>
										<div className="space-y-2">
											<p>
												Isso vai excluir permanentemente todos os seus chats e não será possível recuperar.
											</p>
											<p>
												Para confirmar, digite{' '}
												<span className="font-semibold text-foreground">
													EXCLUIR CHATS
												</span>{' '}
												no campo abaixo.
											</p>
										</div>
									</AlertDialogDescription>
								</AlertDialogHeader>
								<Input
									value={deleteChatsConfirmText}
									onChange={(e) => setDeleteChatsConfirmText(e.target.value)}
									placeholder="digite EXCLUIR CHATS para confirmar"
									autoComplete="off"
									className="placeholder:text-muted-foreground/30"
								/>
								<AlertDialogFooter>
									<AlertDialogCancel
										disabled={isDeletingChats}
										className="border-t h-11! border-border/40! border-r-0! border-l-0! border-b-0! ring-0!"
									>
										Cancelar
									</AlertDialogCancel>
									<AlertDialogAction
										variant="destructive"
										disabled={
											isDeletingChats ||
											deleteChatsConfirmText.trim() !== 'EXCLUIR CHATS'
										}
										className="h-11!"
										onClick={deleteAllChats}
									>
										{isDeletingChats ? <Spinner /> : 'Excluir'}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</div>
			</div>

			<div>
				<h3 className="text-sm font-medium text-foreground/70">Excluir conta</h3>
				<div className="mt-2 text-sm bg-background md:bg-muted/30 p-2 rounded-xl">
					<div className="flex items-center justify-between gap-3">
						<div className="text-sm text-foreground/70">
							Excluir permanentemente sua conta
						</div>
						<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
							<AlertDialogTrigger asChild>
								<Button variant="destructive" className="shrink-0 h-9">
									Excluir Conta
								</Button>
							</AlertDialogTrigger>
							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>Excluir conta</AlertDialogTitle>
									<AlertDialogDescription>
										<div className="space-y-2">
											<p>
												Isso vai excluir permanentemente sua conta e não será possível recuperar.
											</p>
											<p>
												Para confirmar, digite{' '}
												<span className="font-semibold text-foreground">
													EXCLUIR CONTA
												</span>{' '}
												no campo abaixo.
											</p>
										</div>
									</AlertDialogDescription>
								</AlertDialogHeader>
								<Input
									value={deleteConfirmText}
									onChange={(e) => setDeleteConfirmText(e.target.value)}
									placeholder="digite EXCLUIR CONTA para confirmar"
									autoComplete="off"
									className="placeholder:text-muted-foreground/30"
								/>
								<AlertDialogFooter>
									<AlertDialogCancel
										disabled={isDeletingAccount}
										className="border-t h-11! border-border/40! border-r-0! border-l-0! border-b-0! ring-0!"
									>
										Cancelar
									</AlertDialogCancel>
									<AlertDialogAction
										variant="destructive"
										disabled={
											isDeletingAccount ||
											deleteConfirmText.trim() !== 'EXCLUIR CONTA'
										}
										className="h-11!"
										onClick={deleteAccount}
									>
										{isDeletingAccount ? <Spinner /> : 'Excluir'}
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
