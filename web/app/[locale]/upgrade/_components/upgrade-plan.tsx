'use client'

import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { stripeService } from '@/data/stripe'
import type { StripePriceInfo, StripeCouponInfo } from '@/data/stripe'
import { ArrowLeft01Icon, CouponPercentIcon, HelpCircleIcon } from '@hugeicons/core-free-icons'
import { Icon } from '@/components/ui/icon'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'

function formatBrl(unitAmount: number) {
	return `R$${(unitAmount / 100).toFixed(2).replace('.', ',')}`
}

function calculateDiscountedPrice(unitAmount: number, coupon: StripeCouponInfo | null): number {
	if (!coupon) return unitAmount
	if (coupon.percentOff) {
		return Math.round(unitAmount * (1 - coupon.percentOff / 100))
	}
	if (coupon.amountOff) {
		return Math.max(0, unitAmount - coupon.amountOff)
	}
	return unitAmount
}

export function UpgradePlanPage(props: {
	returnTo?: string
}) {
	const t = useTranslations('upgrade')
	const router = useRouter()
	const locale = useLocale()
	const [value, setValue] = useState<'monthly' | 'annual'>('annual')
	const [monthlyPrice, setMonthlyPrice] = useState<StripePriceInfo | null>(null)
	const [yearlyPrice, setYearlyPrice] = useState<StripePriceInfo | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [showCouponInput, setShowCouponInput] = useState(false)
	const [couponCode, setCouponCode] = useState('')
	const [validatedCoupon, setValidatedCoupon] = useState<StripeCouponInfo | null>(null)
	const [couponError, setCouponError] = useState<string | null>(null)
	const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
	const [promotionCodeId, setPromotionCodeId] = useState<string | null>(null)

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
	const returnTo = props.returnTo
	const returnToQuery = returnTo && returnTo.startsWith('/')
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
				<Icon icon={ArrowLeft01Icon} className="size-5" />
			</Button>

			<div className="min-h-[calc(100vh-2rem)] w-full grid place-items-center">
				<div className="w-full max-w-md px-4 sm:px-6">
					<div className="text-center">
						<h2 className="text-2xl ">{t('choosePlan')}</h2>
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
								<div className="font-semibold">{t('proMonthly')}</div>
							</div>
							<div className="text-right">
								<div className="font-semibold">
									{isLoading
										? <Skeleton className="h-5 w-14" />
										: monthlyPrice?.unitAmount
											? (
												<>
													{validatedCoupon && (
														<span className="text-muted-foreground line-through mr-2">
															{formatBrl(monthlyPrice.unitAmount)}
														</span>
													)}
													{formatBrl(calculateDiscountedPrice(monthlyPrice.unitAmount, validatedCoupon))}
												</>
											)
											: '—'}
								</div>
								<div className="text-sm text-muted-foreground">{t('perMonth')}</div>
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
								<div className="font-semibold">{t('proAnnual')}</div>
							</div>
							<div className="text-right">
								<div className="flex gap-2 justify-end">
									{!isLoading && monthlyPrice?.unitAmount && (
										<div className="font-semibold text-muted-foreground line-through">
											{formatBrl(monthlyPrice.unitAmount * 12)}
										</div>
									)}
									<div className="font-semibold">
										{isLoading
											? <Skeleton className="h-5 w-16" />
											: yearlyPrice?.unitAmount
												? formatBrl(calculateDiscountedPrice(yearlyPrice.unitAmount, validatedCoupon))
												: '—'}
									</div>
								</div>
								<div className="text-sm text-muted-foreground">{t('perYear')}</div>
							</div>
						</label>
					</RadioGroup>

					<div className="mt-4">
						<button
							type="button"
							className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
							onClick={() => setShowCouponInput(!showCouponInput)}
						>
							<Icon icon={CouponPercentIcon} className="size-4" />
							{showCouponInput ? t('noCoupon') : `${t('haveCoupon')} ?`}
						</button>

						{showCouponInput && (
							<div className="flex flex-col gap-2 mt-2">
								<div className="flex gap-2">
									<input
										type="text"
										placeholder={t('couponPlaceholder')}
										value={couponCode}
										onChange={(e) => {
											setCouponCode(e.target.value.toUpperCase())
											setValidatedCoupon(null)
											setCouponError(null)
										}}
										className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
									/>
									<Button
										variant="secondary"
										disabled={!couponCode.trim() || isValidatingCoupon}
										onClick={async () => {
											if (!couponCode.trim()) return
											setIsValidatingCoupon(true)
											setCouponError(null)
											try {
												const result = await stripeService.validatePromotionCode(couponCode.trim())
												if (result.valid) {
													setValidatedCoupon(result.coupon)
													setPromotionCodeId(result.promotionCodeId)
												} else {
													setCouponError(result.error)
												}
											} catch {
												setCouponError('Failed to validate coupon')
											} finally {
												setIsValidatingCoupon(false)
											}
										}}
									>
										{t('applyCoupon')}
									</Button>
								</div>
								{couponError && (
									<div className="text-sm text-destructive">{couponError}</div>
								)}
								{validatedCoupon && (
									<div className="flex items-center gap-2 text-sm text-green-600">
										<Icon icon={CouponPercentIcon} className="size-4" />
										<span>
											{validatedCoupon.percentOff
												? `${validatedCoupon.percentOff}% off ${t('couponApplied')}`
												: validatedCoupon.amountOff
													? `${formatBrl(validatedCoupon.amountOff)} off ${t('couponApplied')}`
													: t('couponApplied')}
										</span>
									</div>
								)}
							</div>
						)}
					</div>

					<Button
						className="mt-6 w-full"
						onClick={() => {
							const planPath = value === 'monthly' ? 'monthly' : 'annual'
							const params = new URLSearchParams()
							if (returnTo) params.set('returnTo', returnTo)
							if (promotionCodeId) params.set('coupon', promotionCodeId)
							const queryString = params.toString()
							router.push(locale === 'pt' ? `/upgrade/${planPath}${queryString ? `?${queryString}` : ''}` : `/${locale}/upgrade/${planPath}${queryString ? `?${queryString}` : ''}`)
						}}
					>
						{t('continueToPayment')}
					</Button>
				</div>
			</div>
		</div>
	)
}
