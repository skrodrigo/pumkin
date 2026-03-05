import type { PropsWithChildren } from 'react'
import React from 'react'
import * as SecureStore from 'expo-secure-store'
import { authOtpService, authService, type User } from '../data/auth'

const AUTH_TOKEN_KEY = 'auth_token'

export interface AuthContextValue {
	readonly isLoading: boolean
	readonly token: string | null
	readonly user: User | null
	readonly login: (params: {
		readonly email: string
		readonly password: string
	}) => Promise<{ readonly otpRequired: boolean }>
	readonly verifyOtp: (params: {
		readonly email: string
		readonly code: string
	}) => Promise<void>
	readonly logout: () => Promise<void>
	readonly refreshMe: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function useAuth() {
	const ctx = React.useContext(AuthContext)
	if (!ctx) throw new Error('useAuth must be used within AuthProvider')
	return ctx
}

async function readToken() {
	const raw = await SecureStore.getItemAsync(AUTH_TOKEN_KEY)
	return typeof raw === 'string' && raw.length > 0 ? raw : null
}

async function writeToken(token: string | null) {
	if (!token) {
		await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY)
		return
	}
	await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token)
}

export function AuthProvider({ children }: PropsWithChildren) {
	const [isLoading, setIsLoading] = React.useState(true)
	const [token, setToken] = React.useState<string | null>(null)
	const [user, setUser] = React.useState<User | null>(null)

	const refreshMe = React.useCallback(async () => {
		if (!token) {
			setUser(null)
			return
		}
		const me = await authService.me({ token })
		setUser(me)
	}, [token])

	React.useEffect(() => {
		let isMounted = true
		void (async () => {
			try {
				const stored = await readToken()
				if (!isMounted) return
				setToken(stored)
			} finally {
				if (isMounted) setIsLoading(false)
			}
		})()

		return () => {
			isMounted = false
		}
	}, [])

	React.useEffect(() => {
		if (!token) return
		void refreshMe().catch(async () => {
			await writeToken(null)
			setToken(null)
			setUser(null)
		})
	}, [refreshMe, token])

	const login = React.useCallback(
		async (params: { readonly email: string; readonly password: string }) => {
			const res = await authService.login(params)
			const otpRequired = Boolean(res.otpRequired)
			if (otpRequired || !res.token) {
				return { otpRequired: true }
			}
			await writeToken(res.token)
			setToken(res.token)
			return { otpRequired: false }
		},
		[],
	)

	const verifyOtp = React.useCallback(async (params: { readonly email: string; readonly code: string }) => {
		const res = await authOtpService.verify(params)
		await writeToken(res.token)
		setToken(res.token)
	}, [])

	const logout = React.useCallback(async () => {
		await writeToken(null)
		setToken(null)
		setUser(null)
	}, [])

	const value = React.useMemo<AuthContextValue>(
		() => ({
			isLoading,
			token,
			user,
			login,
			verifyOtp,
			logout,
			refreshMe,
		}),
		[isLoading, token, user, login, verifyOtp, logout, refreshMe],
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
