'use client'

import { HugeiconsIcon } from '@hugeicons/react'
import type { ComponentProps } from 'react'

type HugeiconsIconProps = ComponentProps<typeof HugeiconsIcon>

export function Icon(props: HugeiconsIconProps) {
	return (
		<HugeiconsIcon
			color={props.color ?? 'currentColor'}
			size={props.size ?? 20}
			strokeWidth={props.strokeWidth ?? 1.5}
			{...props}
		/>
	)
}
