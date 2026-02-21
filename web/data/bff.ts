import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export function getApiBaseUrl() {
  const url = process.env.NEXT_PUBLIC_API_URL;
  if (!url) throw new Error('Missing NEXT_PUBLIC_API_URL');
  return url;
}

export async function requireAuthToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value ?? null;
  if (!token) {
    return {
      ok: false as const,
      res: NextResponse.json({ error: 'Unauthorized', statusCode: 401 }, { status: 401 }),
    };
  }
  return { ok: true as const, token };
}

export async function proxyJson(upstream: Response) {
  const ct = upstream.headers.get('content-type') || '';
  const payload = ct.includes('application/json')
    ? await upstream.json().catch(() => null)
    : await upstream.text().catch(() => null);

  if (!upstream.ok) {
    const message = typeof payload === 'string'
      ? payload
      : payload?.error || `Upstream failed (${upstream.status})`;
    return NextResponse.json(
      { error: message, statusCode: upstream.status },
      { status: upstream.status }
    );
  }

  return NextResponse.json(payload, { status: 200 });
}

export function proxySse(upstream: Response) {
  const headers = new Headers();
  headers.set('Content-Type', upstream.headers.get('content-type') || 'text/event-stream');
  headers.set('Cache-Control', 'no-store, no-transform');
  headers.set('Connection', 'keep-alive');

  return new Response(upstream.body, { status: 200, headers });
}
