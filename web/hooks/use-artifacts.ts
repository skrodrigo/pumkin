'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { artifactService, type Artifact } from '@/data/artifacts'

interface UseArtifactsOptions {
	chatId?: string
	enabled?: boolean
}

interface UseArtifactsReturn {
	artifacts: Artifact[]
	isLoading: boolean
	selectedArtifact: Artifact | null
	setSelectedArtifact: (artifact: Artifact | null) => void
	isPanelOpen: boolean
	openPanel: (artifact: Artifact) => void
	closePanel: () => void
	processingCount: number
}

export function useArtifacts({ chatId, enabled = true }: UseArtifactsOptions): UseArtifactsReturn {
	const [artifacts, setArtifacts] = useState<Artifact[]>([])
	const [isLoading, setIsLoading] = useState(false)
	const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null)
	const [isPanelOpen, setIsPanelOpen] = useState(false)
	const intervalRef = useRef<NodeJS.Timeout | null>(null)

	const processingCount = artifacts.filter(a => a.status === 'processing').length
	const hasProcessing = processingCount > 0

	const fetchArtifacts = useCallback(async () => {
		if (!chatId) return
		setIsLoading(true)
		try {
			const data = await artifactService.getArtifactsByChatId(chatId)
			setArtifacts(data)
		} catch (error) {
			console.error('Failed to fetch artifacts:', error)
		} finally {
			setIsLoading(false)
		}
	}, [chatId])

	useEffect(() => {
		if (!enabled || !chatId) return

		fetchArtifacts()

		const startPolling = () => {
			if (intervalRef.current) return
			intervalRef.current = setInterval(() => {
				fetchArtifacts()
			}, 3000)
		}

		const stopPolling = () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
				intervalRef.current = null
			}
		}

		startPolling()

		return () => stopPolling()
	}, [chatId, enabled, fetchArtifacts])

	useEffect(() => {
		if (!intervalRef.current) return

		if (!hasProcessing) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}
	}, [hasProcessing])

	const openPanel = useCallback((artifact: Artifact) => {
		setSelectedArtifact(artifact)
		setIsPanelOpen(true)
	}, [])

	const closePanel = useCallback(() => {
		setIsPanelOpen(false)
		setTimeout(() => setSelectedArtifact(null), 300)
	}, [])

	return {
		artifacts,
		isLoading,
		selectedArtifact,
		setSelectedArtifact,
		isPanelOpen,
		openPanel,
		closePanel,
		processingCount,
	}
}
