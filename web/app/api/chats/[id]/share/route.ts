import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff';
import { revalidateTag } from 'next/cache';

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAuthToken();
  if (!auth.ok) return auth.res;

  const { id } = await ctx.params;
  const upstream = await fetch(`${getApiBaseUrl()}/api/chats/${id}/share`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${auth.token}` },
    cache: 'no-store',
  });

  const ok = upstream.ok
  const res = await proxyJson(upstream)
  if (ok) {
    revalidateTag(`chat:${id}`, {})
  }
  return res
}
