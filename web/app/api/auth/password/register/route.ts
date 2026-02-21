import { getApiBaseUrl, proxyJson } from '@/data/bff';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const upstream = await fetch(`${getApiBaseUrl()}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body ?? {}),
    cache: 'no-store',
  });

  return proxyJson(upstream);
}
