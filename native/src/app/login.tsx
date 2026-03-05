import { router } from 'expo-router'
import React from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useAuth } from '../context/auth.context'

export default function LoginScreen() {
	const { login, isLoading, token } = useAuth()
	const [email, setEmail] = React.useState('')
	const [password, setPassword] = React.useState('')
	const [error, setError] = React.useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = React.useState(false)

	React.useEffect(() => {
		if (isLoading) return
		if (token) router.replace('/')
	}, [isLoading, token])

	async function handleSubmit() {
		setError(null)
		setIsSubmitting(true)
		try {
			const result = await login({ email: email.trim(), password })
			if (result.otpRequired) {
				router.push({ pathname: '/otp', params: { email: email.trim() } })
				return
			}
			router.replace('/')
		} catch (e: any) {
			try {
				const parsed = JSON.parse(e?.message ?? '{}')
				setError(parsed?.error ?? 'Erro ao entrar')
			} catch {
				setError('Erro ao entrar')
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<View className="flex-1 bg-neutral-950 px-4">
			<StatusBar style="light" />
			<View className="flex-1 justify-center">
				<Text className="text-neutral-200 text-3xl font-semibold">Entrar</Text>
				<View className="mt-8 gap-3">
					<TextInput
						value={email}
						onChangeText={setEmail}
						autoCapitalize="none"
						autoCorrect={false}
						keyboardType="email-address"
						placeholder="Email"
						placeholderTextColor="#737373"
						className="h-12 rounded-xl bg-neutral-900 border border-neutral-800 px-4 text-neutral-200"
					/>
					<TextInput
						value={password}
						onChangeText={setPassword}
						secureTextEntry
						autoCapitalize="none"
						placeholder="Senha"
						placeholderTextColor="#737373"
						className="h-12 rounded-xl bg-neutral-900 border border-neutral-800 px-4 text-neutral-200"
					/>
					{error ? <Text className="text-red-400">{error}</Text> : null}
					<Pressable
						onPress={handleSubmit}
						disabled={isSubmitting}
						className="h-12 items-center justify-center rounded-xl bg-amber-400"
					>
						<Text className="text-neutral-900 font-semibold">
							{isSubmitting ? 'Entrando...' : 'Entrar'}
						</Text>
					</Pressable>
				</View>
			</View>
		</View>
	)
}
