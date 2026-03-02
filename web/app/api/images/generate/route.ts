import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff'

export async function POST(req: Request) {
	const auth = await requireAuthToken()
	if (!auth.ok) return auth.res

	const body = await req.json().catch(() => null)
	if (!body) {
		return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
	}

	const upstream = await fetch(`${getApiBaseUrl()}/api/images/generate`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${auth.token}`,
			'Content-Type': 'application/json',
		},
		cache: 'no-store',
		body: JSON.stringify(body),
	})

	return proxyJson(upstream)
}
