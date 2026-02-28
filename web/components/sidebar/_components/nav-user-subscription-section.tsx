import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface UsageData {
	dayCount: number
	weekCount: number
	monthCount: number
	limits: {
		promptsDay: number
		promptsWeek: number
		promptsMonth: number
	}
}

interface NavUserSubscriptionSectionProps {
	isLoading: boolean
	hasActiveSubscription: boolean
	isManaging: boolean
	managePlan: () => void
	subscribe: () => void
	shouldShowUsage: boolean
	usageData: UsageData | null
}

export function NavUserSubscriptionSection({
	isLoading,
	hasActiveSubscription,
	isManaging,
	managePlan,
	subscribe,
	shouldShowUsage,
	usageData,
}: NavUserSubscriptionSectionProps) {
	return (
		<div className="pt-2">
			<h3 className="text-sm font-medium text-foreground/90">Plano</h3>
			{isLoading ? (
				<div className="mt-2 flex items-center justify-between text-sm">
					<Skeleton className="h-5 w-12" />
					<Skeleton className="h-5 w-20" />
				</div>
			) : (
				<div className="mt-2 flex items-center justify-between text-sm bg-background md:bg-muted/30 p-2 rounded-xl">
					<div>
						<div className="text-foreground/60">
							{hasActiveSubscription ? 'Ativo' : 'Sem plano'}
						</div>
					</div>
					{hasActiveSubscription ? (
						<Button
							size="sm"
							variant="secondary"
							onClick={managePlan}
							disabled={isManaging}
						>
							{isManaging ? 'Abrindo…' : 'Gerenciar plano'}
						</Button>
					) : (
						<Button size="sm" variant="default" onClick={subscribe}>
							Assine agora
						</Button>
					)}
				</div>
			)}

			{hasActiveSubscription && isLoading ? (
				<div className="pt-4">
					<h3 className="text-sm font-medium text-foreground/90">Uso do Plano</h3>
					<div className="mt-2 space-y-2">
						<div className="flex justify-between">
							<Skeleton className="h-4 w-1/4" />
							<Skeleton className="h-4 w-1/12" />
						</div>
						<div className="flex justify-between">
							<Skeleton className="h-4 w-1/4" />
							<Skeleton className="h-4 w-1/12" />
						</div>
						<div className="flex justify-between">
							<Skeleton className="h-4 w-1/4" />
							<Skeleton className="h-4 w-1/12" />
						</div>
					</div>
				</div>
			) : (
				shouldShowUsage &&
				usageData && (
					<div className="pt-4">
						<h3 className="text-sm font-medium text-foreground/90">Uso do Plano</h3>
						<div className="mt-2 space-y-2 text-sm bg-background md:bg-muted/30 p-2 rounded-xl">
							<div className="flex justify-between">
								<span className="text-foreground/60">Hoje</span>
								<span className="font-medium">
									{usageData.dayCount}/
									<span className="text-foreground/60">
										{usageData.limits.promptsDay}
									</span>
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-foreground/60">Esta semana</span>
								<span className="font-medium">
									{usageData.weekCount}/
									<span className="text-foreground/60">
										{usageData.limits.promptsWeek}
									</span>
								</span>
							</div>
							<div className="flex justify-between">
								<span className="text-foreground/60">Este mês</span>
								<span className="font-medium">
									{usageData.monthCount}/
									<span className="text-foreground/60">
										{usageData.limits.promptsMonth}
									</span>
								</span>
							</div>
						</div>
					</div>
				)
			)}
		</div>
	)
}
