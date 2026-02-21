import { NextResponse } from 'next/server';
import { getApiBaseUrl, proxyJson, proxySse, requireAuthToken } from '@/data/bff';

export async function POST(req: Request) {
  const auth = await requireAuthToken();
  if (!auth.ok) return auth.res;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body', statusCode: 400 }, { status: 400 });
  }

  const upstream = await fetch(`${getApiBaseUrl()}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${auth.token}`,
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  if (!upstream.ok) {
    return proxyJson(upstream);
  }

  return proxySse(upstream);
}
