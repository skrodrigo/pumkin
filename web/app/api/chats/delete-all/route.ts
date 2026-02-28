import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff'
import { revalidateTag } from 'next/cache'

export async function DELETE() {
	const auth = await requireAuthToken()
	if (!auth.ok) return auth.res

	const upstream = await fetch(`${getApiBaseUrl()}/api/chats/delete-all`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${auth.token}` },
		cache: 'no-store',
	})

	const ok = upstream.ok
	const res = await proxyJson(upstream)
	if (ok) {
		revalidateTag('chats:list', {})
		revalidateTag('chats:list:archived', {})
	}
	return res
}
