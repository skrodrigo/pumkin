'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { Conversation, ConversationContent, ConversationScrollButton } from '@/components/ai-elements/conversation'
import { Loader } from '@/components/ai-elements/loader'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { Action, Actions } from '@/components/ai-elements/actions'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning'
import { Response } from '@/components/ai-elements/response'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip'
import {
	ArrowLeft02Icon,
	ArrowRight02Icon,
	Copy01Icon,
	Edit03Icon,
	ReloadIcon,
} from '@hugeicons/core-free-icons'
import type { UIMessage } from '@ai-sdk/react'
import { toast } from 'sonner'
import { toApiErrorPayload } from '@/data/api-error'
import { chatService } from '@/data/chat'
import { chatsService } from '@/data/chats'
import { useIsMobile } from '@/hooks/use-mobile'

interface ChatMessagesProps {
	chatId?: string
	activeBranchId: string | null
	canWebSearch: boolean
	isStreaming: boolean
	isTemporary: boolean
	messages: UIMessage[]
	model: string
	status: string
	webSearch: boolean
	setActiveBranchId: (branchId: string | null) => void
	setIsStreaming: (value: boolean) => void
	setMessages: (messages: UIMessage[] | ((prev: UIMessage[]) => UIMessage[])) => void
	regenerate: (args?: any) => void
	router: AppRouterInstance
}

