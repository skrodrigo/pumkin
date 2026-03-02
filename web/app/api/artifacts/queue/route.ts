import { requireAuthToken } from '@/data/bff'
import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@upstash/qstash'

const qstashClient = process.env.QSTASH_TOKEN ? new Client({
	token: process.env.QSTASH_TOKEN,
}) : null

export async function POST(req: NextRequest) {
	const auth = await requireAuthToken()
	if (!auth.ok) {
		return auth.res
	}

	try {
		const body = await req.json()
		const apiUrl = process.env.API_BASE_URL || 'http://localhost:3001'

		if (!qstashClient || process.env.NODE_ENV === 'development') {
			console.log('[API/artifacts/queue] Development mode: calling backend directly')

			const res = await fetch(`${apiUrl}/api/artifacts/process`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-source': 'nextjs-direct',
				},
				body: JSON.stringify(body),
			})

			if (!res.ok) {
				const error = await res.json().catch(() => ({ error: 'Backend error' }))
				console.error('[API/artifacts/queue] Backend error:', error)
				return NextResponse.json(
					{ error: 'Failed to process artifact', details: error.error },
					{ status: 500 }
				)
			}

			const result = await res.json()
			console.log('[API/artifacts/queue] Direct backend result:', result)
			return NextResponse.json({ success: true, result })
		}

		console.log('[API/artifacts/queue] Publishing to QStash:', body)

		const result = await qstashClient.publishJSON({
			url: `${apiUrl}/api/artifacts/process`,
			body,
		})

		console.log('[API/artifacts/queue] QStash result:', result)

		return NextResponse.json({ success: true, messageId: result.messageId })
	} catch (error: any) {
		console.error('[API/artifacts/queue] Error details:', {
			message: error?.message,
			stack: error?.stack,
			cause: error?.cause,
			name: error?.name,
		})
		return NextResponse.json(
			{ error: 'Failed to queue artifact', details: error?.message },
			{ status: 500 }
		)
	}
}
