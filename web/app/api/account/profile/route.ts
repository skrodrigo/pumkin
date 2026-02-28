import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff'

export async function GET() {
	const auth = await requireAuthToken()
	if (!auth.ok) return auth.res

	const upstream = await fetch(`${getApiBaseUrl()}/api/account/profile`, {
		method: 'GET',
		headers: { Authorization: `Bearer ${auth.token}` },
		cache: 'no-store',
	})

	return proxyJson(upstream)
}

export async function PATCH(req: Request) {
	const auth = await requireAuthToken()
	if (!auth.ok) return auth.res

	const body = await req.text()

	const upstream = await fetch(`${getApiBaseUrl()}/api/account/profile`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${auth.token}`,
			'Content-Type': 'application/json',
		},
		body,
		cache: 'no-store',
	})

	return proxyJson(upstream)
}
