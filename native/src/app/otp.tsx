import { useLocalSearchParams, router } from 'expo-router'
import React from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useAuth } from '../context/auth.context'
import { authOtpService } from '../data/auth'

export default function OtpScreen() {
	const { email } = useLocalSearchParams<{ email?: string }>()
	const { verifyOtp } = useAuth()
	const [code, setCode] = React.useState('')
	const [error, setError] = React.useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = React.useState(false)

	const effectiveEmail = typeof email === 'string' ? email : ''

	async function handleResend() {
		if (!effectiveEmail) return
		try {
			await authOtpService.request({ email: effectiveEmail })
		} catch {
		}
	}

	async function handleVerify() {
		if (!effectiveEmail) return
		setError(null)
		setIsSubmitting(true)
		try {
			await verifyOtp({ email: effectiveEmail, code })
			router.replace('/')
		} catch (e: any) {
			try {
				const parsed = JSON.parse(e?.message ?? '{}')
				setError(parsed?.error ?? 'Código inválido')
			} catch {
				setError('Código inválido')
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<View className="flex-1 bg-neutral-950 px-4">
			<StatusBar style="light" />
			<View className="flex-1 justify-center">
				<Text className="text-neutral-200 text-3xl font-semibold">Verificar</Text>
				<Text className="mt-2 text-neutral-400">{effectiveEmail}</Text>
				<View className="mt-8 gap-3">
					<TextInput
						value={code}
						onChangeText={setCode}
						keyboardType="number-pad"
						placeholder="Código"
						placeholderTextColor="#737373"
						className="h-12 rounded-xl bg-neutral-900 border border-neutral-800 px-4 text-neutral-200"
					/>
					{error ? <Text className="text-red-400">{error}</Text> : null}
					<Pressable
						onPress={handleVerify}
						disabled={isSubmitting}
						className="h-12 items-center justify-center rounded-xl bg-amber-400"
					>
						<Text className="text-neutral-900 font-semibold">
							{isSubmitting ? 'Verificando...' : 'Confirmar'}
						</Text>
					</Pressable>
					<Pressable onPress={handleResend} className="h-12 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800">
						<Text className="text-neutral-200 font-semibold">Reenviar código</Text>
					</Pressable>
				</View>
			</View>
		</View>
	)
}
