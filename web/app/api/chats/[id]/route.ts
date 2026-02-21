import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthToken();
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params;
  const upstream = await fetch(`${getApiBaseUrl()}/api/chats/${id}`, {
    headers: { Authorization: `Bearer ${auth.token}` },
    cache: 'no-store',
  });

  return proxyJson(upstream);
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthToken();
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params;
  const upstream = await fetch(`${getApiBaseUrl()}/api/chats/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${auth.token}` },
    cache: 'no-store',
  });

  return proxyJson(upstream);
}
