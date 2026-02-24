import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff'

export async function POST(req: Request) {
	const auth = await requireAuthToken()
	if (!auth.ok) return auth.res

	const body = await req.json().catch(() => null)
	const upstream = await fetch(
		`${getApiBaseUrl()}/api/stripe/subscription/intent`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${auth.token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body ?? {}),
			cache: 'no-store',
		},
	)

	return proxyJson(upstream)
}
