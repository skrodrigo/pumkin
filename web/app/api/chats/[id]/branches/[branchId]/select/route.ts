import { getApiBaseUrl, proxyJson, requireAuthToken } from '@/data/bff';
import { revalidateTag } from 'next/cache';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; branchId: string }> }
) {
  const auth = await requireAuthToken();
  if (!auth.ok) return auth.res;

  const { id, branchId } = await params;

  const upstream = await fetch(
    `${getApiBaseUrl()}/api/chats/${id}/branches/${branchId}/select`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${auth.token}` },
      cache: 'no-store',
    }
  );

  const ok = upstream.ok
  const res = await proxyJson(upstream)
  if (ok) {
    revalidateTag('chats:list', {})
    revalidateTag(`chat:${id}`, {})
  }
  return res
}
