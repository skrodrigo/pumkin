import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import * as Linking from 'expo-linking'
import { useAuth } from '../context/auth.context'
import { subscriptionService } from '../data/subscription'
import { stripeService } from '../data/stripe'

export default function UpgradeScreen() {
	const { token } = useAuth()
	const [isLoading, setIsLoading] = React.useState(true)
	const [isPro, setIsPro] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)

	React.useEffect(() => {
		let isMounted = true
		;(async () => {
			if (!token) return
			try {
				const sub = await subscriptionService.get({ token })
				if (!isMounted) return
				setIsPro(sub?.status === 'active' || sub?.status === 'trialing')
			} catch (e: any) {
				if (!isMounted) return
				setError(e?.message ?? 'Erro')
			} finally {
				if (isMounted) setIsLoading(false)
			}
		})()
		return () => {
			isMounted = false
		}
	}, [token])

	async function handleCheckout(plan: 'pro_monthly' | 'pro_yearly') {
		if (!token) return
		setError(null)
		try {
			const session = await stripeService.createCheckout({ token, plan })
			await Linking.openURL(session.url)
		} catch (e: any) {
			setError(e?.message ?? 'Erro ao abrir checkout')
		}
	}

	async function handlePortal() {
		if (!token) return
		setError(null)
		try {
			const portal = await stripeService.createPortal({ token })
			await Linking.openURL(portal.url)
		} catch (e: any) {
			setError(e?.message ?? 'Erro ao abrir portal')
		}
	}

	return (
		<View className="flex-1 bg-neutral-950 px-4">
			<StatusBar style="light" />
			<View className="flex-1 justify-center">
				<Text className="text-neutral-200 text-3xl font-semibold">Upgrade</Text>
				{isLoading ? <Text className="mt-3 text-neutral-400">Carregando...</Text> : null}
				{!isLoading ? (
					<View className="mt-8 gap-3">
						{isPro ? (
							<Pressable onPress={handlePortal} className="h-12 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800">
								<Text className="text-neutral-200 font-semibold">Gerenciar assinatura</Text>
							</Pressable>
						) : (
							<>
								<Pressable onPress={() => handleCheckout('pro_monthly')} className="h-12 items-center justify-center rounded-xl bg-amber-400">
									<Text className="text-neutral-900 font-semibold">Pro mensal</Text>
								</Pressable>
								<Pressable onPress={() => handleCheckout('pro_yearly')} className="h-12 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800">
									<Text className="text-neutral-200 font-semibold">Pro anual</Text>
								</Pressable>
							</>
						)}
						{error ? <Text className="text-red-400">{error}</Text> : null}
					</View>
				) : null}
			</View>
		</View>
	)
}
