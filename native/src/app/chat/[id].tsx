import { StatusBar } from 'expo-status-bar'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	Text,
	TextInput,
	View,
	FlatList,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../../context/auth.context'
import { chatService, type ChatStreamEvent } from '../../data/chat'
import { chatsService } from '../../data/chats'

type ChatMessage = {
	readonly id: string
	readonly role: 'user' | 'assistant'
	readonly text: string
}

type ChatPayload = {
	readonly id: string
	readonly title: string
	readonly model?: string | null
	readonly activeBranchId?: string | null
	readonly messages?: ReadonlyArray<{
		readonly id: string
		readonly role: 'user' | 'assistant'
		readonly content: any
	}>
}

type ApiMessage = {
	readonly role: 'user' | 'assistant'
	readonly parts: ReadonlyArray<{ readonly type: 'text'; readonly text: string }>
}

function getMessageText(content: any) {
	if (!content) return ''
	if (typeof content === 'string') return content
	if (typeof content?.text === 'string') return content.text
	if (typeof content?.type === 'string' && content.type === 'text') {
		return typeof content?.text === 'string' ? content.text : ''
	}
	return ''
}

function toChatMessages(payload: ChatPayload | null): ChatMessage[] {
	const raw = Array.isArray(payload?.messages) ? payload?.messages : []
	return raw
		.map((m) => {
			const role = m?.role === 'assistant' ? 'assistant' : 'user'
			return {
				id: typeof m?.id === 'string' ? m.id : `${Date.now()}-${Math.random()}`,
				role,
				text: getMessageText(m?.content),
			} satisfies ChatMessage
		})
		.filter((m) => m.text.length > 0)
}

function toApiMessages(messages: ReadonlyArray<ChatMessage>): ApiMessage[] {
	return messages
		.map((m) => ({
			role: m.role,
			parts: [{ type: 'text', text: m.text }],
		}))
		.filter((m) => m.parts[0]?.text.trim().length)
}

function parseApiError(error: unknown) {
	if (error instanceof Error) {
		try {
			const parsed = JSON.parse(error.message)
			if (typeof parsed?.error === 'string') return parsed.error
		} catch {
		}
		return error.message
	}
	return 'Unknown error'
}

