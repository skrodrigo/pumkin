import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff'
import { revalidateTag } from 'next/cache'

export async function PATCH(_req: Request, ctx: { params: Promise<{ id: string }> }) {
	const auth = await requireAuthToken()
	if (!auth.ok) return auth.res

	const { id } = await ctx.params
	const upstream = await fetch(`${getApiBaseUrl()}/api/chats/${id}/pin`, {
		method: 'PATCH',
		headers: { Authorization: `Bearer ${auth.token}` },
		cache: 'no-store',
	})

	const ok = upstream.ok
	const res = await proxyJson(upstream)
	if (ok) {
		revalidateTag('chats:list', {})
		revalidateTag(`chat:${id}`, {})
	}
	return res
}
