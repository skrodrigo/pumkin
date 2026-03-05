export type ApiErrorPayload = {
	readonly statusCode: number
	readonly error: string
}

export type ApiResult<T> = {
	readonly success: boolean
	readonly data: T
}

type FetchJsonParams = {
	readonly path: string
	readonly token?: string
	readonly method?: string
	readonly body?: unknown
}

function getApiBaseUrl() {
	const raw = process.env.EXPO_PUBLIC_API_BASE_URL
	if (typeof raw === 'string' && raw.length > 0) return raw.replace(/\/+$/, '')
	return 'http://localhost:3001'
}

async function toJsonOrNull(res: Response) {
	try {
		return await res.json()
	} catch {
		return null
	}
}

export async function fetchJson<T>({
	path,
	token,
	method,
	body,
}: FetchJsonParams): Promise<T> {
	const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`
	const res = await fetch(url, {
		method: method ?? (body ? 'POST' : 'GET'),
		headers: {
			...(body ? { 'Content-Type': 'application/json' } : {}),
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
		body: body ? JSON.stringify(body) : undefined,
	})

	const parsed = await toJsonOrNull(res)
	if (!res.ok) {
		const code = parsed?.statusCode ?? res.status
		const error = parsed?.error ?? parsed?.message ?? `Request failed (${code})`
		throw new Error(JSON.stringify({ statusCode: code, error } satisfies ApiErrorPayload))
	}

	return (parsed ?? ({} as T)) as T
}

export function getNativeApiBaseUrl() {
	return getApiBaseUrl()
}
