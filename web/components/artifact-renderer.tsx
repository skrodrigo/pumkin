'use client'

import { useState } from 'react'
import { Response } from '@/components/ai-elements/response'
import { Streamdown } from 'streamdown';

interface ArtifactRendererProps {
	content: any
}

interface ChecklistItem {
	text: string
	checked: boolean
}

function parseChecklist(content: string): ChecklistItem[] | null {
	const lines = content.split('\n')
	const items: ChecklistItem[] = []

	for (const line of lines) {
		const match = line.match(/^[\s]*-\s*\[([ x])\]\s*(.+)$/i)
		if (match) {
			items.push({
				checked: match[1].toLowerCase() === 'x',
				text: match[2].trim(),
			})
		}
	}

	return items.length > 0 ? items : null
}

function InteractiveChecklist({ items }: { items: ChecklistItem[] }) {
	const [checklist, setChecklist] = useState(items)

	const toggleItem = (index: number) => {
		setChecklist((prev) =>
			prev.map((item, i) =>
				i === index ? { ...item, checked: !item.checked } : item
			)
		)
	}

	return (
		<div className="space-y-1">
			{checklist.map((item, index) => (
				<label
					key={index}
					className="flex items-start gap-2 p-1.5 rounded cursor-pointer"
				>
					<input
						type="checkbox"
						checked={item.checked}
						onChange={() => toggleItem(index)}
						className="mt-0.5 accent-primary"
					/>
					<span className={`text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
						{item.text}
					</span>
				</label>
			))}
		</div>
	)
}

export function ArtifactRenderer({ content }: ArtifactRendererProps) {
	const text = typeof content === 'string'
		? content
		: typeof content === 'object' && content !== null && 'raw' in content && typeof content.raw === 'string'
			? content.raw
			: JSON.stringify(content, null, 2)

	const checklistItems = parseChecklist(text)

	if (checklistItems) {
		return <InteractiveChecklist items={checklistItems} />
	}

	return (
		<Response className="text-sm">
			{text}
		</Response>
	)
}
