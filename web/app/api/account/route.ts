import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff'

export async function DELETE() {
	const auth = await requireAuthToken()
	if (!auth.ok) return auth.res

	const upstream = await fetch(`${getApiBaseUrl()}/api/account`, {
		method: 'DELETE',
		headers: { Authorization: `Bearer ${auth.token}` },
		cache: 'no-store',
	})

	return proxyJson(upstream)
}
