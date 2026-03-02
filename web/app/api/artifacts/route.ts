import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff'

export async function GET(req: Request) {
	const auth = await requireAuthToken()
	if (!auth.ok) return auth.res

	const { searchParams } = new URL(req.url)
	const chatId = searchParams.get('chatId')

	if (!chatId) {
		return Response.json({ error: 'chatId is required' }, { status: 400 })
	}

	const upstream = await fetch(`${getApiBaseUrl()}/api/artifacts?chatId=${chatId}`, {
		headers: {
			Authorization: `Bearer ${auth.token}`,
		},
		cache: 'no-store',
	})

	return proxyJson(upstream)
}
