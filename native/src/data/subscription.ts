import { fetchJson } from './api'

export interface Subscription {
	readonly id: string
	readonly status: string
	readonly plan: string | null
	readonly periodStart: string | null
	readonly periodEnd: string | null
	readonly cancelAtPeriodEnd: boolean | null
}

export const subscriptionService = {
	async get(params: { readonly token: string }) {
		return fetchJson<Subscription | null>({
			path: '/api/subscription',
			token: params.token,
		})
	},

	async deleteIncomplete(params: { readonly token: string }) {
		return fetchJson<{ readonly success: boolean }>({
			path: '/api/subscription/incomplete',
			method: 'DELETE',
			token: params.token,
		})
	},
}
