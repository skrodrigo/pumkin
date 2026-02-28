import { Button } from '@/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { useState } from 'react'
import type { ChangeEvent, Dispatch, SetStateAction } from 'react'

interface AccountProfile {
	name: string
	occupation: string | null
	aiInstructions: string | null
}

interface NavUserAccountSectionProps {
	initialName: string
	profile: AccountProfile | null
	setProfile: Dispatch<SetStateAction<AccountProfile | null>>
	isLoading: boolean
	isSavingProfile: boolean
	nameDialogOpen: boolean
	setNameDialogOpen: (open: boolean) => void
	nameDraft: string
	setNameDraft: (value: string) => void
	saveProfile: () => void
	patchProfile: (payload: Partial<AccountProfile>) => Promise<void>
}

export function NavUserAccountSection({
	initialName,
	profile,
	setProfile,
	isLoading,
	isSavingProfile,
	nameDialogOpen,
	setNameDialogOpen,
	nameDraft,
	setNameDraft,
	saveProfile,
	patchProfile,
}: NavUserAccountSectionProps) {
	const [occupationDialogOpen, setOccupationDialogOpen] = useState(false)
	const [occupationDraft, setOccupationDraft] = useState('')

	const handleChangeOccupation = (e: ChangeEvent<HTMLInputElement>) => {
		setProfile((prev) =>
			prev
				? { ...prev, occupation: e.target.value }
				: {
					name: initialName,
					occupation: e.target.value,
					aiInstructions: null,
				},
		)
	}

	const handleChangeAiInstructions = (
		e: ChangeEvent<HTMLTextAreaElement>,
	) => {
		setProfile((prev) =>
			prev
				? { ...prev, aiInstructions: e.target.value }
				: {
					name: initialName,
					occupation: null,
					aiInstructions: e.target.value,
				},
		)
	}

	const nameValue = profile?.name?.trim().length
		? profile.name
		: initialName

	const occupationValue = profile?.occupation?.trim().length
		? profile.occupation
		: 'Sem dados'

	return (
		<div>
			<h3 className="text-sm font-medium text-foreground/70">Perfil</h3>
			<div className="mt-2 space-y-2">
				<div className="text-sm bg-background md:bg-muted/30 p-2 rounded-xl">
					<div className="flex items-center justify-between gap-3">
						<div className="min-w-0 flex flex-col space-y-1">
							<div className="text-xs text-muted-foreground">Nome</div>
							<div className="truncate text-sm text-foreground">{nameValue}</div>
						</div>
						<Button
							size="icon"
							variant="ghost"
							onClick={() => {
								setNameDraft(profile?.name ?? initialName)
								setNameDialogOpen(true)
							}}
							disabled={isLoading}
							className="shrink-0"
						>
							<Icon icon={ArrowRight01Icon} className="size-4" />
						</Button>
					</div>
				</div>
				<div className="text-sm bg-background md:bg-muted/30 p-2 rounded-xl">
					<div className="flex items-center justify-between gap-3">
						<div className="min-w-0 flex flex-col space-y-1">
							<div className="text-xs text-muted-foreground">Ocupação</div>
							<div className="truncate text-sm text-foreground">{occupationValue}</div>
						</div>
						<Button
							size="icon"
							variant="ghost"
							onClick={() => {
								setOccupationDraft(profile?.occupation ?? '')
								setOccupationDialogOpen(true)
							}}
							disabled={isLoading}
							className="shrink-0"
						>
							<Icon icon={ArrowRight01Icon} className="size-4" />
						</Button>
					</div>
				</div>
			</div>

			<div className="mt-3 space-y-2 text-sm bg-background md:bg-muted/30 p-2 rounded-xl">
				<div className="space-y-1">
					<div className="text-xs text-muted-foreground">Instruções de IA</div>
					<Textarea
						value={profile?.aiInstructions ?? ''}
						onChange={handleChangeAiInstructions}
						disabled={isLoading}
						rows={4}
						className="min-h-[200px]"
					/>
				</div>
				<div className="flex justify-end">
					<Button
						size="sm"
						variant="secondary"
						onClick={saveProfile}
						disabled={
							isLoading ||
							isSavingProfile ||
							!(profile?.name?.trim().length || initialName?.trim().length)
						}
					>
						{isSavingProfile ? 'Salvando…' : 'Salvar'}
					</Button>
				</div>
			</div>

			<Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Editar nome</DialogTitle>
						<DialogDescription>
							Esse nome será exibido na sua conta.
						</DialogDescription>
					</DialogHeader>
					<Input
						value={nameDraft}
						onChange={(e) => setNameDraft(e.target.value)}
						autoComplete="name"
					/>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => setNameDialogOpen(false)}
							disabled={isSavingProfile}
						>
							Cancelar
						</Button>
						<Button
							variant="secondary"
							onClick={async () => {
								await patchProfile({ name: nameDraft })
								setNameDialogOpen(false)
							}}
							disabled={isSavingProfile || !nameDraft.trim().length}
						>
							Salvar
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog
				open={occupationDialogOpen}
				onOpenChange={setOccupationDialogOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Editar ocupação</DialogTitle>
						<DialogDescription>
							Essa informação ajuda a personalizar sua experiência.
						</DialogDescription>
					</DialogHeader>
					<Input
						value={occupationDraft}
						onChange={(e) => setOccupationDraft(e.target.value)}
						autoComplete="organization-title"
					/>
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => setOccupationDialogOpen(false)}
							disabled={isSavingProfile}
						>
							Cancelar
						</Button>
						<Button
							variant="secondary"
							onClick={async () => {
								await patchProfile({
									occupation: occupationDraft.trim().length
										? occupationDraft
										: null,
								})
								setOccupationDialogOpen(false)
							}}
							disabled={isSavingProfile}
						>
							Salvar
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
