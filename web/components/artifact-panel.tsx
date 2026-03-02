'use client'

import { Cancel01Icon } from '@hugeicons/core-free-icons'
import { Icon } from '@/components/ui/icon'
import type { Artifact } from '@/data/artifacts'
import { ArtifactRenderer } from './artifact-renderer'

interface ArtifactPanelProps {
	artifact: Artifact | null
	isOpen: boolean
	onClose: () => void
}

export function ArtifactPanel({ artifact, isOpen, onClose }: ArtifactPanelProps) {
	if (!isOpen || !artifact) return null

	return (
		<div className="fixed inset-y-0 right-0 z-50 w-[480px] max-w-[50vw] bg-background border-l shadow-xl transform transition-transform duration-300 ease-in-out">
			<div className="flex flex-col h-full">
				<div className="flex items-center justify-between p-4 border-b shrink-0">
					<div className="flex items-center gap-2 min-w-0">
						<span className="truncate">{artifact.title}</span>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 hover:bg-muted rounded-md transition-colors shrink-0"
					>
						<Icon icon={Cancel01Icon} className="size-5" />
					</button>
				</div>
				<div className="flex-1 overflow-y-auto p-4">
					{artifact.status === 'processing' ? (
						<div className="flex items-center justify-center h-40">
							<div className="flex flex-col items-center gap-3">
								<div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
								<p className="text-sm text-muted-foreground">Generating artifact...</p>
							</div>
						</div>
					) : artifact.status === 'failed' ? (
						<div className="flex items-center justify-center h-40">
							<p className="text-sm text-destructive">Failed to generate artifact</p>
						</div>
					) : (
						<ArtifactRenderer content={artifact.content} />
					)}
				</div>
			</div>
		</div>
	)
}
