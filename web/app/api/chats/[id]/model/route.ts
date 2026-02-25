import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff'

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
	const auth = await requireAuthToken()
	if (!auth.ok) return auth.res

	const { id } = await ctx.params
	const body = await req.json()
	const upstream = await fetch(`${getApiBaseUrl()}/api/chats/${id}/model`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${auth.token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
		cache: 'no-store',
	})

	return proxyJson(upstream)
}