export function ChatMessages({
	chatId,
	activeBranchId,
	canWebSearch,
	isStreaming,
	isTemporary,
	messages,
	model,
	status,
	webSearch,
	setActiveBranchId,
	setIsStreaming,
	setMessages,
	regenerate,
	router,
}: ChatMessagesProps) {
	const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
	const [editingText, setEditingText] = useState('')
	const editingTextareaRef = useRef<HTMLTextAreaElement | null>(null)
	const isMobile = useIsMobile()
	const loadedBranchMessageIdsRef = useRef<Set<string>>(new Set())
	const [messageBranches, setMessageBranches] = useState<
		Record<
			string,
			{
				options: any[]
				currentIndex: number
				currentBranchId: string
			}
		>
	>({})

	const toUiMessages = (rawMessages: any[]): UIMessage[] => {
		if (!Array.isArray(rawMessages)) return []
		return rawMessages
			.map((message) => {
				const content = message?.content
				const text =
					typeof content === 'string'
						? content
						: typeof content?.text === 'string'
							? content.text
							: typeof content?.content === 'string'
								? content.content
								: null

				if (!text || (message.role !== 'user' && message.role !== 'assistant')) {
					return null
				}

				return {
					id: message.id,
					role: message.role,
					parts: [{ type: 'text', text }],
				} as UIMessage
			})
			.filter(Boolean) as UIMessage[]
	}

	const ensureMessageBranchesLoaded = useCallback(
		async (messageId: string) => {
			if (!chatId) return
			if (messageBranches[messageId]) return
			if (loadedBranchMessageIdsRef.current.has(messageId)) return
			loadedBranchMessageIdsRef.current.add(messageId)
			try {
				const data = await chatsService.getMessageBranches(
					chatId,
					messageId,
					activeBranchId,
				)
				const options = Array.isArray(data?.options) ? data.options : []
				if (options.length <= 1) return
				setMessageBranches((prev) => ({
					...prev,
					[messageId]: {
						options,
						currentIndex:
							typeof data?.currentIndex === 'number'
								? data.currentIndex
								: 0,
						currentBranchId: data?.currentBranchId ?? '',
					},
				}))
			} catch {
			}
		},
		[activeBranchId, chatId, messageBranches],
	)

	const switchToBranch = async (
		branchId: string,
		sourceMessageId?: string,
		nextIndex?: number,
	) => {
		if (!chatId) return

		if (sourceMessageId && typeof nextIndex === 'number') {
			setMessageBranches((prev) => {
				const current = prev[sourceMessageId]
				if (!current) return prev
				return {
					...prev,
					[sourceMessageId]: {
						...current,
						currentIndex: nextIndex,
						currentBranchId: branchId,
					},
				}
			})
		}

		await chatsService.selectBranch(chatId, branchId)
		const payload = await chatsService.getById(chatId, branchId)
		const chat = payload?.data
		const nextMessages = toUiMessages(chat?.messages)
		setMessages(nextMessages)
		setActiveBranchId(chat?.activeBranchId ?? branchId)

		if (!sourceMessageId) return

		try {
			const data = await chatsService.getMessageBranches(
				chatId,
				sourceMessageId,
				chat?.activeBranchId ?? branchId,
			)
			const options = Array.isArray(data?.options) ? data.options : []
			if (options.length <= 1) return

			setMessageBranches((prev) => ({
				...prev,
				[sourceMessageId]: {
					options,
					currentIndex:
						typeof data?.currentIndex === 'number'
							? data.currentIndex
							: 0,
					currentBranchId:
						data?.currentBranchId ??
						(chat?.activeBranchId ?? branchId),
				},
			}))
		} catch {
		}
	}

	useEffect(() => {
		if (!isMobile) return
		if (!chatId) return
		const userMessages = messages.filter(
			(m) => m.role === 'user' && typeof m.id === 'string' && m.id.length > 0,
		)
		for (const message of userMessages) {
			void ensureMessageBranchesLoaded(message.id)
		}
	}, [chatId, ensureMessageBranchesLoaded, isMobile, messages])

	return (
		<div className="flex flex-col w-full mx-auto h-full">
			<div
				className="w-full max-w-3xl mx-auto flex-1 overflow-y-auto scrollbar-hidden"
				style={{
					scrollbarWidth: 'none',
					msOverflowStyle: 'none',
				}}
			>
				<Conversation className="relative size-full pt-12 pb-6">
					<ConversationContent>
						{messages.map((message: UIMessage, messageIndex: number) => {
							const messageStableId =
								message.id ?? `m-${messageIndex}`

							const assistantMessageText =
								message.parts
									?.filter((part: any) => part.type === 'text')
									.map(
										(part: any) =>
											(part as { text: string }).text,
									)
									.join('') || ''

							const userMessageText =
								message.parts
									?.filter((part: any) => part.type === 'text')
									.map(
										(part: any) =>
											(part as { text: string }).text,
									)
									.join('') || ''

							const isEmptyAssistantMessage =
								message.role === 'assistant' &&
								assistantMessageText.trim() === '' &&
								isStreaming

							if (isEmptyAssistantMessage) {
								return (
									<Loader
										key={message.id ?? `m-${messageIndex}`}
									/>
								)
							}

							return (
								<div key={messageStableId}>
									<Message
										from={message.role}
										key={`mi-${messageStableId}`}
									>
										<div
											className={
												message.role === 'user'
													? editingMessageId === messageStableId
														? 'flex w-full flex-col items-stretch'
														: 'flex flex-col items-end'
													: 'flex flex-col'
											}
										>
											<MessageContent
												className={
													editingMessageId === messageStableId
														? 'w-full mx-0 px-2 py-2'
														: undefined
												}
											>
												{message.parts?.map((part: any, i: number) => {
													switch (part.type) {
														case 'text': {
															const isLastMessage =
																messageIndex === messages.length - 1
															const isEditing =
																editingMessageId === messageStableId

															const syncEditingTextareaHeight = () => {
																const el = editingTextareaRef.current
																if (!el) return
																el.style.height = '0px'
																const next = Math.min(el.scrollHeight, 300)
																el.style.height = `${next}px`
															}

															const submitEdit = async () => {
																const nextText = editingText.trim()
																if (!nextText || isStreaming) return

																setEditingMessageId(null)
																setEditingText('')

																const updatedMessages = messages
																	.map((m, idx) => {
																		const stableId =
																			m.id ?? `m-${idx}`
																		if (stableId !== messageStableId) return m
																		const nextParts = (m.parts ?? []).map(
																			(p: any) =>
																				p.type === 'text'
																					? { ...p, text: nextText }
																					: p,
																		)
																		return { ...m, parts: nextParts }
																	})
																	.slice(0, messageIndex + 1)

																const assistantMessage: UIMessage = {
																	id: (Date.now() + 1).toString(),
																	role: 'assistant',
																	parts: [{ type: 'text', text: '' }],
																}

																setMessages([
																	...updatedMessages,
																	assistantMessage,
																])
																setIsStreaming(true)

																try {
																	let accumulatedText = ''
																	let createdChatId: string | null = null

																	const streamFn = isTemporary
																		? chatService.streamTemporaryChat
																		: chatService.streamChat

																	await streamFn({
																		body: {
																			messages: updatedMessages,
																			model,
																			webSearch: canWebSearch
																				? webSearch
																				: false,
																			chatId,
																			branchId: activeBranchId,
																			isEdit: true,
																			lastMessageId: messageStableId,
																		},
																		onEvent: (ev) => {
																			if (ev.type === 'chat.created') {
																				createdChatId = ev.chatId
																				if (typeof ev.branchId === 'string') {
																					setActiveBranchId(ev.branchId)
																				}
																			}

																			if (ev.type === 'response.output_text.delta') {
																				accumulatedText += ev.delta
																				setMessages((prev: UIMessage[]) =>
																					prev.map((msg: UIMessage) =>
																						msg.id === assistantMessage.id
																							? {
																								...msg,
																								parts: [
																									{ type: 'text', text: accumulatedText },
																								],
																							}
																							: msg,
																					),
																				)
																			}

																			if (ev.type === 'response.error') {
																				throw new Error(ev.error)
																			}
																		},
																	})

																	setIsStreaming(false)

																	if (!chatId && !isTemporary && createdChatId) {
																		router.push(`/chat/${createdChatId}`)
																	}
																} catch (error) {
																	setIsStreaming(false)
																	setMessages((prev: UIMessage[]) => prev.slice(0, -1))
																	toast.error(toApiErrorPayload(error).error)
																}
															}

															const cancelEdit = () => {
																setEditingMessageId(null)
																setEditingText('')
															}

															return (
																<div key={`${messageStableId}-${i}`}>
																	{isEditing ? (
																		<div className="w-full">
																			<div className="w-full rounded-3xl bg-muted/60 px-3 py-2">
																				<textarea
																					ref={editingTextareaRef}
																					value={editingText}
																					onChange={(e) => {
																						setEditingText(e.target.value)
																						syncEditingTextareaHeight()
																					}}
																					onFocus={syncEditingTextareaHeight}
																					className="max-h-[300px] w-full resize-none overflow-y-auto bg-transparent text-sm outline-none"
																					rows={1}
																					autoFocus
																				/>
																			</div>
																			<div className="mt-2 flex justify-end gap-2">
																				<Button
																					size="sm"
																					variant="secondary"
																					onClick={cancelEdit}
																				>
																					Cancelar
																				</Button>
																				<Button
																					size="sm"
																					onClick={submitEdit}
																					disabled={!editingText.trim()}
																				>
																					Enviar
																				</Button>
																			</div>
																		</div>
																	) : (
																		<div className="group">
																			<Response>{part.text}</Response>
																		</div>
																	)}
																	{message.role === 'assistant' &&
																		isLastMessage &&
																		part.text && (
																			<Actions className="mt-2">
																				<Action
																					onClick={() =>
																						regenerate({
																							body: {
																								model,
																								webSearch,
																								chatId,
																							},
																						})
																					}
																					tooltip="Tentar novamente"
																					label="Retry"
																				>
																					<Icon
																						icon={ReloadIcon}
																						className="size-4"
																					/>
																				</Action>
																				<Action
																					onClick={() =>
																						navigator.clipboard.writeText(part.text)
																					}
																					tooltip="Copiar"
																					label="Copy"
																				>
																					<Icon
																						icon={Copy01Icon}
																						className="size-4"
																					/>
																				</Action>
																			</Actions>
																		)}
																</div>
															)
														}
														case 'reasoning':
															return (
																<Reasoning
																	key={`${message.id}-${i}`}
																	className="w-full"
																	isStreaming={status === 'streaming'}
																>
																	<ReasoningTrigger />
																	<ReasoningContent>
																		{part.text}
																	</ReasoningContent>
																</Reasoning>
															)
														default:
															return null
													}
												})}
											</MessageContent>
											{message.role === 'user' &&
												editingMessageId !== messageStableId &&
												userMessageText.trim() && (
													<div
														className={
															isMobile
																? 'my-1 opacity-100'
																: 'my-1 opacity-0 transition-opacity group-hover:opacity-100'
														}
														onMouseEnter={() => {
															if (isMobile) return
															if (!chatId) return
															void ensureMessageBranchesLoaded(messageStableId)
														}}
														onPointerDown={() => {
															if (!isMobile) return
															if (!chatId) return
															void ensureMessageBranchesLoaded(messageStableId)
														}}
													>
														<Actions>
															<Action
																onClick={() => {
																	setEditingMessageId(messageStableId)
																	setEditingText(userMessageText)
																	setTimeout(() => {
																		const el = editingTextareaRef.current
																		if (!el) return
																		el.style.height = '0px'
																		const next = Math.min(el.scrollHeight, 300)
																		el.style.height = `${next}px`
																	}, 0)
																}}
																tooltip="Editar"
																label="Edit"
															>
																<Icon
																	icon={Edit03Icon}
																	className="size-4"
																/>
															</Action>
															<Action
																onClick={() =>
																	navigator.clipboard.writeText(userMessageText)
																}
																tooltip="Copiar"
																label="Copy"
															>
																<Icon
																	icon={Copy01Icon}
																	className="size-4"
																/>
															</Action>
															{chatId &&
																messageBranches[messageStableId] &&
																(messageBranches[messageStableId].options
																	?.length ?? 0) > 1 && (
																	<TooltipProvider >
																		<div className="flex items-center gap-1">
																			<Tooltip >
																				<TooltipTrigger asChild >
																					<button
																						onClick={async () => {
																							const branchState =
																								messageBranches[messageStableId]
																							const nextIndex =
																								branchState.currentIndex - 1
																							if (nextIndex < 0) return
																							const nextBranchId =
																								branchState.options[nextIndex]
																									?.branchId
																							if (!nextBranchId) return
																							await switchToBranch(
																								nextBranchId,
																								messageStableId,
																								nextIndex,
																							)
																						}}
																						disabled={
																							messageBranches[messageStableId]
																								.currentIndex === 0
																						}
																						className="p-1 rounded-full hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
																					>
																						<Icon
																							icon={ArrowLeft02Icon}
																							className="size-4"
																						/>
																					</button>
																				</TooltipTrigger>
																				<TooltipContent side="bottom" sideOffset={6}>Anterior</TooltipContent>
																			</Tooltip>
																			<span className="text-xs text-muted-foreground min-w-[3ch] text-center">
																				{messageBranches[messageStableId].currentIndex + 1}/
																				{messageBranches[messageStableId].options.length}
																			</span>
																			<Tooltip>
																				<TooltipTrigger asChild>
																					<button
																						onClick={async () => {
																							const branchState =
																								messageBranches[messageStableId]
																							const nextIndex =
																								branchState.currentIndex + 1
																							if (nextIndex >= branchState.options.length) return
																							const nextBranchId =
																								branchState.options[nextIndex]
																									?.branchId
																							if (!nextBranchId) return
																							await switchToBranch(
																								nextBranchId,
																								messageStableId,
																								nextIndex,
																							)
																						}}
																						disabled={
																							messageBranches[messageStableId]
																								.currentIndex ===
																							messageBranches[messageStableId]
																								.options.length - 1
																						}
																						className="p-1 rounded-full hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
																					>
																						<Icon
																							icon={ArrowRight02Icon}
																							className="size-4"
																						/>
																					</button>
																				</TooltipTrigger>
																				<TooltipContent side="bottom" sideOffset={6}>Próxima</TooltipContent>
																			</Tooltip>
																		</div>
																	</TooltipProvider>
																)}
														</Actions>
													</div>
												)}
										</div>
									</Message>
								</div>
							)
						})}
						{status === 'submitted' && <Loader />}
					</ConversationContent>
					<ConversationScrollButton />
				</Conversation>
			</div>
		</div>
	)
}
