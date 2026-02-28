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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { useState } from 'react'
import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import Flag from 'react-flagpack'
import 'react-flagpack/dist/style.css'

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
	const [isChangingLocale, setIsChangingLocale] = useState(false)
	const t = useTranslations()
	const currentLocale = useLocale()
	const router = useRouter()
	const pathname = usePathname()

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
		: t('settings.occupationPlaceholder')

	const handleLocaleChange = async (newLocale: string) => {
		if (newLocale === currentLocale) return
		setIsChangingLocale(true)
		try {
			await fetch('/api/account/locale', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ locale: newLocale }),
			})
			const segments = pathname.split('/')
			const isLocalePath = ['en', 'fr', 'es', 'pt'].includes(segments[1])
			const newPath = isLocalePath
				? `/${newLocale}/${segments.slice(2).join('/')}`
				: newLocale === 'pt'
					? pathname
					: `/${newLocale}${pathname}`
			router.push(newPath)
			router.refresh()
		} finally {
			setIsChangingLocale(false)
		}
	}

	const localeToCountry: Record<string, string> = {
		pt: 'BR',
		en: 'US',
		es: 'ES',
		fr: 'FR',
	}

	const currentFlag = localeToCountry[currentLocale] || 'US'

	return (
		<div>
			<h3 className="text-sm font-medium text-foreground/70">{t('settings.profile')}</h3>
			<div className="mt-2 space-y-2">
				<div className="text-sm bg-background md:bg-muted/30 p-2 rounded-xl">
					<div className="flex items-center justify-between gap-3">
						<div className="min-w-0 flex flex-col space-y-1">
							<div className="text-xs text-muted-foreground">{t('settings.name')}</div>
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
							<div className="text-xs text-muted-foreground">{t('settings.occupation')}</div>
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

			<div className="mt-3 text-sm bg-background md:bg-muted/30 p-2 rounded-xl">
				<div className="flex items-center justify-between gap-3">
					<div className="min-w-0 flex flex-col space-y-1">
						<div className="text-xs text-muted-foreground">{t('settings.language')}</div>
						<div className="truncate text-sm text-foreground">{t('settings.languageName')}</div>
					</div>
					<Select value={currentLocale} onValueChange={handleLocaleChange} disabled={isChangingLocale}>
						<SelectTrigger className="w-[140px] shrink-0">
							<div className="flex items-center gap-2">
								<Flag code={currentFlag} size="S" />
								<SelectValue />
							</div>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="pt">Português</SelectItem>
							<SelectItem value="en">English</SelectItem>
							<SelectItem value="es">Español</SelectItem>
							<SelectItem value="fr">Français</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="mt-3 space-y-2 text-sm bg-background md:bg-muted/30 p-2 rounded-xl">
				<div className="space-y-1">
					<div className="text-xs text-muted-foreground">{t('settings.aiInstructions')}</div>
					<Textarea
						value={profile?.aiInstructions ?? ''}
						onChange={handleChangeAiInstructions}
						disabled={isLoading}
						rows={4}
						className="min-h-[100px]"
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
						{isSavingProfile ? t('common.saving') : t('common.save')}
					</Button>
				</div>
			</div>

			<Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t('account.editName')}</DialogTitle>
						<DialogDescription>{t('account.editNameDescription')}</DialogDescription>
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
							{t('common.cancel')}
						</Button>
						<Button
							variant="secondary"
							onClick={async () => {
								await patchProfile({ name: nameDraft })
								setNameDialogOpen(false)
							}}
							disabled={isSavingProfile || !nameDraft.trim().length}
						>
							{t('common.save')}
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
						<DialogTitle>{t('account.editOccupation')}</DialogTitle>
						<DialogDescription>{t('account.editOccupationDescription')}</DialogDescription>
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
							{t('common.cancel')}
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
							{t('common.save')}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}
