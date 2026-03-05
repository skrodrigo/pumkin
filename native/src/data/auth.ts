import { fetchJson } from './api'

export interface AuthTokenResponse {
	readonly token: string
	readonly otpRequired?: boolean
}

export interface User {
	readonly id: string
	readonly name: string
	readonly email: string
	readonly emailVerified: boolean
	readonly image?: string | null
	readonly createdAt: string
	readonly updatedAt: string
	readonly stripeCustomerId?: string | null
}

export const authService = {
	async login(params: { readonly email: string; readonly password: string }) {
		return fetchJson<AuthTokenResponse>({
			path: '/api/auth/login',
			method: 'POST',
			body: params,
		})
	},

	async register(params: {
		readonly name: string
		readonly email: string
		readonly password: string
	}) {
		return fetchJson<{ readonly otpRequired?: boolean }>({
			path: '/api/auth/register',
			method: 'POST',
			body: params,
		})
	},

	async me(params: { readonly token: string }) {
		return fetchJson<User>({
			path: '/api/auth/me',
			token: params.token,
		})
	},
}

export const authOtpService = {
	async request(params: { readonly email: string }) {
		return fetchJson<{ readonly success: boolean }>({
			path: '/api/auth/otp/request',
			method: 'POST',
			body: params,
		})
	},

	async verify(params: { readonly email: string; readonly code: string }) {
		return fetchJson<{ readonly token: string }>({
			path: '/api/auth/otp/verify',
			method: 'POST',
			body: params,
		})
	},
}
