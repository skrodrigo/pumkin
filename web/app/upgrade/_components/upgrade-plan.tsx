'use client'

import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { stripeService } from '@/data/stripe'
import type { StripePriceInfo } from '@/data/stripe'
import { ArrowLeft } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

function formatBrl(unitAmount: number) {
	return `R$${(unitAmount / 100).toFixed(2).replace('.', ',')}`
}

export function UpgradePlanPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const [value, setValue] = useState<'monthly' | 'annual'>('annual')
	const [monthlyPrice, setMonthlyPrice] = useState<StripePriceInfo | null>(null)
	const [yearlyPrice, setYearlyPrice] = useState<StripePriceInfo | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		async function load() {
			setIsLoading(true)
			try {
				const prices = await stripeService.getPrices()
				setMonthlyPrice(prices.pro_monthly)
				setYearlyPrice(prices.pro_yearly)
			} catch {
				setMonthlyPrice(null)
				setYearlyPrice(null)
			} finally {
				setIsLoading(false)
			}
		}
		load()
	}, [])

	const goBack = () => router.back()
	const returnTo = searchParams.get('returnTo')
	const returnToQuery = returnTo
		? `?returnTo=${encodeURIComponent(returnTo)}`
		: ''

	return (
		<div className="relative min-h-[calc(100vh-2rem)] w-full p-4 md:max-w-5xl mx-auto">
			<Button
				variant="ghost"
				size="icon"
				className="absolute left-4 top-4"
				onClick={goBack}
			>
				<ArrowLeft className="size-5" />
			</Button>

			<div className="min-h-[calc(100vh-2rem)] w-full grid place-items-center">
				<div className="w-full max-w-md px-4 sm:px-6">
					<div className="text-center">
						<h2 className="text-2xl ">Escolha um Plano para continuar</h2>
					</div>

					<RadioGroup
						value={value}
						onValueChange={(next) => {
							setValue(next as 'monthly' | 'annual')
						}}
						className="mt-6 grid gap-3"
					>
						<label
							className={
								`flex items-center gap-3 rounded-md border p-4 cursor-pointer transition-colors ` +
								(value === 'monthly'
									? 'border-primary'
									: 'border-border')
							}
						>
							<RadioGroupItem value="monthly" />
							<div className="flex-1">
								<div className="font-semibold">Pro</div>
								<div className="text-sm text-muted-foreground">Cobrança mensal</div>
							</div>
							<div className="text-right">
								<div className="font-semibold">
									{isLoading
										? <Skeleton className="h-5 w-14" />
										: monthlyPrice?.unitAmount
											? formatBrl(monthlyPrice.unitAmount)
											: '—'}
								</div>
								<div className="text-sm text-muted-foreground">/mês</div>
							</div>
						</label>

						<label
							className={
								`flex items-center gap-3 rounded-md border p-4 cursor-pointer transition-colors ` +
								(value === 'annual'
									? 'border-primary'
									: 'border-border')
							}
						>
							<RadioGroupItem value="annual" />
							<div className="flex-1">
								<div className="font-semibold">Pro anual</div>
								<div className="text-sm text-muted-foreground">Cobrança anual</div>
							</div>
							<div className="text-right">
								<div className="font-semibold">
									{isLoading
										? <Skeleton className="h-5 w-16" />
										: yearlyPrice?.unitAmount
											? formatBrl(yearlyPrice.unitAmount)
											: '—'}
								</div>
								<div className="text-sm text-muted-foreground">/ano</div>
							</div>
						</label>
					</RadioGroup>

					<Button
						className="mt-6 w-full"
						onClick={() => router.push(`/upgrade/${value}${returnToQuery}`)}
					>
						Continuar para pagamento
					</Button>
				</div>
			</div>
		</div>
	)
}
