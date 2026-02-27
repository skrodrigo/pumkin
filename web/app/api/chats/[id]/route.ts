import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff';

export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthToken();
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params;
  const url = new URL(req.url);
  const branchId = url.searchParams.get('branchId');
  const upstreamUrl = new URL(`${getApiBaseUrl()}/api/chats/${id}`);
  if (branchId) upstreamUrl.searchParams.set('branchId', branchId);

  const upstream = await fetch(upstreamUrl.toString(), {
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