export default function ChatScreen() {
	const { id } = useLocalSearchParams<{ readonly id: string }>()
	const { token } = useAuth()
	const insets = useSafeAreaInsets()

	const [chatTitle, setChatTitle] = React.useState('')
	const [activeBranchId, setActiveBranchId] = React.useState<string | null>(null)
	const [messages, setMessages] = React.useState<ChatMessage[]>([])
	const [input, setInput] = React.useState('')
	const [isLoading, setIsLoading] = React.useState(true)
	const [isStreaming, setIsStreaming] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)

	const reloadChat = React.useCallback(async () => {
		if (!token) return
		if (!id) return

		setError(null)
		setIsLoading(true)
		try {
			const payload = await chatsService.getById({ token, id })
			const chat = (payload as any)?.data as ChatPayload | undefined
			setChatTitle(typeof chat?.title === 'string' ? chat.title : '')
			setActiveBranchId(typeof chat?.activeBranchId === 'string' ? chat.activeBranchId : null)
			setMessages(toChatMessages(chat ?? null))
		} catch (err) {
			setError(parseApiError(err))
		} finally {
			setIsLoading(false)
		}
	}, [id, token])

	React.useEffect(() => {
		void reloadChat()
	}, [reloadChat])

	const handleSend = React.useCallback(async () => {
		if (isStreaming) return
		if (!token) return
		if (!id) return

		const text = input.trim()
		if (!text) return

		setInput('')
		setError(null)
		setIsStreaming(true)

		const userMessage: ChatMessage = {
			id: `local-user-${Date.now()}`,
			role: 'user',
			text,
		}

		const assistantMessageId = `local-assistant-${Date.now()}`
		const assistantMessage: ChatMessage = {
			id: assistantMessageId,
			role: 'assistant',
			text: '',
		}

		const snapshotBefore = messages
		const nextLocalMessages = [...snapshotBefore, userMessage, assistantMessage]
		setMessages(nextLocalMessages)

		let accumulatedText = ''
		let nextBranchId: string | null = activeBranchId

		try {
			await chatService.streamChat({
				token,
				body: {
					messages: toApiMessages([...snapshotBefore, userMessage]),
					chatId: id,
					branchId: activeBranchId,
				},
				onEvent: (ev: ChatStreamEvent) => {
					if (ev.type === 'chat.created') {
						if (typeof ev.branchId === 'string') {
							nextBranchId = ev.branchId
							setActiveBranchId(ev.branchId)
						}
						if (typeof ev.assistantMessageId === 'string') {
							const newId = ev.assistantMessageId
							setMessages((prev) =>
								prev.map((m) => (m.id === assistantMessageId ? { ...m, id: newId } : m)),
							)
						}
					}

					if (ev.type === 'response.output_text.delta') {
						accumulatedText += ev.delta
						setMessages((prev) =>
							prev.map((m) =>
								m.id === assistantMessageId
									? { ...m, text: accumulatedText }
									: m,
							),
						)
					}

					if (ev.type === 'response.completed') {
						if (typeof ev.branchId === 'string') {
							nextBranchId = ev.branchId
							setActiveBranchId(ev.branchId)
						}
					}

					if (ev.type === 'response.error') {
						throw new Error(ev.error)
					}
				},
			})

			setIsStreaming(false)

			try {
				const payload = await chatsService.getById({
					token,
					id,
					branchId: nextBranchId,
				})
				const chat = (payload as any)?.data as ChatPayload | undefined
				setMessages(toChatMessages(chat ?? null))
				setActiveBranchId(typeof chat?.activeBranchId === 'string' ? chat.activeBranchId : nextBranchId)
			} catch {
			}
		} catch (err) {
			setIsStreaming(false)
			setError(parseApiError(err))
			setMessages((prev) => prev.filter((m) => m.id !== userMessage.id && m.id !== assistantMessageId))
		}
	}, [activeBranchId, id, input, isStreaming, token])

	return (
		<View className="flex-1 bg-neutral-950" style={{ paddingTop: insets.top }}>
			<StatusBar style="light" />

			<View className="px-4 py-3 border-b border-neutral-900">
				<Text className="text-neutral-200 text-lg font-semibold" numberOfLines={1}>
					{chatTitle || 'Chat'}
				</Text>
				{error ? <Text className="text-red-400 mt-1">{error}</Text> : null}
			</View>

			<View className="flex-1 px-4">
				{isLoading ? (
					<View className="flex-1 items-center justify-center">
						<Text className="text-neutral-400">Carregando...</Text>
					</View>
				) : (
					<FlatList
						data={messages}
						keyExtractor={(item) => item.id}
						renderItem={({ item }) => (
							<View className={item.role === 'user' ? 'py-2 items-end' : 'py-2 items-start'}>
								<View
									className={
										item.role === 'user'
											? 'max-w-[85%] rounded-2xl bg-neutral-900 border border-neutral-800 px-4 py-3'
											: 'max-w-[85%] rounded-2xl bg-neutral-950 border border-neutral-900 px-4 py-3'
									}
								>
									<Text className="text-neutral-200">{item.text}</Text>
								</View>
							</View>
						)}
						contentContainerStyle={{ paddingVertical: 12 }}
						keyboardShouldPersistTaps="handled"
					/>
				)}
			</View>

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
			>
				<View className="px-4 pt-3 pb-4 border-t border-neutral-900">
					<View className="flex-row items-end gap-2">
						<View className="flex-1 rounded-2xl bg-neutral-900 border border-neutral-800 px-4 py-3">
							<TextInput
								value={input}
								onChangeText={setInput}
								placeholder="Digite sua mensagem"
								placeholderTextColor="#737373"
								className="text-neutral-200"
								multiline
								editable={!isStreaming}
							/>
						</View>

						<Pressable
							disabled={isStreaming || input.trim().length === 0}
							onPress={() => {
								void handleSend()
							}}
							className={
								isStreaming || input.trim().length === 0
									? 'h-12 w-12 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 opacity-40'
									: 'h-12 w-12 items-center justify-center rounded-full bg-amber-500'
							}
						>
							<Text className={isStreaming || input.trim().length === 0 ? 'text-neutral-200' : 'text-neutral-950 font-semibold'}>
								↑
							</Text>
						</Pressable>
					</View>
				</View>
			</KeyboardAvoidingView>
		</View>
	)
}
