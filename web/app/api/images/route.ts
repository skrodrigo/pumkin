import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff'

export async function GET(req: Request) {
	const auth = await requireAuthToken()
	if (!auth.ok) return auth.res

	const { searchParams } = new URL(req.url)
	const chatId = searchParams.get('chatId')
	const qs = chatId ? `?chatId=${encodeURIComponent(chatId)}` : ''

	const upstream = await fetch(`${getApiBaseUrl()}/api/images${qs}`, {
		headers: {
			Authorization: `Bearer ${auth.token}`,
		},
		cache: 'no-store',
	})

	return proxyJson(upstream)
}
