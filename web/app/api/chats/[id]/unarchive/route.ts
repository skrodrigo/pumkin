import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff'

export async function PATCH(_req: Request, ctx: { params: Promise<{ id: string }> }) {
	const auth = await requireAuthToken()
	if (!auth.ok) return auth.res

	const { id } = await ctx.params
	const upstream = await fetch(`${getApiBaseUrl()}/api/chats/${id}/unarchive`, {
		method: 'PATCH',
		headers: { Authorization: `Bearer ${auth.token}` },
		cache: 'no-store',
	})

	return proxyJson(upstream)
}
