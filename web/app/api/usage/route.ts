import { NextResponse } from 'next/server';
import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff';

export async function GET() {
  const auth = await requireAuthToken();
  if (!auth.ok) return auth.res;

  const upstream = await fetch(`${getApiBaseUrl()}/api/usage`, {
    headers: { Authorization: `Bearer ${auth.token}` },
    cache: 'no-store',
  });

  return proxyJson(upstream);
}

export async function POST(req: Request) {
  const auth = await requireAuthToken();
  if (!auth.ok) return auth.res;

  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  if (action !== 'increment') {
    return NextResponse.json({ error: 'Unsupported action', statusCode: 400 }, { status: 400 });
  }

  const upstream = await fetch(`${getApiBaseUrl()}/api/usage/increment`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.token}` },
    cache: 'no-store',
  });

  return proxyJson(upstream);
}
