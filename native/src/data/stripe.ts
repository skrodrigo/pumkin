import { fetchJson } from './api'

export interface StripePrice {
	readonly id: string
	readonly currency: string
	readonly unitAmount: number | null
	readonly recurring: unknown | null
}

export interface StripePricesResponse {
	readonly pro_monthly: StripePrice | null
	readonly pro_yearly: StripePrice | null
}

export const stripeService = {
	async getPrices() {
		return fetchJson<StripePricesResponse>({
			path: '/api/stripe/prices',
		})
	},

	async createCheckout(params: {
		readonly token: string
		readonly plan: 'pro_monthly' | 'pro_yearly'
		readonly promotionCodeId?: string
	}) {
		return fetchJson<{ readonly id: string; readonly url: string }>({
			path: '/api/stripe/checkout',
			method: 'POST',
			token: params.token,
			body: {
				plan: params.plan,
				promotionCodeId: params.promotionCodeId,
			},
		})
	},

	async createPortal(params: { readonly token: string }) {
		return fetchJson<{ readonly url: string }>({
			path: '/api/stripe/portal',
			method: 'POST',
			token: params.token,
		})
	},

	async cancel(params: { readonly token: string }) {
		return fetchJson<{ readonly success: boolean }>({
			path: '/api/stripe/cancel',
			method: 'POST',
			token: params.token,
		})
	},
}
